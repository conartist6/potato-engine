import Interactor from './interactor';

export default class Thinker extends Interactor {
  constructor() {
    super();
    this.frequency = 1;
  }
  /**
   * Thinkers get to call their think method every `frequency` game ticks.
   * Thinkers get to think in the right to left, top to bottom order that they
   * were added to the game board.
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Array} coords The coordinates of this entity on the board. These are not a copy, changing them will move the object!
   * @param {Object} entities The map of entities, necessary to avoid circular dependencies when referencing another entity.
   **/
  think(board, coords, entities) {}
}
Thinker.__name = 'Thinker'; // uglify killin' me
