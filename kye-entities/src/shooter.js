import Thinker from 'kye-engine/lib/entities/thinker';

export default class Shooter extends Thinker {
  constructor() {
    super();
    this.direction = 'UP';
    this.freq = 7;
    this.symbol = 'A';
  }

  think() {}
}
Shooter.__name = 'Shooter'; // uglify killin' me
