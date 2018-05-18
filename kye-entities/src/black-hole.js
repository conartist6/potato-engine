import Field from 'kye-engine/lib/entities/field';
import { Map } from 'immutable';
import range from 'lodash/range';

export default class BlackHole extends Field {
  interact() {}
}
BlackHole.attributesBySymbol = Map({ H: 0 });
BlackHole.__name = 'BlackHole'; // uglify killin' me
