import { entities } from 'kye-engine';
import invariant from 'invariant';

export function parse(lines) {
  return lines.map((line, y) =>
    line.split('').map((symbol, x) => {
      const EntityType = entities.getEntityTypeBySymbol(symbol);
      const inst = EntityType && new EntityType([x, y], EntityType.attributesBySymbol.get(symbol));
      invariant(
        symbol === ' ' || inst,
        'Level contained unknown symbol %s (dec %s).',
        symbol,
        symbol.charCodeAt(0),
      );
      return inst;
    }),
  );
}

export function serialize(board) {
  return board.board
    .map(line =>
      line
        .map(inst => {
          let symbol = ' ';
          if (inst) {
            symbol = inst.symbol;
            invariant(
              symbol,
              'Unable to serialize level. Tried to serialize %s with attribute %s, which is not serializable.',
              inst.constructor.__name,
              inst.attribute,
            );
          }

          return symbol;
        })
        .join(''),
    )
    .join('\n');
}
