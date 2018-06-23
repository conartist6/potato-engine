import { Map } from 'immutable';
import invariant from 'invariant';

/**
 * The entity type registry. Maps from entity names to entity constructors.
 * It should be a singleton. Don't make one unless you're testing.
 *
 * Entity names must be unique, but they can be overwritten.
 *
 * Entity registration affects serialization and parsing.
 **/
export default class EntityTypeRegistry {
  constructor(coreEntities) {
    this._coreEntities = coreEntities;
    this.reset();
  }

  /**
   * Register a new entity type.
   * @param {Class<Entity>} EntityType The entity type
   **/
  register(EntityType) {
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

  /**
   * Get the correct entity class given an ASCII character. Shouldn't this be a separate concern?
   * @param {string} symbol the character
   * @return {Class<Entity>}
   **/
  getEntityTypeBySymbol(symbol) {
    return this._entityTypesBySymbol.get(symbol);
  }

  /**
   * Remove all entity types except the core game engine types.
   **/
  reset() {
    this._entityTypesBySymbol = Map();
    this.entities = Map();
    this._coreEntities.forEach(EntityType => this.register(EntityType));
  }
}
