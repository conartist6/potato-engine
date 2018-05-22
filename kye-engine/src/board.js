import { Seq } from 'immutable';
import makeEmitter from 'event-emitter';
import invariant from 'invariant';
import allOff from 'event-emitter/all-off';
import range from 'lodash/range';
import Prando from 'prando';
import EntityList from './entity-list';

import {
  aligned,
  at,
  setAt,
  inBoard,
  copyCoords,
  directions,
  getDeflections,
  directionsByOrientation,
  leftOf,
  rightOf,
  flip,
  moveCoordsInDirection,
  randomDirection,
} from './directions';

import entities from './entities';

function findEntities(board, cb) {
  return board.reduce(
    (entities, row, y) =>
      row.reduce((entities, entity, x) => {
        cb(entity) && entities.push(entity);
        return entities;
      }, entities),
    [],
  );
}

function array2d(dimensions, initialValue) {
  const { height, width } = dimensions;
  const arr = new Array(height);
  for (let i = 0; i < height; i++) {
    arr[i] = new Array(width);
    for (let j = 0; j < width; j++) {
      arr[i][j] = initialValue;
    }
  }
  return arr;
}

const recordingDirectionSymbols = {
  LEFT: 'l',
  UP: 'u',
  RIGHT: 'r',
  DOWN: 'd',
};

export default class Board {
  constructor(level, dimensions, options) {
    const getState = options.getState || (() => {});
    this.dimensions = dimensions;
    if (options.record) {
      this.recording = [];
    }

    this._random = new Prando(level.seed);

    this._entityApi = Object.freeze({
      getState,
      random: this._random,
      emit: () => this._reemit,
      ...Seq.Indexed([
        'seek',
        'shove',
        'move',
        'eat',
        'replace',
        'at',
        'setAt',
        'once',
        'spiralSearch',
      ])
        .toSetSeq()
        .toMap()
        .map(method => this[method].bind(this))
        .toObject(),
    });

    const player = findEntities(level.board, s => s instanceof entities.Player)[0];
    // Throughout the game, entities must be allowed to act in the order they
    // originally appeared in the level file in a RTL reading order.
    // Player is first; spawned entities are pushed to the end.
    this._entityList = new EntityList(
      [
        player,
        ...findEntities(
          level.board,
          e =>
            e != null &&
            !(e.isStatic || e instanceof entities.Player || e instanceof entities.Field),
        ),
      ],
      { board: this._entityApi },
    );
    this._board = array2d(dimensions, null);
    for (const entity of this._entityList) {
      const [x, y] = entity.coords;
      this._board[y][x] = entity;
    }
    this._statics = findEntities(level.board, s => s && s.isStatic);
    for (const staticEntity of this._statics) {
      const [x, y] = staticEntity.coords;
      this._board[y][x] = staticEntity;
    }
    this._fieldsList = findEntities(level.board, s => s instanceof entities.Field).map(field => {
      const [x, y] = field.coords;
      return field.cloneWithState({ key: `${x},${y}`, board: this._entityApi });
    });
    this._fields = array2d(dimensions, null);
    for (const field of this._fieldsList) {
      const [x, y] = field.coords;
      this._fields[y][x] = field;
    }

    this._magnetization = array2d(dimensions, 0);
    this._tickCounter = 0;
    this._ate = null;
    this._shoved = null;
    this._dryRun = null;
    this._paused = true;
    this._emit = this.emit;
    this.emit = undefined;
    const magnets = findEntities(this._board, s => s instanceof entities.Magnet);
    for (const magnet of magnets) {
      this._trackMagnet(magnet);
    }

    this._spawn = [...player.coords];

    this._iteratorObjects = range(this.dimensions.width * this.dimensions.height).map(i =>
      this._initializeIteratorObject({}),
    );
  }

  start(event, listener) {
    this._paused = false;
    this.on('tick', () => {
      this._setTickTimeout();
    });
    this.on(event, listener);
    this._setTickTimeout();
    this._emit('start');
  }

