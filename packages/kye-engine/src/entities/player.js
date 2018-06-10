import Interactor from './interactor';

/**
 * When you define your Player entity it should extend this class since certain game
 * rules may want to differentiate between players and non-players.
 **/
export default class Player extends Interactor {
  interact(board, targetEntity, direction) {
    board.shove(this, direction);
  }

  react() {
    return true;
  }
}
Player.__name = 'Player'; // uglify killin' me
