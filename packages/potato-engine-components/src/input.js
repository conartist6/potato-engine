import c from 'keycode-js';
import Emitter from 'eventemitter2';

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
  constructor(getMode) {
    this._getMode = getMode;
    this._emitter = new Emitter();
  }

  keydown(event) {
    const mode = this._getMode();
    if (mode === 'game') {
      const direction = keysToDirections[event.keyCode];
      if (direction) {
        this._emitter.emit('move', direction);
      }
      switch (event.keyCode) {
        case c.KEY_P:
          this._emitter.emit('pause-unpause');
          break;
        case c.KEY_R:
          this._emitter.emit('reset');
          break;
        case c.KEY_G:
          this._emitter.emit('goto');
          event.preventDefault();
          break;
      }
    } else if (mode === 'dialog') {
      if (/[a-zA-Z]/.test(event.keyCode)) {
        this._emitter.emit('input', event.keyCode);
      }
      if (event.keyCode === c.KEY_ESCAPE) {
        this._emitter.emit('cancel-goto');
      }
    }
  }

  on(...args) {
    this._emitter.on(...args);
  }

  off(...args) {
    this._emitter.off(...args);
  }

  setMode(mode) {
    this._mode = mode;
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
    this._emitter.removeAllListeners();
  }
}
