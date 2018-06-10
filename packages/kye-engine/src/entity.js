/**
 * Like entities, entity state subclasses must not differ in their constructor signature.
 * They exist principally to offer a prototype which can be used to offer methods or getters.
 **/
export class EntityState {
  /**
   * @param {EntityState} entityState An optional state to copy properties from.
   **/
  constructor(entityState) {
    if (entityState) {
      Object.assign(this, entityState);
    }
  }

  /**
   * Use this to create a copy of any entity state object without losing its prototype properties.
   **/
  clone() {
    const EntityState = this.constructor;
    return new EntityState(this);
  }
}

/**
 * An entity represents a game playing piece in the kye engine. All pieces which wish to participate in the game
 * must derive from this class. Each entity subclass is likely to have particular behaviors which define it,
 * as well as a particular visual presentation so that players know what they should expect it to do.
 *
 * The visual presentation is not part of the base entity, but the combination of the class name and attribute
 * is currently required to be sufficient in order for the renderer to choose the correct sprite/styling.
 *
 * Entities may be either abstract or concrete. An abstract entity is not associated with any in-progress game
 * (a Board instance), whereas a concrete one is. In particular, a concrete entity is passed a state instance as
 * its third parameter.
 *
 * Abstact entities are suitable for describing levels, for example, whereas to use the mutative methods
 * (e.g. move or eat) you must have a concrete entity.
 *
 * You should never try to create concrete entities yourself. Rather the board, given an abstract entity, will
 * bind to it, resulting in the concrete instance on which your method implementations will be called.
 *
 * No derived entity may define a constructor which takes different parameters than this one.
 **/
export default class Entity {
  /**
   * @param {Array} coords The entity's coords
   * @param {?(string|number)} attribute The entity's attribute
   * @param {?EntityState} state The entitiy's state
   **/
  constructor(coords, attribute, state) {
    this._state = state;

    /**
     * @type {number[]}
     * The mutable [x, y] tuple denoting the location of this entity on the board.
     */
    this.coords = coords;

    /**
     * Internally, the attribute. Subclasses must change this property when updating their attributes.
     * @access protected
     * @type {?(string|number)}
     **/
    this.__attribute = attribute;
  }

  /**
   * Limiting entities to a single primitive primary attribute is done for the purposes of parsing/serialization,
   * styling, and react rendering. Internal variables which do not have any of these needs can simply store the data on state.
   * @type {?(string|number)}
   **/
  get attribute() {
    return this.__attribute;
  }

  /**
   * The entitiy's state object. The state object can be used as scratch space for the entity's internal logic,
   * and also serves as storage for a few important references, such as board, random, and entities.
   * @type {?EntityState}
   **/
  get state() {
    return this._state;
  }

  /**
   * Used for ascii serialization
   * @type {string}
   **/
  get symbol() {
    return this.constructor.__symbolsByAttribute.get(this.__attribute);
  }

  /**
   * Having the property of walls, particularly certainty of never moving and never needing to be rerendered.
   * Static entities are special in that they are the only entities which can be considered concrete without state.
   * Mutative methods are illegal on static entities anyway!
   * @type {boolean}
   **/
  get isStatic() {
    return false;
  }

  /**
   * The number of ticks an entity should sleep between updates. An entity which never updates should be static.
   * @type {number}
   **/
  get frequency() {
    return 1;
  }

  get roundness() {
    return 5;
  }

  get twinkles() {
    return false;
  }

  /**
   * A shortcut for development. With an ascii level format it is easiest to just render a piece as its symbol.
   * @type {string}
   **/
  get content() {
    return null;
  }

  /**
   * In a concrete entity, a reference to the board instance
   * @type {Board}
   **/
  get board() {
    return this.state && this.state.board;
  }

  /**
   * In a concrete entity, a reference to the random number generator
   * @type {Random}
   **/
  get random() {
    return this.board && this.board.random;
  }

  /**
   * In a concrete entity, a reference to the entities registry. It is important to use this because otherwise
   * entity classes can accidentally end up with circular dependencies on one another when their behavior
   * requires them to do instanceof checks against other entity classes.
   * @type {Class<Base>[]}
   **/
  get entities() {
    return this.board && this.board.entities;
  }

  /**
   * Create a copy of an entity. This is a deep copy, and also creates copies of coords and state.
   * @return {this} The cloned entity
   **/
  clone() {
    const EntityType = this.constructor;
    return new EntityType([...this.coords], this.__attribute, this.state && this.state.clone());
  }

  /**
   * See {@link clone}, but allows you to override the new entity's attribute.
   * @param {?(string|number)} attribute The new attribute
   * @return {this} The cloned entity
   **/
  cloneWithAttribute(attribute) {
    attribute = attribute == null ? this.__attribute : attribute;
    const EntityType = this.constructor;
    return new EntityType([...this.coords], attribute, this.state && this.state.clone());
  }

  /**
   * See {@link clone}, but allows you to override the new entity's state.
   * @param {EntityState} state The new state
   * @return {this} The cloned entity
   **/
  cloneWithState(state) {
    const EntityType = this.constructor;
    return new EntityType([...this.coords], this.__attribute, state);
  }

  /**
   * Convenience method for {@link Board#replace}
   **/
  replace(replaceWith) {
    this.board.replace(this, replaceWith);
  }

  /**
   * Convenience method for {@link Board#eat}
   **/
  eat(direction) {
    this.board.eat(this, direction);
  }

  /**
   * Convenience method for {@link Board#shove}
   **/
  shove(direction) {
    return this.board.shove(this, direction);
  }

  /**
   * Convenience method for {@link Board#move}
   **/
  move(direction) {
    return this.board.move(this, direction);
  }

  /**
   * Convenience method for {@link Board#destroy}
   **/
  destroy() {
    this.board.destroy(this);
  }
}
