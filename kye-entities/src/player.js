import Interactor from 'kye-engine/lib/entities/interactor';
import { Map } from 'immutable';

export default class Player extends Interactor {
  interact(board, targetEntity, direction) {
    board.shove(this, direction);
  }
}
Player.attributesBySymbol = Map({ K: null });
Player.__name = 'Player'; // uglify killin' me
