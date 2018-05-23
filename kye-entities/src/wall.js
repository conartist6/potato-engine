import Base from 'kye-engine/lib/entities/base';
import { Seq } from 'immutable';
import { range } from 'iter-tools';

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
Wall.attributesBySymbol = Seq.Set(range(10))
  .toKeyedSeq()
  .mapKeys(num => String(num))
  .toMap();
Wall.__name = 'Wall'; // uglify killin' me
