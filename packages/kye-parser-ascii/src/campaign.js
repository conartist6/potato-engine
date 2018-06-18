import { Map } from 'immutable';
import { parse as parseLevel, serialize as serializeLevel, LEVEL_HEADER_LINES } from './level';
import invariant from 'invariant';
import Prando from 'prando';
import { Campaign } from 'potato-engine';
import stripBom from 'strip-bom';

export function serialize(campaign) {
  return ['' + campaign.levels.length, ...campaign.levels.map(serializeLevel)].join('\n');
}

export function parse(text, seed) {
  const lines = stripBom(text).split(/\r?\n/);
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
    const levelSeed = seed && new Prando(seed).nextInt(0, 99999999);
    const level = parseLevel(lines, levelFirstLine, i, levelSeed);
    levels.push(level);
    levelFirstLine += level.dimensions.height + LEVEL_HEADER_LINES;
  }

  return new Campaign(levels, seed);
}
