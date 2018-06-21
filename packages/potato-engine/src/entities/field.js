import Entity from '../entity';

/**
 * Fields are immobile, and are the only game entities which other objects can exist on top of.
 * Fields can have effects on entities.
 **/
export default class Field extends Entity {
  /**
   * Triggered when an entity express intent to enter a field.
   * Return true to allow the entity to enter, or false to block it. Returns true by default.
   *
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The entering entity.
   * @param {string} direction The direction from which the entity is entering
   **/
  canEnter(board, target, direction) {
    return true;
  }

  /**
   * Triggered when an entity enters the field.
   *
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The entering entity.
   * @param {string} direction The direction from which the entity is entering
   **/
  enter(board, target, direction) {}

  /**
   * Triggered when an entity leaves the field.
   *
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The departing entity.
   * @param {string} direction The direction in which the entity is departing
   **/
  leave(board, target, direction) {}

  /**
   * Triggered when an entity express intent to leave a field.
   * Return true to allow the entity to leave, or false to block it. Returns true by default.
   *
   * @param {Board} board A subset of Board's public methods suitable for defining entity behavior.
   * @param {Entity} target The departing entity.
   * @param {string} direction The direction in which the entity is departing
   **/
  canLeave(board, target, direction) {
    return true;
  }
}
Field.__name = 'Field'; // uglify killin' me
