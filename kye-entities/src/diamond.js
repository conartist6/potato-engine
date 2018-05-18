import Edible from './edible';
import { Map } from 'immutable';

export default class Diamond extends Edible {
  constructor(attribute) {
    super(attribute);
  }

  get twinkles() {
    return true;
  }

  react(board, coords, direction, entities) {
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
