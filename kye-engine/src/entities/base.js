export class EntityState {
  constructor(entityState) {
    if (entityState) {
      Object.assign(this, entityState);
    }
  }
  clone() {
    const EntityState = this.constructor;
    return new EntityState(this);
  }
}

export default class Base {
  constructor(coords, attribute, state) {
    this.coords = coords;
    this.attribute = attribute;
    this.state = state;
  }

  get symbol() {
    return this.constructor.__symbolsByAttribute.get(this.attribute);
  }

  /**
   * Having the property of walls, particularly certainty of never needing to be rerendered
   **/
  get isStatic() {
    return false;
  }

  get frequency() {
    return 0;
  }

  get roundness() {
    return 5;
  }

  get twinkles() {
    return false;
  }

  get pushable() {
    return !this.isStatic;
  }

  get pullable() {
    return this.pushable;
  }

  get roundness() {
    return 5;
  }

  get content() {
    return null;
  }

  get board() {
    return this.state && this.state.board;
  }

  get random() {
    return this.board && this.board.random;
  }

  get entities() {
    return this.board && this.board.entities;
  }

  clone() {
    const EntityType = this.constructor;
    return new EntityType([...this.coords], this.attribute, this.state && this.state.clone());
  }

  cloneWithAttribute(attribute) {
    attribute = attribute == null ? this.attribute : attribute;
    const EntityType = this.constructor;
    return new EntityType([...this.coords], attribute, this.state && this.state.clone());
  }

  cloneWithState(state) {
    const EntityType = this.constructor;
    return new EntityType([...this.coords], this.attribute, state);
  }

  /* Board convenience methods */

  replace(replaceWith) {
    this.board.replace(this, replaceWith);
  }

  eat(direction) {
    this.board.eat(this, direction);
  }

  findNearestPlayer() {
    return this.board.findNearestPlayer(this);
  }

  shove(direction) {
    return this.board.shove(this, direction);
  }

  move(direction) {
    return this.board.move(this, direction);
  }

  destroy() {
    this.board.destroy(this);
  }
}
