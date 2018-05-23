import Base from 'kye-engine/lib/entities/base';
import { Set } from 'immutable';
import range from 'lodash/range';

export default class Wall extends Base {
  isStatic() {
    return true;
  }

  get symbol() {
    return '' + this.roundness;
  }

  get roundness() {
    return Number(this.attribute);
  }
}
Wall.attributesBySymbol = Set(range(10))
  .map(num => String(num))
  .toMap();
Wall.__name = 'Wall'; // uglify killin' me
