import Interactor from 'kye-engine/lib/entities/interactor';
import { Map } from 'immutable';

export default class Player extends Interactor {
  get pushable() {
    return false;
  }

  interact(board, targetEntity, direction) {
    if (targetEntity instanceof board.entities.Edible) {
      board.eat(this, targetEntity);
    } else if (targetEntity.pushable) {
      board.shove(this, direction);
    }
  }
}
Player.attributesBySymbol = Map({ K: null });
Player.__name = 'Player'; // uglify killin' me
