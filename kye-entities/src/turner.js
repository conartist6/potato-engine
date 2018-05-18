import Interactor from 'kye-engine/lib/entities/interactor';
import { Map } from 'immutable';
import { rightOf, leftOf } from 'kye-engine/lib/directions';

export default class Turner extends Interactor {
  react(board, coords, direction, entities) {
    const sourceEntity = board.at(coords, direction);
    if (sourceEntity instanceof entities.Slider) {
      const sliderDirection = sourceEntity.direction;
      const transform = this.turn === 'ANTICLOCKWISE' ? rightOf : leftOf;
      board.setAt(coords, new entities.Slider(transform(sliderDirection)), direction);
    }
  }

  get turn() {
    return this.attribute;
  }
}
Turner.attributesBySymbol = Map({ a: 'ANTICLOCKWISE', c: 'CLOCKWISE' });
Turner.__name = 'Turner'; // uglify killin' me
