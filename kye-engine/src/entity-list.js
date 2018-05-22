import invariant from 'invariant';
import entities from './entities';
import Base from './entities/base';

export default class EntityList {
  constructor(entities, initialState = {}) {
    this._playerList = [];
    this._entityList = [];
    this._initialState = initialState;

    for (const entity of entities) {
      this.add(entity);
    }
  }

  _clone(entity) {
    const list = this._getList(entity);
    return entity.cloneWithState({
      ...this._initialState,
      list: this,
      _idx: list.length,
      get key() {
        return `${entity instanceof entities.Player ? 'p' : 'e'}${this._idx}`;
      },
    });
  }

  _getList(entity) {
    return entity instanceof entities.Player ? this._playerList : this._entityList;
  }

  add(entity) {
    this._getList(entity).push(this._clone(entity));
  }

  getEntity(idx) {
    return this._entityList[idx];
  }

  getPlayer(idx) {
    return this._playerList[idx];
  }

  set(idx, entity) {
    return (this._getList(entity)[idx] = this._clone(entity));
  }

  destroy(entity) {
    if (entity instanceof entities.Player) {
      entity.state.dead = true;
    } else {
      entity.state.willBeDeleted = true;
    }
  }

  purge() {
    let count = 0;
    for (let i = 0; i < this._entityList.length; i++) {
      if (this._entityList[i].state.willBeDeleted) {
        continue;
      }
      this._entityList[count] = this._entityList[i];
      this._entityList[count].state._idx = count;
      count++;
    }
    this._entityList.length = count;
  }

  replace(entity, replaceWith) {
    const newEntity =
      replaceWith instanceof Base
        ? this._clone(replaceWith)
        : entity.cloneWithAttribute(replaceWith);
    return (this._getList(entity)[entity.state._idx] = newEntity);
  }

  *[Symbol.iterator]() {
    for (const player of this._playerList) {
      if (!player.state.dead) {
        yield player;
      }
    }
    for (const entity of this._entityList) {
      if (!entity.state.willBeDeleted) {
        yield entity;
      }
    }
  }
}
