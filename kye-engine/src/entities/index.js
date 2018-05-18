import { Map, Seq } from 'immutable';

import Field from './field';
import Interactor from './interactor';
import Player from './player';
import Thinker from './thinker';
import Magnet from './magnet';

import invariant from 'invariant';

export class EntityStore {
  constructor() {
    this.reset();
  }
  addEntityType(EntityType) {
    const name = EntityType.__name;
    invariant(name, 'Entities must have a name');

    const { attributesBySymbol } = EntityType;
    const symbolsByAttribute = attributesBySymbol && attributesBySymbol.flip();
    if (symbolsByAttribute) {
      EntityType.__symbolsByAttribute = symbolsByAttribute;
    }
    const entityTypeBySymbol = attributesBySymbol && attributesBySymbol.map(() => EntityType);

    this._entityTypesBySymbol = this._entityTypesBySymbol.merge(entityTypeBySymbol);
    this.entities = this.entities.set(name, EntityType);
  }
  getEntityTypeBySymbol(symbol) {
    return this._entityTypesBySymbol.get(symbol);
  }
  reset() {
    this._entityTypesBySymbol = Map();
    this.entities = Map();
    [Field, Interactor, Player, Thinker, Magnet].map(EntityType => this.addEntityType(EntityType));
  }
}

export default new Proxy(new EntityStore(), {
  get(obj, prop) {
    return prop in obj ? obj[prop] : obj.entities.get(prop);
  },
});