  setPaused(paused) {
    this._paused = paused;
    if (!this._paused) {
      this.tick();
    }
  }

  end() {
    this._clearTickTimeout();
    this._emit('end');
    allOff(this);
  }

  _setTickTimeout() {
    this._clearTickTimeout();
    if (!this._paused) {
      this._tickTimeout = setTimeout(() => this.tick(), 100);
    }
  }

  _clearTickTimeout() {
    if (this._tickTimeout) {
      clearTimeout(this._tickTimeout);
    }
    this._tickTimeout = null;
  }

  tick(playerDirection) {
    const scheduled = !playerDirection;

    for (const entity of this._entityList) {
      if (entity instanceof entities.Player) {
        if (playerDirection) {
          this.move(this.getPlayer(), playerDirection);
        }
      }
      let sleeping = !(
        this._tickCounter % entity.frequency === 0 ||
        (!scheduled && entity.opportunistic)
      ); // not every entity thinks every tick
      if (!sleeping) {
        sleeping = this._theMagneticFields(entity); // stuck entities can't think
      }
      if (entity.think && !sleeping) {
        entity.think(this._entityApi, entities);
      }
    }

    this._entityList.purge();

    this._tickCounter = (this._tickCounter + 1) % 105;
    if (this.recording) {
      if (playerDirection) {
        this.recording.push(recordingDirectionSymbols[playerDirection]);
      } else {
        if (typeof this.recording[this.recording.length - 1] === 'number') {
          this.recording[this.recording.length - 1]++;
        } else {
          this.recording.push(1);
        }
      }
    }

    this._emit('tick');
  }

  at(coords, direction = null, distance = 1) {
    return (
      at(this._board, coords, direction, distance) || at(this._fields, coords, direction, distance)
    );
  }

  setAt(coords, newEntity, direction = null, distance = 1) {
    setAt(this._board, coords, newEntity, direction, distance);
  }

  getPlayer() {
    return this._entityList.getPlayer(0);
  }

  respawnPlayer() {
    const coords = this.spiralSearch(this._spawn, coords => this.at(coords) === null);
    const { Player } = entities;
    const newPlayer = this._entityList.set(0, new Player(coords));
    this.setAt(coords, newPlayer);
  }

  seek(entity) {
    const [x, y] = entity.coords;
    const [px, py] = this.getPlayer().coords;
    const dx = x - px;
    const dy = y - py;
    const xDist = Math.abs(dx);
    const yDist = Math.abs(dy);
    let direction;
    if (xDist > yDist) {
      direction = directionsByOrientation.HORIZONTAL[dx > 0 ? 0 : 1];
    } else if (yDist > xDist) {
      direction = directionsByOrientation.VERTICAL[dy > 0 ? 0 : 1];
    } else {
      direction = randomDirection(this._random);
    }
    this.move(entity, direction);
  }

  canMove(entity, direction) {
    return this._interact(entity, direction, true);
  }

  move(entity, direction) {
    let targetEntity = this.at(entity.coords, direction);

    if (entity.roundness !== 5 && targetEntity && targetEntity.roundness !== 5) {
      direction = this._deflect(entity, direction);
      targetEntity = this.at(entity.coords, direction); // should always be null?
    }

    const canMove = this._interact(entity, direction);
    if (canMove) {
      this._move(entity, direction);
    }
    return canMove;
  }

  eat(entity, direction) {
    const targetEntity = this.at(entity.coords, direction);

    if (!this._dryRun) {
      if (targetEntity instanceof entities.Player) {
        this.once('tick', () => {
          this._emit('death');
        });
      } else {
        const snack = this.at(entity.coords, direction);
        invariant(snack, 'Could not eat entity. It did not exist!');
        this._entityList.destroy(snack);
      }
      this.setAt(targetEntity.coords);
    }
  }

