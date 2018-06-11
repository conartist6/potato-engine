import EntityList from './entity-list';
import entities from './entities';

/**
 * Keeping a list of entities makes it easy to iterate through them in a stable order.
 */
export default class BoardList {
  constructor(entities, initialState = {}) {
    this._initialState = { list: this, ...initialState };
    this._playerList = new EntityList([], {
      ...this._initialState,
    });
    this._entityList = new EntityList([], {
      ...this._initialState,
    });

    for (const entity of entities) {
      this.add(entity);
    }
  }

  getEntity(idx) {
    return this._entityList.get(idx);
  }

  getPlayer(idx) {
    return this._playerList.get(idx);
  }

  set(idx, entity) {
    return this._getList(entity).set(idx, entity);
  }

  add(entity) {
    return this._getList(entity).add(entity);
  }

  replace(entity, replaceWith) {
    return this._getList().replace(entity, replaceWith);
  }

  remove(entity) {
    if (entity instanceof entities.Player) {
      entity.state.dead = true;
    }
    return this._getList(entity).remove(entity);
  }

  purge() {
    this._entityList.purge();
  }

  _getList(entity) {
    return entity instanceof entities.Player ? this._playerList : this._entityList;
  }

  *players() {
    for (const player of this._playerList) {
      if (!player.state.dead) {
        yield player;
      }
    }
  }

  *[Symbol.iterator]() {
    yield* this.players();
    yield* this._entityList;
  }
}
