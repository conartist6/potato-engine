import MagnetBase from 'kye-engine/lib/entities/magnet';

import { orientations } from 'kye-engine/lib/directions';

const symbolsByOrientation = {
  HORIZONTAL: 'S',
  VERTICAL: 's',
};

export default class Magnet extends MagnetBase {
  constructor(orientation) {
    super(orientation);
    this.frequency = 1;
  }

  get symbol() {
    return symbolsByOrientation[this.orientation];
  }

  get attribute() {
    return this.orientation;
  }

  static validParams() {
    return orientations;
  }
}
Magnet.__name = 'Magnet'; // uglify killin' me
