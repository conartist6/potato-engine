import Base, { EntityState } from './entities/base';

export class ListEntityState extends EntityState {
  get id() {
    return this._idx;
  }
}

export default class EntityList {
  constructor(entities, initialState = {}) {
    this._list = [];
    this._initialState = initialState;
    for (const entity of entities) {
      this.add(entity);
    }
  }

  add(entity) {
    const newEntity = this._clone(entity, this._list.length);
    this._list.push(newEntity);
    return newEntity;
  }

  _clone(entity, idx) {
    const newState = new ListEntityState(entity.state);

    newState.list = this;
    Object.assign(newState, this._initialState);
    newState._idx = idx;

    return entity.cloneWithState(newState);
  }

  set(idx, entity) {
    return (this._list[idx] = this._clone(entity, idx));
  }

  get(idx) {
    return this._list[idx];
  }

  remove(entity) {
    entity.state.willBeDeleted = true;
    return null;
  }

  replace(entity, replaceWith) {
    let newEntity;
    if (replaceWith instanceof Base) {
      newEntity = this._clone(replaceWith);
    } else {
      newEntity = entity.cloneWithAttribute(replaceWith);
    }
    return (this._list[entity.state._idx] = newEntity);
  }

  purge() {
    let count = 0;
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].state.willBeDeleted) {
        continue;
      }
      this._list[count] = this._list[i];
      this._list[count].state._idx = count;
      count++;
    }
    this._list.length = count;
  }

  *[Symbol.iterator]() {
    for (const entity of this._list) {
      if (!entity.state.willBeDeleted) {
        yield entity;
      }
    }
  }
}
