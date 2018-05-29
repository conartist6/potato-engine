import invariant from 'invariant';

/**
 * Level: STUB
 **/
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
