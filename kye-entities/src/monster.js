import Interactor from 'kye-engine/lib/entities/interactor';
import { Map } from 'immutable';
import { randomDirection } from 'kye-engine/lib/directions';

export default class Monster extends Interactor {
  get frequency() {
    return 3;
  }

  get opportunistic() {
    return true;
  }

  think(board, coords) {
    if (board.random.nextBoolean()) {
      board.seek(coords);
    } else {
      board.move(coords, randomDirection(board.random));
    }
  }

  eatPlayers(board, coords, direction, entities) {
    const targetEntity = board.at(coords, direction);
    if (targetEntity instanceof entities.Player) {
      board.eat(coords, direction);
    }
  }

  interact() {
    this.eatPlayers(...arguments);
  }

  react() {
    this.eatPlayers(...arguments);
  }

  get type() {
    return this.attribute;
  }
}
Monster.attributesBySymbol = Map({
  E: 'GNASHER',
  T: 'TWISTER',
  '[': 'SPIKE',
  '~': 'SNAKE',
  C: 'BLOB',
});
Monster.__name = 'Monster'; // uglify killin' me
