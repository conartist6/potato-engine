import { parse as parseBoard, serialize as serializeBoard } from './board';
import { Level } from 'potato-engine';
import invariant from 'invariant';

export const LEVEL_HEADER_LINES = 3;
const FIRST_LAST_ROW = /[1-9]{3,}/;
const ROW = /[1-9].+[1-9]/;

function _parseHeader(headerLines) {
  invariant(headerLines.length === LEVEL_HEADER_LINES, 'Unexpected end of input');
  const [code, hint, completionMessage] = headerLines;
  invariant(code, 'A level must have a level code');
  return {
    code,
    hint,
    completionMessage,
  };
}

function _findDimensions(lines, firstLine) {
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

export function parse(text, firstLine = 0, campaign = null) {
  const lines = typeof text === 'string' ? text.split(/\r?\n/) : text;
  const header = _parseHeader(lines.slice(firstLine, LEVEL_HEADER_LINES + firstLine));
  const dimensions = _findDimensions(lines, firstLine + LEVEL_HEADER_LINES);
  const board = parseBoard(
    lines.slice(firstLine + LEVEL_HEADER_LINES, firstLine + LEVEL_HEADER_LINES + dimensions.height),
  );
  return new Level(header, dimensions, board, campaign);
}

export function serialize(level) {
  const { code, hint, completionMessage } = level.header;
  return [code, hint, completionMessage, serializeBoard(level.board)].join('\n');
}
