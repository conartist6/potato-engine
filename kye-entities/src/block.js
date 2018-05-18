import Base from 'kye-engine/lib/entities/base';
import { Map } from 'immutable';

export default class Block extends Base {
  get isRound() {
    return this.attribute;
  }

  get roundness() {
    return this.attribute === 'ROUND' ? 0 : 5;
  }
}
Block.attributesBySymbol = Map({ B: 'ROUND', b: 'SQUARE' });
Block.__name = 'Block'; // uglify killin' me
