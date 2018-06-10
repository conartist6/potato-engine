import Shooter from './shooter';
import { Map } from 'immutable';

export default class RockyShooter extends Shooter {
  get content() {
    return 'F';
  }

  get projectileClass() {
    return this.entities.Rocky;
  }
}
RockyShooter.attributesBySymbol = Map({ F: null });
RockyShooter.__name = 'RockyShooter'; // uglify killin' me
