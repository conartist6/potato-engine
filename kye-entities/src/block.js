import Entity from 'kye-engine/lib/entity';
import { Map } from 'immutable';

export default class Block extends Entity {
  get isRound() {
    return this.__attribute;
  }

  get roundness() {
    return this.__attribute === 'ROUND' ? 0 : 5;
  }

  get frequency() {
    return 1;
  }
}
Block.attributesBySymbol = Map({ B: 'ROUND', b: 'SQUARE' });
Block.__name = 'Block'; // uglify killin' me
