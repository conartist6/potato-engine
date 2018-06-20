import { Board, BoardDecorator } from 'potato-engine';

const replaySymbolsToDirections = {
  l: 'LEFT',
  u: 'UP',
  r: 'RIGHT',
  d: 'DOWN',
};

class ReplayIterator extends BoardDecorator {
  constructor(board, replay) {
    super(board);

    this._replay = replay;
    this._replayIndex = 0;
    this._tickingIndex = 0;
  }

  _isDone() {
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
  }
}

/**
 * A utility to execute a replay on a board.
 **/
export default class Replayer {
  constructor(level, replay, options) {
    this._level = level;
    this._replay = replay;
    this._options = options;
  }

  start() {
    return new ReplayIterator(new Board(this._level), this._replay);
  }
}
