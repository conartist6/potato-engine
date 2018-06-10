import Interactor from './interactor';

/**
 * Thinker: STUB
 **/
export default class Thinker extends Interactor {
  /**
   * An opportunistic thinker gets to make a move if the player makes one.
   */
  get opportunistic() {
    return false;
  }

  /**
   * Thinkers get to call their think method every `frequency` game ticks.
   * Thinkers get to think in the right to left, top to bottom order that they
   * were added to the game {@param board}.
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   **/
  think(board) {}
}
Thinker.__name = 'Thinker'; // uglify killin' me
