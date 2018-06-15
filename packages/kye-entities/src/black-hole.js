import Field from 'potato-engine/lib/entities/field';
import { Map } from 'immutable';

export default class BlackHole extends Field {
  enter(board, entity) {
    entity.destroy();
    const { WhiteHole } = board.entities;
    this.replace(new WhiteHole(this.coords));
  }
}
BlackHole.attributesBySymbol = Map({ H: 0 });
BlackHole.__name = 'BlackHole'; // uglify killin' me
