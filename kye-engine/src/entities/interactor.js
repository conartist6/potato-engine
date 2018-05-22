import Base from './base';

export default class Interactor extends Base {
  /**
   * Triggered when you are colliding with another entity.
   * If you do nothing the entity will continue to be in your way. You will not move.
   * If you desire to move into the entity's square, you must either eat it or shove it.
   * If you eat or shove the entity, clearing the square, your movement will proceed as
   * initiated unless your return true from this method, which will cancel the movement.
   *
   * A magnet's pull never triggers an interaction'.
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The colliding entity.
   * @param {String} direction The direction from the colliding entity to the entity being collided with.
   * @returns {boolean} Return true to cancel the intended movement.
   **/
  interact(board, target, direction) {
    return false;
  }

  /**
   * After an entity interacts with you, you get a chance to do something to it so long
   * as either it is still adjacent to you or it has eaten you. You cannot react to
   * being pushed. Sorry!
   *
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The colliding entity.
   * @param {String} direction The direction from this entity to the colliding entity.
   **/
  react(board, target, direction) {}
}
Interactor.__name = 'Interactor'; // uglify killin' me
