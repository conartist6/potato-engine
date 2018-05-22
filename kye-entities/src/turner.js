import Interactor from 'kye-engine/lib/entities/interactor';
import { Map } from 'immutable';
import { rightOf, leftOf } from 'kye-engine/lib/directions';

export default class Turner extends Interactor {
  react(board, targetEntity, direction) {
    const { coords } = this;
    const sourceEntity = board.at(coords, direction);
    if (sourceEntity.attribute === sourceEntity.direction) {
      const transform = this.turn === 'ANTICLOCKWISE' ? rightOf : leftOf;
      sourceEntity.replace(transform(sourceEntity.direction));
    }
  }

  get turn() {
    return this.attribute;
  }
}
Turner.attributesBySymbol = Map({ a: 'ANTICLOCKWISE', c: 'CLOCKWISE' });
Turner.__name = 'Turner'; // uglify killin' me
