import Emitter from 'eventemitter2';

export class BrowserInput {
  constructor() {
    this.__emitter = new Emitter();
    this.keydown = this.keydown.bind(this);
  }

  on(...args) {
    this.__emitter.on(...args);
  }

  off(...args) {
    this.__emitter.off(...args);
  }

  keydown(event) {
    this._emitter.emit('keydown', event);
  }

  start(event, listener) {
    document.addEventListener('keydown', this.keydown);
  }

  end() {
    document.removeEventListener('keydown', this.keydown);
  }
}
