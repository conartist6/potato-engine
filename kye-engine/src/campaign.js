import { Map } from 'immutable';

export default class Campaign {
  constructor(levels, seed) {
    this.seed = seed;
    this.levels = levels;
    this.levelsByCode = Map(levels.map(level => [level.header.code, level]));
  }
}
