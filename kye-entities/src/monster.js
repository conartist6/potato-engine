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

  think(board) {
    const { coords } = this;
    if (board.random.nextBoolean()) {
      board.seek(this);
    } else {
      board.move(this, randomDirection(board.random));
    }
  }

  eatPlayers(board, targetEntity) {
    if (targetEntity instanceof board.entities.Player) {
      this.eat(targetEntity);
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
