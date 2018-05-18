export default class Base {
  constructor(attribute) {
    this.attribute = attribute;
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
}
