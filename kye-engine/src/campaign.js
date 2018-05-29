import { Map } from 'immutable';

/**
 * A campaign consists of multiple levels. Each level has a code.
 **/
export default class Campaign {
  constructor(levels, seed) {
    this.seed = seed;
    this.levels = levels;
    this.levelsByCode = Map(levels.map(level => [level.header.code, level]));
  }
}
