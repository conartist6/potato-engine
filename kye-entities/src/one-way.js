import Field from 'kye-engine/lib/entities/field';
import { Map } from 'immutable';

export default class OneWay extends Field {
  get direction() {
    return this.attribute;
  }
}
OneWay.attributesBySymbol = Map({ g: 'LEFT', i: 'UP', f: 'RIGHT', h: 'DOWN' });
OneWay.__name = 'OneWay'; // uglify killin' me
