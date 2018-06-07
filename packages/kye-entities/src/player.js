import { default as BasePlayer } from 'kye-engine/lib/entities/player';
import { Map } from 'immutable';

export default class Player extends BasePlayer {
  get electroMagnet() {
    return true;
  }
  get idx() {
    return this.state && this.state.id;
  }
}
Player.attributesBySymbol = Map({ K: null });
Player.__name = 'Player'; // uglify killin' me
