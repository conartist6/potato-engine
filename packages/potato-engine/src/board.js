import { Seq } from 'immutable';
import makeEmitter from 'event-emitter';
import invariant from 'invariant';
import allOff from 'event-emitter/all-off';
import Random from './random';
import BoardList from './board-list';
import EntityList from './entity-list';
import Entity, { EntityState } from './entity';
import { filter, map, range } from 'iter-tools';

import {
  aligned,
  at,
  setAt,
  array2d,
  iterateArray2d,
  inArray2d,
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

const recordingDirectionSymbols = {
  LEFT: 'l',
  UP: 'u',
  RIGHT: 'r',
  DOWN: 'd',
};

/**
 * Board: STUB
 **/
export default class Board {
  constructor(level, options = {}) {
    const { Field } = entities;
    const { dimensions } = level;

    const getState = options.getState || (() => {});
    this.dimensions = dimensions;
    if (options.record) {
      this.recording = [];
    }

    this._random = new Random(level.seed);

    this._entityApi = Object.freeze({
      entities,
      getState,
      random: this._random,
      emit: (...args) => this._reemit(...args),
      ...Seq.Indexed([
        'shove',
        'move',
        'eat',
        'replace',
        'create',
        'destroy',
        'at',
        'once',
        'spiralSearch',
        'players',
      ])
        .toSetSeq()
        .toMap()
        .map(method => this[method].bind(this))
        .toObject(),
    });

    function findEntities(cb) {
      return filter(entity => {
        return entity != null && cb(entity);
      }, iterateArray2d(level.board));
    }
    const state = { board: this._entityApi };

    this._boardList = new BoardList(findEntities(e => !(e.isStatic || e instanceof Field)), state);
    this._staticsList = new EntityList(findEntities(e => e.isStatic));
    this._fieldsList = new EntityList(findEntities(e => e instanceof Field), state);

    this._statics = array2d(dimensions, null, this._staticsList);
    this._board = array2d(dimensions, null, this._boardList);
    this._fields = array2d(dimensions, null, this._fieldsList);

    this._tickCounter = 0;
    this._isInitial = true;

    this._emit = this.emit;
    this.emit = undefined;

    if (!options.displayOnly) {
      this._spawn = [...this.getPlayer().coords];
    }

    this._iteratorObjects = Array.from(
      map(i => this._initializeIteratorObject({}), range(dimensions.width * dimensions.height)),
    );

    const plugins = options.plugins || [];
    this._pluginInsts = plugins.map(Plugin => new Plugin(this, findEntities));
  }

  start(event, listener) {
    if (event) {
      this.on(event, listener);
    }
    this._emit('start');
  }

  end() {
    this._emit('end');
    allOff(this);
  }

  /**
   * Calling tick runs the main game loop once.
   **/
  tick(playerDirection) {
    const scheduled = !playerDirection;

    for (const entity of this._boardList) {
      if (entity instanceof entities.Player) {
        if (playerDirection) {
          this.move(this.getPlayer(), playerDirection);
        }
      }
      let sleeping =
        this._isInitial || // entities start asleep
        !(this._tickCounter % entity.frequency === 0 || (!scheduled && entity.opportunistic)); // not every entity thinks every tick
      if (!sleeping) {
        for (const plugin of this._pluginInsts) {
          plugin.onEntityTick && plugin.onEntityTick(entity);
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

    this._isInitial = false;
    this._emit('tick');
  }

  /**
   * Get the entity at coords (with optional offset).
   **/
  at(coords, direction = null, distance = 1) {
    return (
      at(this._board, coords, direction, distance) ||
      at(this._statics, coords, direction, distance) ||
      at(this._fields, coords, direction, distance)
    );
  }

  /**
   * Set the entity at coords (with optional offset).
   **/
  setAt(coords, newEntity, direction = null, distance = 1) {
    const currentEntity = this.at(coords);
    invariant(!(currentEntity && currentEntity.isStatic), 'Tried to overwrite a static entity!');

    setAt(this._board, coords, newEntity);
  }

  /**
   * There can only one. TODO...
   **/
  getPlayer() {
    return this._boardList.getPlayer(0);
  }

  /**
   * There's a reason we keep spares.
   **/
  respawnPlayer() {
    const coords = this.spiralSearch(this._spawn, coords => this.at(coords) === null);
    const { Player } = entities;
    const newPlayer = this._boardList.set(0, new Player(coords));
    this.setAt(coords, newPlayer);
  }

  /**
   * Going nowhere fast?
   **/
  canMove(entity, direction) {
    const target = this.at(entity.coords, direction);
    return target == null || target instanceof entities.Field;
  }

  /**
   * Get goin'
   **/
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

  /**
   * Nom nom nom
   **/
  eat(entity, targetEntity) {
    this.destroy(targetEntity);
  }

  /**
   * Politely ask whatever is in your way to scoot a bit thattaway.
   **/
  shove(entity, direction) {
    let shoved = false;
    const pushee = this.at(entity.coords, direction);
    if (
      !this.at(entity.coords, direction, 2) &&
      !(pushee.isStatic || pushee instanceof entities.Field)
    ) {
      this._move(pushee, direction);
      shoved = true;
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

  /**
   * Replace an entity
   **/
  replace(sourceEntity, replaceWith) {
    const destIsEntity = replaceWith instanceof Entity;
    const sourceList = this._getList(sourceEntity);
    const destList = destIsEntity ? this._getList(replaceWith) : null;

    for (const plugin of this._pluginInsts) {
      plugin.untrack && plugin.untrack(sourceEntity, 'replace');
    }

    let targetEntity;
    if (!destIsEntity || sourceList === destList) {
      targetEntity = sourceList.replace(sourceEntity, replaceWith);
    } else {
      sourceList.remove(sourceEntity);
      targetEntity = destList.add(replaceWith);
    }

    for (const plugin of this._pluginInsts) {
      plugin.track && plugin.track(targetEntity, 'replace');
    }

    const sourceBoard = this._get2dArray(sourceEntity);
    const destBoard = this._get2dArray(targetEntity);
    setAt(sourceBoard, sourceEntity.coords, null);
    return setAt(destBoard, targetEntity.coords, targetEntity);
  }

  /**
   * Given an abstract entity, make it concrete and put it on the board.
   **/
  create(entity) {
    invariant(!entity.isStatic, 'Tried to create a static entity!');

    const newEntity = this._getList(entity).add(entity);
    setAt(this._get2dArray(entity), entity.coords, newEntity);

    for (const plugin of this._pluginInsts) {
      plugin.track && plugin.track(newEntity, 'create');
    }

    return newEntity;
  }

  /**
   * Remove a given entity from the board.
   **/
  destroy(entity) {
    invariant(entity, 'Could not destroy entity. It did not exist!');
    invariant(!entity.isStatic, 'Tried to overwrite a static entity!');

    if (entity instanceof entities.Player) {
      this.once('tick', () => {
        this._emit('death');
      });
    }

    for (const plugin of this._pluginInsts) {
      plugin.untrack && plugin.untrack(entity, 'destroy');
    }

    this._getList(entity).remove(entity);
    setAt(this._get2dArray(entity), entity.coords, null);
  }

  _interact(entity, direction) {
    const { coords } = entity;
    const targetEntity = this.at(coords, direction);

    if (!targetEntity) {
      return true; // for canMove
    }
    if (!entity instanceof entities.Interactor) {
      return false;
    }

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

    const shouldMove =
      !moveCanceled && (newTargetEntity === null || newTargetEntity instanceof entities.Field);
    return shouldMove;
  }

  _deflect(entity, direction) {
    const targetEntity = this.at(entity.coords, direction);

    // Does the roundness of the object I hit permit me only a particular direction?
    const directions = getDeflections(direction, targetEntity.roundness);

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

  /**
   * Search outwards from a given center, looking for an open square.
   **/
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
          if (inArray2d(this._board, spiralCoords) && cb(spiralCoords)) {
            return spiralCoords;
          }
          moveCoordsInDirection(spiralCoords, direction);
        }
      }
      moveCoordsInDirection(spiralCoords, 'DOWN');
    }
  }

  _move(entity, direction) {
    for (const plugin of this._pluginInsts) {
      plugin.untrack && plugin.untrack(entity, 'move');
    }

    this.setAt(entity.coords, null);
    moveCoordsInDirection(entity.coords, direction);
    this.setAt(entity.coords, entity);

    for (const plugin of this._pluginInsts) {
      plugin.track && plugin.track(entity, 'move');
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
