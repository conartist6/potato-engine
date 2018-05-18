import MagnetBase from 'kye-engine/lib/entities/magnet';
import { Map } from 'immutable';

export default class Magnet extends MagnetBase {
  constructor(orientation) {
    super(orientation);
  }

  get frequency() {
    return 1;
  }

  get orientation() {
    return this.attribute;
  }
}
Magnet.attributesBySymbol = Map({ S: 'HORIZONTAL', s: 'VERTICAL' });
Magnet.__name = 'Magnet'; // uglify killin' me
