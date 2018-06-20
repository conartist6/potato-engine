import invariant from 'invariant';

/**
 * Level: STUB
 **/
export default class Level {
  constructor(props) {
    //header, dimensions, board, index = null, seed = null) {
    this.index = null;
    this.seed = null;
    this.wrapEdges = false;
    Object.assign(this, props);
  }

  count(EntityClass) {
    return this.board.reduce(
      (count, row) =>
        row.reduce((count, entity) => count + (entity instanceof EntityClass ? 1 : 0), count),
      0,
    );
  }
}
