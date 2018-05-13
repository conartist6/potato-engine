import Thinker from 'kye-engine/lib/entities/thinker';

import directions, { flip } from 'kye-engine/lib/directions';

const symbolsByDirection = {
  LEFT: 'L',
  UP: 'U',
  RIGHT: 'R',
  DOWN: 'D',
};

export default class Sentry extends Thinker {
  constructor(direction) {
    super();
    this.direction = direction;
    this.frequency = 5;
  }

  think(board, coords) {
    board.move(coords, this.direction);
  }

  interact(board, coords, direction, entities) {
    const targetEntity = board.at(coords, direction);
    const shoved = targetEntity.pushable && board.shove(coords, direction);
    board.setAt(coords, entities.get('Sentry', flip(this.direction)));
    return shoved;
  }

  get attribute() {
    return this.direction;
  }

  get symbol() {
    return symbolsByDirection[this.direction];
  }

  static validParams() {
    return directions;
  }
}
Sentry.__name = 'Sentry'; // uglify killin' me
