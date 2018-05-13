export default class Base {
  constructor() {
    this.frequency = 0;
    this.pathable = false;
    this.pushable = true;
  }

  get pullable() {
    return this.pushable;
  }

  get roundness() {
    return 5;
  }
}
