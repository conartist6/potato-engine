import Edible from './edible';

export default class Diamond extends Edible {
  constructor() {
    super();
    this.symbol = '*';
    this.twinkles = true;
  }
  react(board, coords, direction, entities) {
    const eaten = board.at(coords, direction) !== this;
    if (eaten) {
      boad.once('tick', () => {
        board.emit('progress', this);
        if (board.getState().diamondsLeft === 0) {
          board.emit('win');
        }
      });
    }
  }
}
Diamond.__name = 'Diamond'; // uglify killin' me
