import { default as BasePlayer } from 'potato-engine/lib/entities/player';
import { Map } from 'immutable';

export default class Player extends BasePlayer {
    get electroMagnet() {
        return true;
    }
}
Player.attributesBySymbol = Map({ K: null });
Player.__name = 'Player'; // uglify killin' me
