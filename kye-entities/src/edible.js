import Interactor from 'kye-engine/lib/entities/interactor';

export default class Edible extends Interactor {
  constructor() {
    super();
    this.pushable = false;
    this.symbol = 'e';
  }
}
Edible.__name = 'Edible'; // uglify killin' me
