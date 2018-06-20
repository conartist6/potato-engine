import { Board, BoardDecorator } from 'potato-engine';

const replaySymbolsToDirections = {
  l: 'LEFT',
  u: 'UP',
  r: 'RIGHT',
  d: 'DOWN',
};

export default class Replayer extends BoardDecorator {
  constructor(level, replay, shouldLoop) {
    super(new Board(level));

    this._level = level;
    this._replay = replay;
    this._shouldLoop = shouldLoop;

    this._reset();
  }

  __reemitEvents() {
    this.__board.onAny((name, ...args) => {
      if (!this._shouldLoop || name !== 'end') {
        this._emitter.emit(name, ...args);
      }
    });
  }

  start(...args) {
    if (this._shouldLoop && this.done) {
      this.__board = new Board(this._level);
      this._reset();
    }
    super.start(...args);
  }

  end() {
    if (!this._shouldLoop) {
      super.end();
    }
  }

  _reset() {
    this._replayIndex = 0;
    this._tickingIndex = 0;
  }

  get done() {
    return this._replayIndex === this._replay.length;
  }

  _nextMove() {
    if (typeof this._replay[this._replayIndex] !== 'number') {
      this._tickingIndex = 0;
      return this._replay[this._replayIndex++];
    } else {
      if (++this._tickingIndex === this._replay[this._replayIndex]) {
        this._replayIndex++;
        this._tickingIndex = 0;
      }
      return null;
    }
  }

  tick() {
    const move = this._nextMove();
    super.tick(move && replaySymbolsToDirections[move]);
    if (this.done) {
      this.board.end(); // needed because the replay may not end in a win
      if (this._shouldLoop) {
        this.start();
      }
    }
  }
}
