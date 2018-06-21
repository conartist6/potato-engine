import Board from './board';
import Emitter from 'eventemitter2';

/**
 * A base class for things which wish to look like a board.
 **/
export default class BoardDecorator {
  constructor(board) {
    this.__board = board;
    this._emitter = new Emitter();
  }

  on(...args) {
    this._emitter.on(...args);
  }

  off(...args) {
    this._emitter.off(...args);
  }

  onAny(...args) {
    this._emitter.onAny(...args);
  }

  offAny(...args) {
    this._emitter.offAny(...args);
  }

  once(...args) {
    this._emitter.once(...args);
  }

  /**
   * Get the actual board (not a decorator).
   **/
  get board() {
    return this.__board instanceof Board ? this.__board : this.__board.board;
  }

  tick(playerDirection) {
    this.__board.tick(playerDirection);
  }

  __reemitEvents() {
    this.__board.onAny((name, ...args) => this._emitter.emit(name, ...args));
  }

  start() {
    this.__reemitEvents();
    this.__board.start();
    if (this._onEnd) {
      this.off('end', this._onEnd);
    }
    this.on('end', (this._onEnd = () => this.end()));
  }

  end() {
    this.__board.end();
    this._emitter.removeAllListeners();
  }
}
