import Thinker from 'kye-engine/lib/entities/thinker';
import { Map } from 'immutable';
import directions, { flip } from 'kye-engine/lib/directions';

export default class Sentry extends Thinker {
  think(board, coords) {
    board.move(coords, this.direction);
  }

  interact(board, coords, direction, entities) {
    const targetEntity = board.at(coords, direction);
    const shoved = targetEntity.pushable && board.shove(coords, direction);
    board.setAt(coords, new entities.Sentry(flip(this.direction)));
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
