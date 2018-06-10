import { Set, Seq } from 'immutable';

/**
 * The direction constants in order: LEFT, UP, RIGHT, DOWN
 **/
export const directions = ['LEFT', 'UP', 'RIGHT', 'DOWN'];

/**
 * Orientation constants: HORIZONTAL, VERTICAL
 **/
export const orientations = ['HORIZONTAL', 'VERTICAL'];

/**
 * The direction constants including diagonal directions. Clockwise order starting from LEFT
 **/
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

// const numpad =
//   [[7, 8, 9],
//    [4, 5, 6],
//    [1, 2, 3]];

const directionsToDeflectors = {
  LEFT: [2, 3, 6, 9, 8], // Directions are getDirection's from deflectable to deflector
  UP: [4, 1, 2, 3, 6],
  RIGHT: [8, 7, 4, 1, 2],
  DOWN: [6, 9, 8, 7, 4],
};

/**
 * Map from orientations to array of the two aligned orientations
 * @type {Object}
 **/
export const directionsByOrientation = {
  HORIZONTAL: ['LEFT', 'RIGHT'],
  VERTICAL: ['UP', 'DOWN'],
};

/**
 * Map from directions to delta coordinates. E.g. RIGHT is [1, 0]
 * @type {Object}
 **/
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

/**
 * Given mutable coords, move/mutate them
 * @param {string[]} coords The coords to move
 * @param {string} direction The direction to move in
 * @param {number} distance How far to move in the specified direction
 **/
export function moveCoordsInDirection(coords, direction, distance = 1) {
  const deltaCoords = directionsAsDeltaCoords[direction];

  coords[0] = coords[0] + deltaCoords[0] * distance;
  coords[1] = coords[1] + deltaCoords[1] * distance;
}

/**
 * Given coords, create a new coordinate pair displaced from it
 * @param {string[]} coords The coords to move
 * @param {string} direction The direction of displacement
 * @param {number} distance How far to displace in the specified direction
 * @return {string[]}
 **/
export function getCoordsInDirection([x, y], direction, distance = 1) {
  const coords = [x, y];
  moveCoordsInDirection(coords, direction);
  return coords;
}

/**
 * Use coords (optionally displaced) to access an item from a 2D array.
 * @param {mixed[][]} array2d The 2D array to access
 * @param {string[]} coords The coords to move
 * @param {?string} direction The direction of displacement
 * @param {?number} distance How far to displace in the specified direction
 * @return {mixed}
 **/
export function at(array2d, coords, direction = null, distance = 1) {
  if (!inArray2d(array2d, coords, direction, distance)) {
    return null;
  }
  const [x, y] = coords;
  if (!direction) {
    return array2d[y][x];
  } else {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    return array2d[y + dy * distance][x + dx * distance];
  }
}

/**
 * Use coords (optionally displaced) to update an item in a 2D array.
 * @param {mixed[][]} array2d The 2D array to update
 * @param {string[]} coords The coords to update at
 * @param {mixed} newValue The new value
 * @param {?string} direction The direction of displacement
 * @param {?number} distance How far to displace in the specified direction
 * @return {mixed}
 **/
export function setAt(array2d, coords, newValue, direction = null, distance = 1) {
  if (!inArray2d(array2d, coords, direction, distance)) {
    return;
  }
  const [x, y] = coords;
  if (!direction) {
    array2d[y][x] = newValue;
  } else {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    const atX = x + dx * distance;
    const atY = y + dy * distance;
    array2d[atY][atX] = newValue;
  }
  return newValue;
}

/**
 * Determine whether particular coords (optionally displaced) are out of the bounds of a 2d array
 * @param {mixed[][]} array2d The 2D array to access
 * @param {string[]} coords The coords to move
 * @param {?string} direction The direction of displacement
 * @param {?number} distance How far to displace in the specified direction
 * @return {boolean}
 **/
export function inArray2d(array2d, [x, y], direction = null, distance = 1) {
  if (direction) {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    y = y + dy * distance;
    x = x + dx * distance;
  }
  return x >= 0 && x < array2d[0].length && y >= 0 && y < array2d.length;
}

/**
 * Copy coordinates from source to target
 * @param {number[]} sourceCoords source
 * @param {number[]} targetCoords target
 **/
export function copyCoords(sourceCoords, targetCoords) {
  targetCoords[0] = sourceCoords[0];
  targetCoords[1] = sourceCoords[1];
}

