import Shooter from './shooter';

export default class RockyShooter extends Shooter {
  constructor() {
    super();
    this.symbol = 'F';
  }

  think() {}
}
RockyShooter.__name = 'RockyShooter'; // uglify killin' me
