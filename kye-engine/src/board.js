import { Seq } from 'immutable';
import makeEmitter from 'event-emitter';
import invariant from 'invariant';
import allOff from 'event-emitter/all-off';
import Prando from 'prando';
import BoardList from './board-list';
import EntityList from './entity-list';
import Base, { EntityState } from './entities/base';
import { filter, map, range } from 'iter-tools';

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
  randomOrientation,
} from './directions';

import entities from './entities';

function array2d(dimensions, initialValue, entityList = []) {
  const { height, width } = dimensions;
  const arr = new Array(height);
  for (let i = 0; i < height; i++) {
    arr[i] = new Array(width);
    for (let j = 0; j < width; j++) {
      arr[i][j] = initialValue;
    }
  }
  for (const entity of entityList) {
    const [x, y] = entity.coords;
    arr[y][x] = entity;
  }
  return arr;
}

function* iterateArray2d(array2d) {
  for (const row of array2d) {
    for (const cell of row) {
      yield cell;
    }
  }
}

const recordingDirectionSymbols = {
  LEFT: 'l',
  UP: 'u',
  RIGHT: 'r',
  DOWN: 'd',
};

export default class Board {
  constructor(level, dimensions, options) {
    const { Field, Magnet } = entities;

    const getState = options.getState || (() => {});
    this.dimensions = dimensions;
    if (options.record) {
      this.recording = [];
    }

    this._random = new Prando(level.seed);

    this._entityApi = Object.freeze({
      entities,
      getState,
      random: this._random,
      emit: (...args) => this._reemit(...args),
      ...Seq.Indexed([
        'destroy',
        'shove',
        'move',
        'eat',
        'replace',
        'at',
        'setAt',
        'once',
        'spiralSearch',
        'players',
      ])
        .toSetSeq()
        .toMap()
        .map(method => this[method].bind(this))
        .toObject(),
    });

    function findEntities(cb, board = level.board) {
      return filter(entity => {
        return entity != null && cb(entity);
      }, iterateArray2d(board));
    }
    const state = { board: this._entityApi };

    this._boardList = new BoardList(findEntities(e => !(e.isStatic || e instanceof Field)), state);
    this._staticsList = new EntityList(findEntities(e => e.isStatic));
    this._fieldsList = new EntityList(findEntities(e => e instanceof Field), state);

    this._statics = array2d(dimensions, null, this._staticsList);
    this._board = array2d(dimensions, null, this._boardList);
    this._fields = array2d(dimensions, null, this._fieldsList);
    this._magnetization = array2d(dimensions, 0);

    this._tickCounter = 0;
    this._ate = null;
    this._shoved = null;
    this._dryRun = null;
    this._paused = true;
    this._emit = this.emit;
    this.emit = undefined;
    const magnets = findEntities(s => s instanceof Magnet, this._board);
    for (const magnet of magnets) {
      this._trackMagnet(magnet);
    }

    this._spawn = [...this.getPlayer().coords];

    this._iteratorObjects = Array.from(
      map(i => this._initializeIteratorObject({}), range(dimensions.width * dimensions.height)),
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

    for (const entity of this._boardList) {
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
        const stuck = this._theMagneticFields(entity);
        if (!(entity instanceof entities.Player)) {
          entity.state.stuck = stuck;
        }
      }
      if (entity.think && !sleeping) {
        entity.think(this._entityApi, entities);
      }
    }

    this._boardList.purge();
    this._fieldsList.purge();

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
      at(this._board, coords, direction, distance) ||
      at(this._statics, coords, direction, distance) ||
      at(this._fields, coords, direction, distance)
    );
  }

  setAt(coords, newEntity, direction = null, distance = 1) {
    const currentEntity = this.at(coords);
    invariant(!(currentEntity && currentEntity.isStatic), 'Tried to overwrite a static entity!');

    setAt(this._board, coords, newEntity);
  }

  getPlayer() {
    return this._boardList.getPlayer(0);
  }

  respawnPlayer() {
    const coords = this.spiralSearch(this._spawn, coords => this.at(coords) === null);
    const { Player } = entities;
    const newPlayer = this._boardList.set(0, new Player(coords));
    this.setAt(coords, newPlayer);
  }

  canMove(entity, direction) {
    return this._interact(entity, direction, true);
  }

  move(entity, direction) {
    if (entity.state.stuck) {
      return false;
    }

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

  eat(entity, targetEntity) {
    invariant(targetEntity, 'Could not eat entity. It did not exist!');
    if (!this._dryRun) {
      this.destroy(targetEntity);
    }
  }

  shove(entity, direction) {
    let shoved = false;
    const pushee = this.at(entity.coords, direction);
    if (
      !this.at(entity.coords, direction, 2) &&
      !(pushee.isStatic || pushee instanceof entities.Field)
    ) {
      if (!this._dryRun) {
        this._move(pushee, direction);
        shoved = true;
      }
    }
    return shoved;
  }

  _getList(entity) {
    invariant(!entity.isStatic, 'Static entity list should be irrelevant');
    return entity instanceof entities.Field ? this._fieldsList : this._boardList;
  }

  _get2dArray(entity) {
    invariant(!entity.isStatic, 'Static entity list should be irrelevant');
    return entity instanceof entities.Field ? this._fields : this._board;
  }

  replace(sourceEntity, replaceWith) {
    const destIsEntity = replaceWith instanceof Base;
    const sourceList = this._getList(sourceEntity);
    const destList = destIsEntity ? this._getList(replaceWith) : null;

    if (!destIsEntity || sourceList === destList) {
      return sourceList.replace(sourceEntity, replaceWith);
    } else {
      const targetEntity = replaceWith;
      const sourceBoard = this._get2dArray(sourceEntity);
      const destBoard = this._get2dArray(targetEntity);

      setAt(sourceBoard, sourceEntity.coords, sourceList.destroy(sourceEntity));
      return setAt(destBoard, targetEntity.coords, destList.add(targetEntity));
    }
  }

  destroy(entity) {
    if (entity instanceof entities.Player) {
      this.once('tick', () => {
        this._emit('death');
      });
    }

    invariant(!entity.isStatic, 'Tried to overwrite a static entity!');

    this._getList(entity).destroy(entity);
    setAt(this._get2dArray(entity), entity.coords, null);
  }

  _interact(entity, direction, dryRun = false) {
    const { coords } = entity;
    const targetEntity = this.at(coords, direction);

    if (!targetEntity) {
      return true; // for canMove
    }
    if (!entity instanceof entities.Interactor) {
      return false;
    }
    this._dryRun = dryRun;
    let moveCanceled = false;
    if (!(targetEntity instanceof entities.Field)) {
      moveCanceled = entity.interact(this._entityApi, targetEntity, direction);
    }

    const newTargetEntity = this.at(coords, direction);
    if (!targetEntity.isStatic) {
      const eaten = targetEntity.state.willBeDeleted;
      const reactingEntity = eaten ? targetEntity : newTargetEntity;

      if (reactingEntity instanceof entities.Interactor) {
        // If you shove something, it isn't next to you anymore. It can't do anything to you.
        // It is possible that an object being eaten should have a chance to do something (e.g. a key!)
        reactingEntity.react(this._entityApi, newTargetEntity, flip(direction));
      } else if (reactingEntity instanceof entities.Field) {
        moveCanceled =
          reactingEntity.enter(this._entityApi, entity, flip(direction)) || moveCanceled;
      }
    }

    this._dryRun = null;
    const shouldMove =
      !moveCanceled && (newTargetEntity === null || newTargetEntity instanceof entities.Field);
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
      const possibleTarget = at(this._board, entity.coords, direction, 2);

      if (
        entity instanceof entities.Magnet &&
        aligned(entity.orientation, direction) &&
        possibleTarget instanceof entities.Player &&
        this.at(entity.coords, direction) === null
      ) {
        this._move(entity, direction);
      } else if (
        possibleTarget instanceof entities.Magnet &&
        aligned(possibleTarget.orientation, direction) &&
        !(possibleTarget instanceof entities.Player) &&
        !possibleTarget.nonFerrous &&
        this.at(entity.coords, direction) === null
      ) {
        const entityIsMagnet = entity instanceof entities.Magnet;
        if (
          !entityIsMagnet ||
          (entityIsMagnet && entity.orientation !== possibleTarget.orientation)
        ) {
          this._move(entity, direction);
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
    obj.static = null;
    return obj;
  }

  *players() {
    yield* this._boardList.players();
  }

  *entities() {
    yield* this._boardList;
  }

  *statics() {
    yield* this._staticsList;
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
        obj.static = this._statics[row][col];

        yield obj;
      }
    }
  }
}
makeEmitter(Board.prototype);
