import Base from './base';

/**
 * Fields are immobile interactors, and are the only game entities
 * which other objects can exist on top of.
 **/
export default class Field extends Base {
  constructor() {
    super();
    this.frequency = 0;
    this.pathable = true;
    this.pushable = false;
  }

  get roundness() {
    return 5;
  }
}
Field.__name = 'Field'; // uglify killin' me