  shove(entity, direction) {
    let shoved = false;
    if (!this.at(entity.coords, direction, 2)) {
      if (!this._dryRun) {
        const pushee = this.at(entity.coords, direction);
        this._move(pushee, direction);
        shoved = true;
      }
    }
    return shoved;
  }

  replace(entity, replaceWith) {
    const newEntity = this._entityList.replace(entity, replaceWith);
    this.setAt(newEntity.coords, newEntity);
    return newEntity;
  }

  _interact(entity, direction, dryRun = false) {
    const { coords } = entity;
    const targetEntity = this.at(coords, direction);

    if (!targetEntity) {
      return true; // for canMove
    }
    if (!entity instanceof entities.Interactor || targetEntity.isStatic) {
      return false;
    }
    this._dryRun = dryRun;
    const moveCanceled = entity.interact(this._entityApi, direction, entities);
    const eaten = targetEntity.state.willBeDeleted;
    const newTargetEntity = this.at(coords, direction);
    const reactingEntity = eaten ? targetEntity : newTargetEntity;

    if (reactingEntity instanceof entities.Interactor) {
      // If you shove something, it isn't next to you anymore. It can't do anything to you.
      // It is possible that an object being eaten should have a chance to do something (e.g. a key!)
      reactingEntity.react(this._entityApi, flip(direction), entities);
    }

    this._dryRun = null;
    const shouldMove = !moveCanceled && (newTargetEntity === null || newTargetEntity.pathable);
    return shouldMove;
  }

  _deflect(entity, direction) {
    const targetEntity = this.at(entity.coords, direction);

    // Does the roundness of the object I hit permit me only a particular direction?
    const directions = getDeflections(entity.coords, direction, targetEntity.roundness);

    if (directions) {
      const [direction1, direction2] = directions;
      // Need to check that nothing is in the way to the left or right!

      const canUse1 = !direction1
        ? false
        : this.canMove(entity, direction1) && this.canMove(entity, leftOf(direction));
      const canUse2 = !direction2
        ? false
        : this.canMove(entity, direction2) && this.canMove(entity, rightOf(direction));

      if (canUse1 && canUse2) {
        if (this._random.nextBoolean()) {
          direction = direction1;
        } else {
          direction = direction2;
        }
      } else if (canUse1) {
        direction = direction1;
      } else if (canUse2) {
        direction = direction2;
      }
    }
    return direction;
  }

  // On a Ferris wheel, looking out on Coney Island...
  _theMagneticFields(entity) {
    // NOTES:
    // Magnets are polar, i.e. two horizontal magnets (S S) will not snap together.
    // Pulling is passive, being pulled happens on your turn. This is why blocks were thinkers.
    // For this to work right, objects must be attracted (move in response to detecting a magnet)
    // This does not guarantee that all magnets are finished pulling.
    // Indeed in kye2.0 and Python kye, the following happens:
    // 55555      55555
    // 5s S5      5 s 5 <- The top vertical magnet could still be pulled down
    // 5   5  =>  5  S5    to the bottom vertical magnet but stays indefinitely.
    // 5S s5      5Ss 5
    // 55555      55555
    // Magnetized bouncing also occurs in Python kye and kye2.0: (works w/ B too)
    // Ss S   =>  S sS   =>  Ss S   =>  ... ad infintem
    // This suggests that being attracted has priority over being stuck

    const magnetismOnEntity = at(this._magnetization, entity.coords);

    if (magnetismOnEntity === 0) {
      return false;
    }

    directions.forEach((direction, i) => {
      const possibleTarget = this.at(entity.coords, direction, 2);
      if (
        entity instanceof entities.Magnet &&
        aligned(entity.orientation, direction) &&
        possibleTarget instanceof entities.Player &&
        this.at(entity.coords, direction) === null
      ) {
        this.move(entity, direction);
      } else if (
        possibleTarget instanceof entities.Magnet &&
        aligned(possibleTarget.orientation, direction) &&
        entity.pullable &&
        this.at(entity.coords, direction) === null
      ) {
        const entityIsMagnet = entity instanceof entities.Magnet;
        if (
          !entityIsMagnet ||
          (entityIsMagnet && entity.orientation !== possibleTarget.orientation)
        ) {
          this.move(entity, direction);
        }
      }
    });
    return at(this._magnetization, entity.coords) >= 32;
  }

