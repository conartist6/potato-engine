import Interactor from 'kye-engine/lib/entities/interactor';
import { Map } from 'immutable';

export default class Player extends Interactor {
  get pushable() {
    return false;
  }

  interact(board, coords, direction, entities) {
    const targetEntity = board.at(coords, direction);
    if (targetEntity instanceof entities.Edible) {
      board.eat(coords, direction);
    } else if (targetEntity.pushable) {
      board.shove(coords, direction);
    }
  }
}
Player.attributesBySymbol = Map({ K: null });
Player.__name = 'Player'; // uglify killin' me
