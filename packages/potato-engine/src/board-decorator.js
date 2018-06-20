import Board from './board';
import pipe from 'event-emitter/pipe';
import makeEmitter from 'event-emitter';

/**
 * A base class for things which wish to look like a board.
 **/
export default class BoardDecorator {
  constructor(board) {
    this.__board = board;

    // prettier-ignore
    pipe(board, this, '_emit');
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

  start(event, listener) {
    this.__board.start(event, listener);
  }

  end() {
    this.__board.end();
  }
}

makeEmitter(BoardDecorator.prototype);
