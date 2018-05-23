import Shooter from './shooter';
import { Map } from 'immutable';

export default class RockyShooter extends Shooter {
  think() {}

  get content() {
    return this.symbol;
  }
}
RockyShooter.attributesBySymbol = Map({ F: null });
RockyShooter.__name = 'RockyShooter'; // uglify killin' me
