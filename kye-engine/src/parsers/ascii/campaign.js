import { Map } from 'immutable';
import Level, { LEVEL_HEADER_LINES } from './level';
import invariant from 'invariant';

export default class Campaign {
  constructor(levels) {
    this.levels = levels;
    this.levelsByCode = Map(levels.map(level => [level.code, level]));
  }
  serialize() {
    return ['' + this.levels.length, ...this.levels.map(level => level.serialize())].join('\n');
  }
  static parse(text) {
    const lines = text.split('\n');
    const nLevels = Number(lines[0]);
    invariant(!isNaN(nLevels), "A Kye Campaign's first line must be the number of levels in it.");
    let levelFirstLine = 1;
    const levels = [];
    for (let i = 0; i < nLevels; i++) {
      invariant(
        lines.length > levelFirstLine,
        '%s levels specified in campaign, but consumed all lines after reading %s levels.',
        nLevels,
        i,
      );
      const level = Level.parse(lines, levelFirstLine, i);
      levels.push(level);
      levelFirstLine += level.dimensions.height + LEVEL_HEADER_LINES;
    }

    return new Campaign(levels);
  }
}
