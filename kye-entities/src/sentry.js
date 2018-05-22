import Thinker from 'kye-engine/lib/entities/thinker';
import { Map } from 'immutable';
import directions, { flip } from 'kye-engine/lib/directions';

export default class Sentry extends Thinker {
  think(board) {
    board.move(this, this.direction);
  }

  interact(board, targetEntity, direction) {
    const shoved = targetEntity.pushable && board.shove(this, direction);

    this.replace(flip(this.direction));
    return shoved;
  }

  get frequency() {
    return 5;
  }

  get direction() {
    return this.attribute;
  }
}
Sentry.attributesBySymbol = Map({ U: 'UP', D: 'DOWN', L: 'LEFT', R: 'RIGHT' });
Sentry.__name = 'Sentry'; // uglify killin' me
