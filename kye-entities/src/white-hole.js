import Thinker from 'kye-engine/lib/entities/thinker';
import range from 'lodash/range';

/**
 * A white hole is not a new entity type, it is merely a black hole which is digesting.
 **/
export default class WhiteHole extends Thinker {
  constructor(attribute) {
    super(attribute);
    this.fullFor = 4;
  }

  think(board, coords, entities) {
    this.fullFor--;
    if (this.fullFor === 0) {
      board.setAt(coords, new entities.BlackHole());
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
