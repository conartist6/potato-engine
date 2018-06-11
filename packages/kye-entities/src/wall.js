import Entity from 'potato-engine/lib/entity';
import { Seq } from 'immutable';
import { range } from 'iter-tools';

export default class Wall extends Entity {
  get isStatic() {
    return true;
  }

  get symbol() {
    return '' + this.roundness;
  }

  get roundness() {
    return Number(this.__attribute);
  }
}
Wall.attributesBySymbol = Seq.Set(range(10))
  .toKeyedSeq()
  .mapKeys(num => String(num))
  .toMap();
Wall.__name = 'Wall'; // uglify killin' me
