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

  get board() {
    return this.state && this.state.board;
  }

  clone() {
    const EntityType = this.constructor;
    return new EntityType([...this.coords], this.attribute, this.state && { ...this.state });
  }

  cloneWithAttribute(attribute) {
    attribute = attribute == null ? this.attribute : attribute;
    const EntityType = this.constructor;
    return new EntityType([...this.coords], attribute, this.state && { ...this.state });
  }

  cloneWithState(state = {}) {
    state = { ...this.state, ...state };
    const EntityType = this.constructor;
    return new EntityType([...this.coords], this.attribute, state);
  }

  /* Board convenience methods */

  replace(attribute) {
    this.board.replace(this, attribute);
  }

  eat(direction) {
    this.board.eat(this, direction);
  }

  seek() {
    this.board.seek(this);
  }

  shove(direction) {
    return this.board.shove(this, direction);
  }

  move(direction) {
    return this.board.move(this, direction);
  }
}
