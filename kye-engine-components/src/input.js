import c from 'keycode-js';
import makeEmitter from 'event-emitter';
import allOff from 'event-emitter/all-off';

const keysToDirections = {
  [c.KEY_UP]: 'UP',
  [c.KEY_W]: 'UP',
  [c.KEY_DOWN]: 'DOWN',
  [c.KEY_S]: 'DOWN',
  [c.KEY_LEFT]: 'LEFT',
  [c.KEY_A]: 'LEFT',
  [c.KEY_RIGHT]: 'RIGHT',
  [c.KEY_D]: 'RIGHT',
};

export default class Input {
  keydown(event) {
    const direction = keysToDirections[event.keyCode];
    if (direction) {
      this.emit('input', direction);
    }
    switch (event.keyCode) {
      case c.KEY_P:
        this.emit('pause-unpause');
        break;
      case c.KEY_R:
        this.emit('reset');
        break;
    }
  }
  start(event, listener) {
    this._listener = e => this.keydown(e);
    document.addEventListener('keydown', this._listener);
    if (listener) {
      this.on(event, listener);
    }
  }
  end() {
    if (this._listener) {
      document.removeEventListener('keydown', this._listener);
    }
    this._listener = null;
    allOff(this);
  }
}
makeEmitter(Input.prototype);
