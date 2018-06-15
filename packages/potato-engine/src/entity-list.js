import Entity, { EntityState } from './entity';

/**
 * ListEntityState is used internally to manage concrete entities tracked by an EntityList
 * @access protected
 **/
export class ListEntityState extends EntityState {
  get id() {
    return this._id;
  }
  get idx() {
    return this._idx;
  }
}

/**
 * An entity list is a data structure for creating a stable-ish ordering of entities.
 *
 * The main differentiator between this class and a list are that entities in the list
 * have {@link Entity#replace} and {@link Entity#remove} instance methods which will alter
 * the list itself.
 **/
export default class EntityList {
  constructor(entities, initialState) {
    this._list = [];
    this._initialState = initialState;
    this._id = 0;
    for (const entity of entities) {
      this.add(entity);
    }
  }

  __nextId() {
    return this._id++;
  }

  add(entity) {
    const newEntity = this._cloneEntity(entity, this._list.length);
    this._list.push(newEntity);
    return newEntity;
  }

  _cloneEntity(entity, idx) {
    const newState = new ListEntityState(entity.state);

    let id = this.__nextId();

    newState.list = this;
    Object.assign(newState, this._initialState);
    newState._idx = idx;
    newState._id = id;

    return entity.cloneWithState(newState);
  }

  set(idx, entity) {
    return (this._list[idx] = this._cloneEntity(entity, idx));
  }

  /**
   * Get the entity at index
   * @param {number} idx index
   * @return {Entity}
   **/
  get(idx) {
    return this._list[idx];
  }

  /**
   * Remove and entity from the list
   * @param {Entity} entity The entity to remove from the list.
   **/
  remove(entity) {
    entity.state.willBeDeleted = true; // TODO delete references to the list to help the gc.
  }

  /**
   * Replace is used to maintain list stability. The new entity takes its spot in
   * the iteration order.
   *
   * @param {Entity} entity The entity to be replaced. The instance must already be in the list.
   * @param {Entity|string} entityOrAttribute The new entity, which can be abstract. If a string is passed,
   * the replacing entity will be the result of entity.cloneWithAttribute(entityOrAttribute).
   * @return {Entity} The concrete entity bound to the list.
   **/
  replace(entity, entityOrAttribute) {
    let newEntity;
    if (entityOrAttribute instanceof Entity) {
      newEntity = this._cloneEntity(entityOrAttribute);
    } else {
      newEntity = entity.cloneWithAttribute(entityOrAttribute);
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
