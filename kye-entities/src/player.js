import Interactor from 'kye-engine/lib/entities/interactor';
import { Map } from 'immutable';

export default class Player extends Interactor {
  get pushable() {
    return false;
  }

  interact(board, direction, entities) {
    const targetEntity = board.at(this.coords, direction);
    if (targetEntity instanceof entities.Edible) {
      board.eat(this, direction);
    } else if (targetEntity.pushable) {
      board.shove(this, direction);
    }
  }
}
Player.attributesBySymbol = Map({ K: null });
Player.__name = 'Player'; // uglify killin' me
