import Thinker from 'kye-engine/entities/thinker';

import directions from 'kye-engine/directions';

const symbolsByDirection = {
  UP: 'u',
  DOWN: 'd',
  LEFT: 'l',
  RIGHT: 'r',
};

export default class Slider extends Thinker {
  constructor(direction) {
    super();
    this.direction = direction;
    this.frequency = 1;
  }

  get attribute() {
    return this.direction;
  }

  think(board, coords) {
    board.move(coords, this.direction);
  }

  get symbol() {
    return symbolsByDirection[this.direction];
  }

  static validParams() {
    return directions;
  }
}
Slider.__name = 'Slider'; // uglify killin' me