/**
 * Get the direction 45 degrees to your left when facing the specified direction
 * @param {string} direction specified direction
 * @return {string} new direction
 **/
export function frontLeftOf(direction) {
  return allDirections[(indexesByDirection[direction] + 7) % 8];
}

/**
 * Get the direction 90 degrees to your left when facing the specified direction
 * @param {string} direction specified direction
 * @return {string} new direction
 **/
export function leftOf(direction) {
  return allDirections[(indexesByDirection[direction] + 6) % 8];
}

/**
 * Get the direction immediately behind you when facing the specified direction
 * @param {string} direction specified direction
 * @return {string} new direction
 **/
export function flip(direction) {
  return allDirections[(indexesByDirection[direction] + 4) % 8];
}

/**
 * Get the direction 90 degrees to your right when facing the specified direction
 * @param {string} direction specified direction
 * @return {string} new direction
 **/
export function rightOf(direction) {
  return allDirections[(indexesByDirection[direction] + 2) % 8];
}

/**
 * Get the direction 45 degrees to your right when facing the specified direction
 * @param {string} direction specified direction
 * @return {string} new direction
 **/
export function frontRightOf(direction) {
  return allDirections[(indexesByDirection[direction] + 1) % 8];
}

/**
 * Is the given direction aligned with the given orientation?
 * @param {string} orientation orientation
 * @param {string} direction direction
 * @return {boolean}
 **/
export function aligned(orientation, direction) {
  return directionsByOrientation[orientation].includes(direction);
}

/**
 * Is the given direction one of the four cardinal directions?
 * @param {string} direction direction
 * @return {boolean}
 **/
export function isCardinal(direction) {
  return indexesByDirection[direction] % 2 === 0;
}

/**
 * Generate a random direction, optionally aligned with the given orientation
 * @param {Random} random Random Number Generator
 * @param {?string} orientation orientation
 * @return {string} direction
 **/
export function randomDirection(random, orientation = null) {
  if (!orientation) {
    return directions[random.nextInt(0, 3)];
  } else {
    return directionsByOrientation[orientation][random.nextInt(0, 1)];
  }
}

/**
 * Generate a random orientation
 * @param {Random} random Random Number Generator
 * @return {string} orientation
 **/
export function randomOrientation(random) {
  return orientations[random.nextInt(0, 1)];
}

/**
 * Simplistically, which cardinal direction to move to get closer to a target.
 * If no direction is the clear winner, break the tie randomly.
 * @param {number[]} fromCoords Your location
 * @param {number[]} toCoords Target location
 * @param {Random} random Random Number Generator
 * @return {string} direction
 **/
export function towards(fromCoords, toCoords, random) {
  const [fromX, fromY] = fromCoords;
  const [toX, toY] = toCoords;
  const dx = fromX - toX;
  const dy = fromY - toY;
  const xDist = Math.abs(dx);
  const yDist = Math.abs(dy);
  let direction;

  let orientation;
  if (xDist > yDist) {
    orientation = 'HORIZONTAL';
  } else if (yDist > xDist) {
    orientation = 'VERTICAL';
  } else {
    orientation = randomOrientation(random);
  }
  const delta = orientation === 'HORIZONTAL' ? dx : dy;
  return directionsByOrientation[orientation][delta > 0 ? 0 : 1];
}

/**
 * The manhattan distance between two coordinates
 * @param {number[]} fromCoords from coordinates
 * @param {number[]} toCoords to coordninates
 * @return {number}
 **/
export function manhattan(fromCoords, toCoords) {
  const { abs } = Math;
  const [fromX, fromY] = fromCoords;
  const [toX, toY] = toCoords;

  return abs(fromX - toX) + abs(fromY - toY);
}

/**
 * When colliding with a round obstacle, which directions might its roundness enable you to move in?
 * @param {string} direction The direction in which you are attempting to move
 * @param {number} toRoundess The roundess of the obstacle
 * @return {string[]} Array of 0, 1, or 2 cardinal directions
 **/
export function getDeflections(direction, toRoundess) {
  if (toRoundess === 5) {
    return null;
  }

  let localDeflection =
    toRoundess === 0 ? 2 : directionsToDeflectors[direction].indexOf(toRoundess);
  // -1: no deflect, 0/1: deflect local left, 2  either deflection possible, 3/4: deflect local right

  return localDeflection < 0 ? null : deflections[direction][localDeflection];
}

export default directions;
