import Base from 'kye-engine/lib/entities/base';

export default class Block extends Base {
  constructor(isRound) {
    super();
    this.isRound = isRound;
    this.frequency = 1;
  }

  get symbol() {
    return this.isRound ? 'B' : 'b';
  }

  get roundness() {
    return this.isRound ? 0 : 5;
  }

  get attribute() {
    return this.isRound ? 'ROUND' : 'SQUARE';
  }

  static validParams() {
    return [true, false];
  }
}
Block.__name = 'Block'; // uglify killin' me
