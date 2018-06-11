import MagnetBase from 'potato-engine/lib/entities/magnet';
import { Map } from 'immutable';

export default class Magnet extends MagnetBase {
    get frequency() {
        return 1;
    }

    get orientation() {
        return this.__attribute;
    }
}
Magnet.attributesBySymbol = Map({ S: 'HORIZONTAL', s: 'VERTICAL' });
Magnet.__name = 'Magnet'; // uglify killin' me
