import Thinker from 'kye-engine/lib/entities/thinker';
import { Map } from 'immutable';

export default class Shooter extends Thinker {
  constructor(...args) {
    super(...args);
    this.direction = 'UP';
  }

  get frequency() {
    return 7;
  }

  get content() {
    return this.symbol;
  }

  think() {}
}
Shooter.attributesBySymbol = Map({ A: null });
Shooter.__name = 'Shooter'; // uglify killin' me
