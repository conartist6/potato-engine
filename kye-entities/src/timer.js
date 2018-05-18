import Thinker from 'kye-engine/lib/entities/thinker';
import { Map } from 'immutable';
import range from 'lodash/range';

export default class Timer extends Thinker {
  get timer() {
    return this.attribute;
  }

  think() {}
}
Timer.attributesBySymbol = Map({ '}': 3, '|': 4, '{': 5, z: 6, y: 7, x: 8, w: 9 });
Timer.__name = 'Timer'; // uglify killin' me
