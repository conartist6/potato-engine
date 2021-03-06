import { Seq } from 'immutable';

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

export const indexesByDirection = Object.freeze(
  Seq.Indexed(allDirections)
    .toMap()
    .flip()
    .toObject(),
);

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
export function moveCoordsInDirection(dimensions, coords, direction, distance = 1) {
  if (!inDimensions(dimensions, coords, direction, distance)) {
    throw new Error('Attempted to move coordinates outside the board');
  }

  const { width, height } = dimensions;
  const deltaCoords = directionsAsDeltaCoords[direction];

  coords[0] = (coords[0] + width + deltaCoords[0] * distance) % width;
  coords[1] = (coords[1] + height + deltaCoords[1] * distance) % height;
}

/**
 * Given coords, create a new coordinate pair displaced from it
 * @param {string[]} coords The coords to move
 * @param {string} direction The direction of displacement
 * @param {number} distance How far to displace in the specified direction
 * @return {string[]}
 **/
export function getCoordsInDirection(dimensions, [x, y], direction, distance = 1) {
  const coords = [x, y];
  moveCoordsInDirection(dimensions, coords, direction);
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
  const { dimensions, arr } = array2d;
  const { width, height } = dimensions;
  if (!inArray2d(array2d, coords, direction, distance)) {
    return null;
  }
  const [x, y] = coords;
  let atX;
  let atY;
  if (!direction) {
    atY = (y + height) % height;
    atX = (x + width) % width;
  } else {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    atX = (x + width + dx * distance) % width;
    atY = (y + height + dy * distance) % height;
  }
  return arr[atY][atX];
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
  const { dimensions, arr } = array2d;
  const { width, height } = dimensions;
  if (!inArray2d(array2d, coords, direction, distance)) {
    return;
  }
  const [x, y] = coords;
  let atX;
  let atY;
  if (!direction) {
    atY = (y + height) % height;
    atX = (x + width) % width;
  } else {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    atX = (x + width + dx * distance) % width;
    atY = (y + height + dy * distance) % height;
  }
  arr[atY][atX] = newValue;
  return newValue;
}

export function array2d(dimensions, initialValue, entityList = []) {
  const { height, width } = dimensions;
  const arr = new Array(height);
  for (let i = 0; i < height; i++) {
    arr[i] = new Array(width);
    for (let j = 0; j < width; j++) {
      arr[i][j] = initialValue;
    }
  }
  for (const entity of entityList) {
    const [x, y] = entity.coords;
    arr[y][x] = entity;
  }
  return {
    arr,
    dimensions,
  };
}

export function* iterateArray2d(array2d) {
  const { dimensions, arr } = array2d;
  for (let i = 0; i < dimensions.height; i++) {
    for (let j = 0; j < dimensions.width; j++) {
      yield arr[i][j];
    }
  }
}

export function inDimensions(dimensions, [x, y], direction = null, distance = 1) {
  const { wrap, width, height } = dimensions;
  if (wrap === 'both') {
    return true;
  }
  if (direction) {
    const [dx, dy] = directionsAsDeltaCoords[direction];
    y = y + dy * distance;
    x = x + dx * distance;
  }
  const xInDimensions = wrap === 'x' || (x >= 0 && x < width);
  const yInDimensions = wrap === 'y' || (y >= 0 && y < height);
  return xInDimensions && yInDimensions;
}

/**
 * Determine whether particular coords (optionally displaced) are out of the bounds of a 2d array
 * @param {mixed[][]} array2d The 2D array to access
 * @param {string[]} coords The coords to move
 * @param {?string} direction The direction of displacement
 * @param {?number} distance How far to displace in the specified direction
 * @return {boolean}
 **/
export function inArray2d(array2d, coords, direction = null, distance = 1) {
  return inDimensions(array2d.dimensions, coords, direction, distance);
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

export default directions;
