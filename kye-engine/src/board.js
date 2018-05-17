import { Seq } from 'immutable';
import makeEmitter from 'event-emitter';
import invariant from 'invariant';
import allOff from 'event-emitter/all-off';
import range from 'lodash/range';
import Prando from 'prando';

import {
  aligned,
  at,
  setAt,
  inBoard,
  copyCoords,
  coordsAreEqual,
  directions,
  getDeflections,
  directionsByOrientation,
  directionsAsDeltaCoords,
  leftOf,
  rightOf,
  flip,
  getCoordsInDirection,
  moveCoordsInDirection,
  randomDirection,
} from './directions';

import entities from './entities';

function findCoordsFor(board, cb) {
  return board.reduce(
    (entities, row, y) =>
      row.reduce((entities, symbol, x) => {
        cb(symbol) && entities.push([x, y]);
        return entities;
      }, entities),
    [],
  );
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

    this._board = this._cloneBoard(level.board);
    this._filterBoard(this._board, entity => !(entity instanceof entities.Field));
    this._fields = this._cloneBoard(level.board);
    this._filterBoard(this._fields, entity => entity instanceof entities.Field);

    this._magnetization = this._board.map(row => row.map(symbol => 0));
    this._tickCounter = 0;
    this._ate = null;
    this._shoved = null;
    this._dryRun = null;
    this._paused = true;
    this._emit = this.emit;
    this.emit = undefined;
    const magnets = findCoordsFor(this._board, s => s instanceof entities.Magnet);
    for (const magnetCoords of magnets) {
      this._trackMagnetAt(magnetCoords);
    }

    this._entityApi = Object.freeze({
      getState,
      random: this._random,
      emit: (event, ...args) => {
        switch (event) {
          case 'progress':
            return this._emit(event, args);
          case 'win':
            return this._emit(event, this.recording);
        }
        this._emit();
      },
      ...Seq.Indexed(['seek', 'shove', 'move', 'eat', 'at', 'setAt', 'once', 'spiralSearch'])
        .toSetSeq()
        .toMap()
        .map(method => this[method].bind(this))
        .toObject(),
    });

    const playerCoords = findCoordsFor(this._board, s => s instanceof entities.Player)[0];
    this._spawn = [...playerCoords];

    // This is one of the most core data structures we need to maintain.
    // Throughout the game, entities must be allowed to act in the order they
    // originally appeared in the level file in a RTL reading order.
    // Player is first; spawned entities are pushed to the end.
    this._entityCoords = [
      playerCoords,
      ...findCoordsFor(
        this._board,
        s =>
          s != null &&
          !(s instanceof entities.Player) &&
          !(s instanceof entities.Wall && !(s instanceof entities.Field)),
      ),
    ];
    this._entitiesToDelete = [];
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

    this._entityCoords.forEach((coords, i) => {
      const entity = this.at(coords);
      if (!entity || this._entitiesToDelete.includes(i)) {
        return;
      }

      if (entity instanceof entities.Player) {
        invariant(i === 0, 'The player entity is no longer first in the entity list!');

        if (playerDirection) {
          this.move(this.getPlayerCoords(), playerDirection);
        }
      }
      let sleeping = !(
        this._tickCounter % entity.frequency === 0 ||
        (!scheduled && entity.opportunistic)
      ); // not every entity thinks every tick
      if (!sleeping) {
        sleeping = this._theMagneticFields(coords); // stuck entities can't think
      }
      if (entity.think && !sleeping) {
        entity.think(this._entityApi, coords, entities);
      }
    });

    this._entitiesToDelete.forEach(indexOfCoords => {
      this._entityCoords.splice(indexOfCoords, 1);
    });
    this._entitiesToDelete.length = 0;

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

  getPlayerCoords() {
    return this._entityCoords[0];
  }

  respawnPlayer() {
    const coords = this.spiralSearch(this._spawn, coords => this.at(coords) === null);
    this.setAt(coords, entities.get('Player'));
    copyCoords(coords, this.getPlayerCoords());
  }

  seek(coords) {
    const [x, y] = coords;
    const [px, py] = this.getPlayerCoords();
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
    this.move(coords, direction);
  }

  canMove(coords, direction) {
    return this._interact(coords, direction, true);
  }

  move(coords, direction) {
    const entity = this.at(coords);
    let targetEntity = this.at(coords, direction);

    if (entity.roundness !== 5 && targetEntity && targetEntity.roundness !== 5) {
      direction = this._deflect(coords, direction);
      targetEntity = this.at(coords, direction); // should always be null?
    }

    const canMove = this._interact(coords, direction);
    if (canMove) {
      this._moveCoords(coords, direction);
    }
  }

  eat(coords, direction) {
    const targetEntity = this.at(coords, direction);

    if (!this._dryRun) {
      if (targetEntity instanceof entities.Player) {
        this.once('tick', () => {
          this._emit('death');
        });
      } else {
        const snackCoordsIdx = this._findIndexOfCoordsAt(coords, direction);
        invariant(snackCoordsIdx >= 0, 'Could not eat entity. It did not exist!');
        this._entitiesToDelete.push(snackCoordsIdx);
      }
      this.setAt(coords, null, direction);
    }
  }

  shove(coords, direction) {
    let shoved = false;
    if (!this.at(coords, direction, 2)) {
      if (!this._dryRun) {
        const pusheeCoords = this._findCoordsAt(coords, direction);
        this._moveCoords(pusheeCoords, direction);
        shoved = true;
      }
    }
    return shoved;
  }

  _interact(coords, direction, dryRun = false) {
    const entity = this.at(coords);
    const targetEntity = this.at(coords, direction);

    if (!targetEntity) {
      return true; // for canMove
    }
    if (!entity instanceof entities.Interactor) {
      return false;
    }
    this._dryRun = dryRun;
    const moveCanceled = entity.interact(this._entityApi, coords, direction, entities);
    const eaten = this._entitiesToDelete.find(idx =>
      coordsAreEqual(coords, this._entityCoords[idx], direction),
    );
    const newTargetEntity = this.at(coords, direction);
    const reactingEntity = eaten ? targetEntity : newTargetEntity;

    if (reactingEntity instanceof entities.Interactor) {
      const targetCoords = this._findCoordsAt(coords, direction);
      // If you shove something, it isn't next to you anymore. It can't do anything to you.
      // It is possible that an object being eaten should have a chance to do something (e.g. a key!)
      reactingEntity.react(this._entityApi, targetCoords, flip(direction), entities);
    }

    this._dryRun = null;
    const shouldMove = !moveCanceled && (newTargetEntity === null || newTargetEntity.pathable);
    return shouldMove;
  }

  _deflect(coords, direction) {
    const targetEntity = this.at(coords, direction);

    // Does the roundness of the object I hit permit me only a particular direction?
    const directions = getDeflections(coords, direction, targetEntity.roundness);

    if (directions) {
      const [direction1, direction2] = directions;
      // Need to check that nothing is in the way to the left or right!

      const canUse1 = !direction1
        ? false
        : this.canMove(coords, direction1) && this.canMove(coords, leftOf(direction));
      const canUse2 = !direction2
        ? false
        : this.canMove(coords, direction2) && this.canMove(coords, rightOf(direction));

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
  _theMagneticFields(coords) {
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

    const entity = this.at(coords);
    const magnetismOnEntity = at(this._magnetization, coords);

    if (!entity || magnetismOnEntity === 0) {
      return false;
    }

    directions.forEach((direction, i) => {
      const possibleTarget = this.at(coords, direction, 2);
      if (
        entity instanceof entities.Magnet &&
        aligned(entity.orientation, direction) &&
        possibleTarget instanceof entities.Player &&
        this.at(coords, direction) === null
      ) {
        this.move(coords, direction);
      } else if (
        possibleTarget instanceof entities.Magnet &&
        aligned(possibleTarget.orientation, direction) &&
        entity.pullable &&
        this.at(coords, direction) === null
      ) {
        const entityIsMagnet = entity instanceof entities.Magnet;
        if (
          !entityIsMagnet ||
          (entityIsMagnet && entity.orientation !== possibleTarget.orientation)
        ) {
          this.move(coords, direction);
        }
      }
    });
    return at(this._magnetization, coords) >= 32;
  }

  _alterMagnetTracking(magnetCoords, plusMinus) {
    const magnet = this.at(magnetCoords);
    setAt(this._magnetization, magnetCoords, at(this._magnetization, magnetCoords) + 1 * plusMinus);
    directionsByOrientation[magnet.orientation].forEach(direction => {
      setAt(
        this._magnetization,
        magnetCoords,
        at(this._magnetization, magnetCoords, direction, 1) + 32 * plusMinus,
        direction,
        1,
      );
      setAt(
        this._magnetization,
        magnetCoords,
        at(this._magnetization, magnetCoords, direction, 2) + 1 * plusMinus,
        direction,
        2,
      );
    });
  }

  _trackMagnetAt(magnetCoords) {
    this._alterMagnetTracking(magnetCoords, 1);
  }

  _untrackMagnetAt(magnetCoords) {
    this._alterMagnetTracking(magnetCoords, -1);
  }

  _cloneBoard(board) {
    return board.map(row => [...row]);
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

  _findIndexOfCoordsAt(coords, direction = null, distance = 1) {
    const deltaCoords = directionsAsDeltaCoords[direction];
    const x = coords[0] + deltaCoords[0] * distance;
    const y = coords[1] + deltaCoords[1] * distance;

    return this._entityCoords.findIndex(([ex, ey]) => ex === x && ey === y);
  }

  _findCoordsAt(coords, direction = null, distance = 1) {
    const entityCoordsIdx = this._findIndexOfCoordsAt(coords, direction, distance);
    return entityCoordsIdx > 0
      ? this._entityCoords[entityCoordsIdx]
      : getCoordsInDirection(coords, direction, distance);
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

  _moveCoords(coords, direction) {
    const entity = this.at(coords);
    const isMagnet = entity instanceof entities.Magnet;
    if (isMagnet) {
      this._untrackMagnetAt(coords);
    }
    this.setAt(coords, null);
    moveCoordsInDirection(coords, direction);
    this.setAt(coords, entity);
    if (isMagnet) {
      this._trackMagnetAt(coords);
    }
  }

  _initializeIteratorObject(obj) {
    obj.x = null;
    obj.y = null;
    obj.entity = null;
    obj.field = null;
    obj.key = null;
    return obj;
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