  _alterMagnetTracking(magnet, plusMinus) {
    const { coords } = magnet;
    setAt(this._magnetization, coords, at(this._magnetization, coords) + 1 * plusMinus);
    directionsByOrientation[magnet.orientation].forEach(direction => {
      setAt(
        this._magnetization,
        coords,
        at(this._magnetization, coords, direction, 1) + 32 * plusMinus,
        direction,
        1,
      );
      setAt(
        this._magnetization,
        coords,
        at(this._magnetization, coords, direction, 2) + 1 * plusMinus,
        direction,
        2,
      );
    });
  }

  _trackMagnet(magnet) {
    this._alterMagnetTracking(magnet, 1);
  }

  _untrackMagnet(magnet) {
    this._alterMagnetTracking(magnet, -1);
  }

  _cloneBoard(board, pred) {
    return board.map(row => [
      ...row.map(
        entity => (entity && pred(entity) ? entity.cloneWithState({ board: this }) : null),
      ),
    ]);
  }
  _filterBoard(board, predicate) {
    for (const row of board) {
      for (let i = 0; i < row.length; i++) {
        if (!predicate(row[i])) {
          row[i] = null;
        }
      }
    }
  }

  spiralSearch(coords, cb, maxRadius) {
    let radius = 0;

    if (maxRadius == null) {
      maxRadius = Math.max(this.dimensions.height, this.dimensions.width);
    }

    if (cb(coords)) {
      return coords;
    }

    const spiralCoords = [...coords];
    while (radius < maxRadius) {
      radius++;
      moveCoordsInDirection(spiralCoords, 'DOWN_RIGHT');
      for (const direction of directions) {
        for (let i = 0; i < radius * 2; i++) {
          if (inBoard(this._board, spiralCoords) && cb(spiralCoords)) {
            return spiralCoords;
          }
          moveCoordsInDirection(spiralCoords, direction);
        }
      }
      moveCoordsInDirection(spiralCoords, 'DOWN');
    }
  }

  _move(entity, direction) {
    const isMagnet = entity instanceof entities.Magnet;
    if (isMagnet) {
      this._untrackMagnet(entity);
    }
    this.setAt(entity.coords, null);
    moveCoordsInDirection(entity.coords, direction);
    this.setAt(entity.coords, entity);
    if (isMagnet) {
      this._trackMagnet(entity);
    }
  }

  _reemit(event, ...args) {
    switch (event) {
      case 'progress':
        return this._emit(event, args);
      case 'win':
        return this._emit(event, this.recording);
    }
  }

  _initializeIteratorObject(obj) {
    obj.x = null;
    obj.y = null;
    obj.entity = null;
    obj.field = null;
    return obj;
  }

  *entities() {
    yield* this._entityList;
  }

  *statics() {
    yield* this._statics;
  }

  *fields() {
    yield* this._fieldsList;
  }

  *[Symbol.iterator]() {
    const iteratorObjects = this._iteratorObjects;
    const { width } = this.dimensions;
    iteratorObjects.forEach(obj => this._initializeIteratorObject(obj));

    for (let row = 0; row < this.dimensions.height; row++) {
      for (let col = 0; col < this.dimensions.width; col++) {
        const obj = iteratorObjects[row * width + col];
        obj.x = col;
        obj.y = row;
        obj.entity = this._board[row][col];
        obj.field = this._fields[row][col];

        yield obj;
      }
    }
  }
}
makeEmitter(Board.prototype);
