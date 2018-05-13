import invariant from 'invariant';
import entities from '../../entities';

export const LEVEL_HEADER_LINES = 3;
const FIRST_LAST_ROW = /[1-9]{3,}/;
const ROW = /[1-9].+[1-9]/;

export default class Level {
  constructor(header, dimensions, board, index) {
    this.header = header;
    this.dimensions = dimensions;
    this.board = board;
    this.index = index;
  }

  count(EntityClass) {
    return this.board.reduce(
      (count, row) =>
        row.reduce((count, entity) => count + (entity instanceof EntityClass ? 1 : 0), count),
      0,
    );
  }

  serialize() {
    const { code, hint, completionMessage } = this.header;
    return [
      code,
      hint,
      completionMessage,
      ...this.board.map(line =>
        line
          .map(inst => {
            const { symbol } = inst;
            invariant(
              symbol,
              'Unable to serialize level. Most likely a timer has too low a count.',
            );
            return symbol;
          })
          .join(''),
      ),
    ].join('\n');
  }

  static parse(text, firstLine = 0, index = 0) {
    const lines = typeof text === 'string' ? text.split('\n') : text;
    const header = this._parseHeader(lines.slice(firstLine, LEVEL_HEADER_LINES + firstLine));
    const dimensions = this._findDimensions(lines, firstLine + LEVEL_HEADER_LINES);
    const board = this.parseBoard(
      lines.slice(
        firstLine + LEVEL_HEADER_LINES,
        firstLine + LEVEL_HEADER_LINES + dimensions.height,
      ),
    );
    return new Level(header, dimensions, board, index);
  }

  static _parseHeader(headerLines) {
    invariant(headerLines.length === LEVEL_HEADER_LINES, 'Unexpected end of input');
    const [code, hint, completionMessage] = headerLines;
    invariant(code, 'A level must have a level code');
    return {
      code,
      hint,
      completionMessage,
    };
  }

  static _findDimensions(lines, firstLine) {
    invariant(
      FIRST_LAST_ROW.test(lines[firstLine]),
      'Expected board to start with a row containing only `5`s.',
    );
    const width = lines[firstLine].length;
    let height = 1;
    let row;
    while ((row = lines[height + firstLine]) && ROW.test(row)) {
      invariant(row.length === width, 'Expected every line in the board to have the same length.');
      height++;
    }
    invariant(
      FIRST_LAST_ROW.test(lines[firstLine + height - 1]),
      'Expected board to end with a row containing only `5`s.',
    );
    return { width, height };
  }

  static parseBoard(lines) {
    return lines.map(line =>
      line.split('').map(symbol => {
        const inst = symbol === ' ' ? null : entities.getBySymbol(symbol);
        invariant(symbol === ' ' || inst, 'Level contained unkown symbol %s.', symbol);
        return inst;
      }),
    );
  }
}
