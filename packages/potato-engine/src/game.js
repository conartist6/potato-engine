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
  start() {
    this._paused = false;

    super.start();
    this._setTickTimeout();
  }

  get paused() {
    return this._paused;
  }

  /**
   * Set the game's play/pause state
   **/
  setPaused(paused) {
    if (!paused && this._paused) {
      this.tick();
    } else if (paused && !this._paused) {
      this._clearTickTimeout();
    }
    this._paused = paused;
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

    this._tickTimeout = setTimeout(() => this.tick(), 100);
  }

  _clearTickTimeout() {
    if (this._tickTimeout) {
      clearTimeout(this._tickTimeout);
    }
    this._tickTimeout = null;
  }
}
