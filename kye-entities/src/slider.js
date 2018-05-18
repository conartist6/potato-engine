import Thinker from 'kye-engine/lib/entities/thinker';
import { Map } from 'immutable';

import directions from 'kye-engine/lib/directions';

export default class Slider extends Thinker {
  get direction() {
    return this.attribute;
  }

  think(board, coords) {
    board.move(coords, this.direction);
  }
}
Slider.attributesBySymbol = Map({ u: 'UP', d: 'DOWN', l: 'LEFT', r: 'RIGHT' });
Slider.__name = 'Slider'; // uglify killin' me
