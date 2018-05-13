import Thinker from 'kye-engine/lib/entities/thinker';
import range from 'lodash/range';

const timers = ['}', '|', '{', 'z', 'y', 'x', 'w'];

export default class Timer extends Thinker {
  constructor(timer = 0) {
    super(false);
    this.timer = timer;
  }

  think() {}

  get symbol() {
    return timers[this.timer - 3];
  }

  static validParams() {
    return range(1, 10);
  }
}
Timer.__name = 'Timer'; // uglify killin' me
