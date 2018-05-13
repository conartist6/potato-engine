import Interactor from 'kye-engine/lib/entities/interactor';

import { rightOf, leftOf } from 'kye-engine/lib/directions';

const symbolsByTurner = {
  CLOCKWISE: 'a',
  COUNTERCLOCKWISE: 'c',
};

export default class Turner extends Interactor {
  constructor(turn) {
    super(false);
    this.turn = turn;
  }

  react(board, coords, direction, entities) {
    const sourceEntity = board.at(coords, direction);
    if (sourceEntity instanceof entities.Slider) {
      const sliderDirection = sourceEntity.direction;
      const transform = this.turn === 'CLOCKWISE' ? rightOf : leftOf;
      board.setAt(coords, entities.get('Slider', transform(sliderDirection)), direction);
    }
  }

  get symbol() {
    return symbolsByTurner[this.turn];
  }

  static validParams() {
    return Object.keys(symbolsByTurner);
  }
}
Turner.__name = 'Turner'; // uglify killin' me
