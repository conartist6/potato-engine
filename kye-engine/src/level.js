import invariant from 'invariant';

export const LEVEL_HEADER_LINES = 3;
const FIRST_LAST_ROW = /[1-9]{3,}/;
const ROW = /[1-9].+[1-9]/;

export default class Level {
  constructor(header, dimensions, board, index = null, seed = null) {
    this.header = header;
    this.dimensions = dimensions;
    this.board = board;
    this.index = index;
    this.seed = seed;
  }

  count(EntityClass) {
    return this.board.reduce(
      (count, row) =>
        row.reduce((count, entity) => count + (entity instanceof EntityClass ? 1 : 0), count),
      0,
    );
  }
}
