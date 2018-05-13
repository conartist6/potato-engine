import { Map, Seq } from 'immutable';

import Interactor from './interactor';
import Player from './player';
import Thinker from './thinker';
import Magnet from './magnet';

import invariant from 'invariant';

const defaultValidParams = [''];

export class EntityStore {
  constructor() {
    this.reset();
  }
  addEntityType(EntityType) {
    const name = EntityType.__name;
    invariant(name, 'Entities must have a name');
    const instances = (this._instances[name] = {});

    const validParams = EntityType.validParams ? EntityType.validParams() : defaultValidParams;
    for (const param of validParams) {
      const instance = new EntityType(param);
      instances[param] = instance;
      this._instancesBySymbol[instance.symbol] = instance;
    }
    this.entities.set(name, EntityType);
  }
  get(EntityType, param = '') {
    return this._instances[EntityType][param];
  }
  getBySymbol(symbol) {
    return this._instancesBySymbol[symbol];
  }
  reset() {
    this._instances = {};
    this._instancesBySymbol = {};
    this.entities = new global.Map();
    [Interactor, Player, Thinker, Magnet].map(EntityType => this.addEntityType(EntityType));
  }
}

export default new Proxy(new EntityStore(), {
  get(obj, prop) {
    return prop in obj ? obj[prop] : obj.entities.get(prop);
  },
});
