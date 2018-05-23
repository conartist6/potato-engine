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

  get content() {
    return this.symbol;
  }

  think() {
    const { random, board, entities } = this;
    const nearestPlayer = this.findNearestPlayer();

    if (random.nextBoolean() && nearestPlayer) {
      const direction = towards(this.coords, nearestPlayer.coords, random);

      if (!(board.at(this.coords, direction) instanceof entities.BlackHole)) {
        board.move(direction);
      }
    } else {
      board.move(this, randomDirection(random));
    }
  }

  eatPlayer(board, targetEntity) {
    if (targetEntity instanceof board.entities.Player) {
      this.eat(targetEntity);
    }
  }

  interact() {
    this.eatPlayer(...arguments);
  }

  react() {
    this.eatPlayer(...arguments);
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
