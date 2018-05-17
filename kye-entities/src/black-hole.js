import Field from 'kye-engine/lib/entities/field';
import range from 'lodash/range';

export default class BlackHole extends Field {
  constructor(fullFor) {
    super();
    this.symbol = 'H';
    this.frequency = 5;
    this.fullFor = fullFor; // Black holes need to digest
    this.pathable = fullFor === 0;
    this.pushable = fullFor === 1;
  }

  get pullable() {
    return false;
  }

  static validParams() {
    return range(0, 5);
  }
}
BlackHole.__name = 'BlackHole'; // uglify killin' me
