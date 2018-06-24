/**
 * This is the base class for Potato Engine Plugins.
 **/
export default class BoardPlugin {
  constructor(board, findEntities) {
    this.board = board;
  }

  /**
   * When a new entity enters a square or is added to the board, gives a plugin a chance to do
   * additional setup on it.
   **/
  track(entity, reason) {}

  /**
   * When an entity leaves a square or is removed from the board, gives a plugin a chance to do
   & additional teardown on it.
   **/
  untrack(entity, reason) {}

  /**
   * When an entity takes its turn during a game tick, gives a plugin a chance to take some action.
   * Note that an entity will not get a chance to take its turn if it is sleeping.
   **/
  onEntityTick(entity) {}

  /**
   * When an entity has expressed intent to move, allow a plugin to alter the direction it intends
   * to move or cancel the move.
   **/
  willMove(entity, direction) {
    return direction;
  }
}
