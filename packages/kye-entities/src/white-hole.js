import Thinker from 'kye-engine/lib/entities/thinker';

/**
 * A white hole is not a new entity type, it is merely a black hole which is digesting.
 **/
export default class WhiteHole extends Thinker {
  constructor(coords, attribute = 4, ...args) {
    super(coords, attribute, ...args);
  }

  think(board) {
    const { coords } = this;

    if (this.fullFor === 1) {
      const { BlackHole } = board.entities;
      this.replace(new BlackHole(this.coords));
    }
    this.__attribute--;
  }

  react() {
    return this.fullFor < 4;
  }

  get fullFor() {
    return this.__attribute;
  }

  get frequency() {
    return 5;
  }

  get nonFerrous() {
    return true;
  }
}
WhiteHole.__name = 'WhiteHole'; // uglify killin' me
