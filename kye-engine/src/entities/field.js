import Base from './base';

/**
 * Fields are immobile, and are the only game entities which other objects can exist on top of.
 * Fields can have effects on entities.
 **/
export default class Field extends Base {
  /**
   * Triggered when an entity enters the field.
   * If the entity moves from one field to another of the same type this will not trigger.
   * The default (empty) implementation will allow the entity to move onto the field.
   * You may return true from this method to cancel the entity's movement.
   *
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The colliding entity.
   * @returns {boolean} Return true to cancel the intended movement.
   **/
  enter(board, target) {
    return false;
  }

  /**
   * Triggered when an entity leaves the field.
   * If the entity moves from one field to another of the same type this will not trigger.
   * The default (empty) implementation will allow the entity to move off of the field.
   * You may return true from this method to cancel the entity's movement.
   *
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The colliding entity.
   * @returns {boolean} Return true to cancel the intended movement.
   **/
  leave(board, target) {
    return false;
  }
}
Field.__name = 'Field'; // uglify killin' me
