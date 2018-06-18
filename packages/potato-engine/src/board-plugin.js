export default class BoardPlugin {
  constructor(board, findEntities) {
    this.board = board;
  }

  track(entity, reason) {}

  untrack(entity, reason) {}
}
