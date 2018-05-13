import Interactor from 'kye-engine/entities/interactor';

export default class Player extends Interactor {
  constructor() {
    super();
    this.symbol = 'K';
    this.pushable = false;
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
Player.__name = 'Player'; // uglify killin' me
