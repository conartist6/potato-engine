import Base from 'kye-engine/lib/entities/base';

import directions from 'kye-engine/lib/directions';

const symbolsByDirection = {
  UP: 'i',
  DOWN: 'h',
  LEFT: 'g',
  RIGHT: 'f',
};

export default class OneWay extends Base {
  constructor(direction) {
    super();
    this.direction = direction;
    this.pathable = true;
    this.pushable = false;
  }

  get symbol() {
    return symbolsByDirection[this.direction];
  }

  static validParams() {
    return directions;
  }
}
OneWay.__name = 'OneWay'; // uglify killin' me
