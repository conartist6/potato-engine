import Thinker from 'kye-engine/lib/entities/thinker';
import range from 'lodash/range';

/**
 * A white hole is not a new entity type, it is merely a black hole which is digesting.
 **/
export default class WhiteHole extends Thinker {
  constructor() {
    super(...arguments);
    this.fullFor = 4;
  }

  think(board, entities) {
    const { coords } = this;
    this.fullFor--;
    if (this.fullFor === 0) {
      const { BlackHole } = entities;
      board.replace(this, new BlackHole(this.coords));
    }
  }

  get freqency() {
    return 5;
  }

  get pushable() {
    return this.fullFor === 1;
  }

  get pullable() {
    return false;
  }
}
WhiteHole.__name = 'WhiteHole'; // uglify killin' me
