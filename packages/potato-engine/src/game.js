import BoardDecorator from './board-decorator';

/**
 * The main loop!
 **/
export default class Game extends BoardDecorator {
  constructor(...args) {
    super(...args);
    this._paused = true;
  }

  tick(...args) {
    super.tick(...args);
    this._setTickTimeout();
  }

  /**
   * Start ticking at regular intervals
   **/
  start(...args) {
    this._paused = false;

    super.start(...args);
    this._setTickTimeout();
  }

  /**
   * Set the game's play/pause state
   **/
  setPaused(paused) {
    this._paused = paused;
    if (!this._paused) {
      this.tick();
    }
  }

  /**
   * Stop ticking. Permanently!
   **/
  end() {
    this._clearTickTimeout();
    super.end();
  }

  _setTickTimeout() {
    this._clearTickTimeout();
    if (!this._paused) {
      this._tickTimeout = setTimeout(() => this.tick(), 100);
    }
  }

  _clearTickTimeout() {
    if (this._tickTimeout) {
      clearTimeout(this._tickTimeout);
    }
    this._tickTimeout = null;
  }
}
