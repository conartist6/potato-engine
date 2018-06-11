import Thinker from 'potato-engine/lib/entities/thinker';
import { Map } from 'immutable';

export default class Timer extends Thinker {
  constructor(...args) {
    super(...args);
    this.timelet = 5;
  }
  get timer() {
    return this.__attribute;
  }

  get frequency() {
    return 5;
  }

  get content() {
    return this.timer;
  }

  think() {
    if (--this.timelet === 0) {
      if (this.timer === 0) {
        this.destroy();
      } else {
        this.timelet = 6;
        this.replace(this.timer - 1);
      }
    }
  }
}
Timer.attributesBySymbol = Map({ '}': 3, '|': 4, '{': 5, z: 6, y: 7, x: 8, w: 9 });
Timer.__name = 'Timer'; // uglify killin' me
