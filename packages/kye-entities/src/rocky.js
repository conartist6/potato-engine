import Slider from './slider';
import { Map } from 'immutable';

import directions from 'kye-engine/lib/directions';

export default class Rocky extends Slider {
  get roundness() {
    return 0;
  }
}
Rocky.attributesBySymbol = Map({ '<': 'LEFT', '^': 'UP', '>': 'RIGHT', v: 'DOWN' });
Rocky.__name = 'Rocky'; // uglify killin' me
