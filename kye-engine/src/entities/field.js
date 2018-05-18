import Base from './base';

/**
 * Fields are immobile interactors, and are the only game entities
 * which other objects can exist on top of.
 **/
export default class Field extends Base {
  constructor(attribute) {
    super(attribute);
  }
}
Field.__name = 'Field'; // uglify killin' me
