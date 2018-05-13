import Base from 'kye-engine/entities/base';
import range from 'lodash-es/range';

export default class Wall extends Base {
  constructor(roundness) {
    super();
    this._roundness = roundness;
    this.isStatic = true;
    this.pushable = false;
  }

  get attribute() {
    return this._roundness;
  }

  get symbol() {
    return '' + this.roundness;
  }

  get roundness() {
    return this._roundness;
  }

  static validParams() {
    return range(1, 10);
  }
}
Wall.__name = 'Wall'; // uglify killin' me
