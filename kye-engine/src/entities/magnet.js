import Thinker from './thinker';

export default class Magnet extends Thinker {
  constructor(orientation) {
    super();
    this.orientation = orientation;
  }

  think() {
    // I wish it were easy to swap out magnet logic, but original Kye's logic was very
    // dependent on iterating through objects and checking them for magnet attraction as
    // opposed to iterating through magnets and checking object attraction.
  }
}
Magnet.__name = 'Magnet'; // uglify killin' me