import { Set, Seq } from 'immutable';

export const directions = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
export const orientations = ['HORIZONTAL', 'VERTICAL'];
export const allDirections = [
  'LEFT',
  'UP_LEFT',
  'UP',
  'UP_RIGHT',
  'RIGHT',
  'DOWN_RIGHT',
  'DOWN',
  'DOWN_LEFT',
];
const indexesByDirection = Object.freeze(
  Seq.Indexed(allDirections)
    .toMap()
    .flip()
    .toObject(),
);
const deflections = Object.freeze(
  Set(directions)
    .toMap()
    .map(direction => {
      const left = allDirections[(indexesByDirection[direction] + 7) % 8];
      const right = allDirections[(indexesByDirection[direction] + 1) % 8];
      return [[left, null], [left, null], [left, right], [null, right], [null, right]];
    })
    .toObject(),
);

export const directionsByOrientation = {
  HORIZONTAL: ['LEFT', 'RIGHT'],
  VERTICAL: ['UP', 'DOWN'],
};

// const numpad =
//   [[7, 8, 9],
//    [4, 5, 6],
//    [1, 2, 3]];

export const directionsToDeflectors = {
  LEFT: [2, 3, 6, 9, 8], // Directions are getDirection's from deflectable to deflector
  UP: [4, 1, 2, 3, 6],
  RIGHT: [8, 7, 4, 1, 2],
  DOWN: [6, 9, 8, 7, 4],
};

export const directionsAsDeltaCoords = {
  LEFT: [-1, 0],
  UP_LEFT: [-1, -1],
  UP: [0, -1],
  UP_RIGHT: [1, -1],
  RIGHT: [1, 0],
  DOWN_RIGHT: [1, 1],
  DOWN: [0, 1],
  DOWN_LEFT: [-1, 1],
};

export function moveCoordsInDirection(coords, direction, distance = 1) {
  const deltaCoords = directionsAsDeltaCoords[direction];

  coords[0] = coords[0] + deltaCoords[0] * distance;
  coords[1] = coords[1] + deltaCoords[1] * distance;
}

export function at(board, coords, direction = null, distance = 1) {
  if (!inBoard(board, coords, direction, distance)) {
    return null;
  }
  const [x, y] = coords;
  if (!direction) {
    return board[y][x];
  } else {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    return board[y + dy * distance][x + dx * distance];
  }
}

export function setAt(board, coords, newValue, direction = null, distance = 1) {
  if (!inBoard(board, coords, direction, distance)) {
    return;
  }
  const [x, y] = coords;
  if (!direction) {
    board[y][x] = newValue;
  } else {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    const atX = x + dx * distance;
    const atY = y + dy * distance;
    board[atY][atX] = newValue;
  }
}

export function inBoard(board, [x, y], direction = null, distance = 1) {
  if (direction) {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    y = y + dy * distance;
    x = x + dx * distance;
  }
  return x >= 0 && x < board[0].length && y >= 0 && y < board.length;
}

export function copyCoords(sourceCoords, targetCoords) {
  targetCoords[0] = sourceCoords[0];
  targetCoords[1] = sourceCoords[1];
}

export function coordsAreEqual(fromCoords, toCoords, direction) {
  if (!direction) {
    return fromCoords[0] === toCoords[0] && fromCoords[1] === toCoords[1];
  }
  const [dx, dy] = directionsAsDeltaCoords[direction];
  return fromCoords[0] + dx === toCoords[0] && fromCoords[1] + dy === toCoords[1];
}

export function getCoordsInDirection(coords, direction, distance = 1) {
  const newCoords = [...coords];
  moveCoordsInDirection(newCoords, direction, distance);
  return newCoords;
}

export function leftOf(direction) {
  return allDirections[(indexesByDirection[direction] + 6) % 8];
}

export function flip(direction) {
  return allDirections[(indexesByDirection[direction] + 4) % 8];
}

export function rightOf(direction) {
  return allDirections[(indexesByDirection[direction] + 2) % 8];
}

export function aligned(orientation, direction) {
  return directionsByOrientation[orientation].includes(direction);
}

export function randomDirection(orientation = null) {
  if (!orientation) {
    return directions[Math.floor(Math.random() * 3 + 0.5)];
  } else {
    return directionsByOrientation[orientation][Math.floor(Math.random() + 0.5)];
  }
}

export function getDeflections(fromCoords, direction, toRoundess) {
  if (toRoundess === 5) {
    return null;
  }

  let localDeflection =
    toRoundess === 0 ? 2 : directionsToDeflectors[direction].indexOf(toRoundess);
  // -1: no deflect, 0/1: deflect local left, 2  either deflection possible, 3/4: deflect local right

  return localDeflection < 0 ? null : deflections[direction][localDeflection];
}

export default directions;
