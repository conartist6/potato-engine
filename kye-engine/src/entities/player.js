import Interactor from './interactor';

/**
 * Player is a abstract class. The engine must know which entity is the player.
 * When you define your Player entity, it must extend this class.
 **/
export default class Player extends Interactor {
  get pushable() {
    return false;
  }
}
Player.__name = 'Player'; // uglify killin' me
