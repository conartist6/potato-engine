import Edible from './edible';
import { Map } from 'immutable';

export default class Diamond extends Edible {
  get twinkles() {
    return true;
  }

  react(board) {
    const { coords } = this;
    const eaten = board.at(coords) !== this;
    if (eaten) {
      board.once('tick', () => {
        board.emit('progress', this);
        if (board.getState().diamondsLeft === 0) {
          board.emit('win');
        }
      });
    }
  }
}
Diamond.attributesBySymbol = Map({ '*': null });
Diamond.__name = 'Diamond'; // uglify killin' me
