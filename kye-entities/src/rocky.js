import Slider from './slider';

import directions from 'kye-engine/lib/directions';

const symbolsByDirection = {
  UP: '^',
  DOWN: 'v',
  LEFT: '<',
  RIGHT: '>',
};

export default class Rocky extends Slider {
  get roundness() {
    return 0;
  }

  get symbol() {
    return symbolsByDirection[this.direction];
  }

  static validParams() {
    return directions;
  }
}
Rocky.__name = 'Rocky'; // uglify killin' me
