import { directions as _directions, BoardPlugin } from 'potato-engine';
import { Set } from 'immutable';

const { leftOf, rightOf, directions, allDirections, indexesByDirection } = _directions;

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

export default class DeflectionPlugin extends BoardPlugin {
  willMove(entity, direction) {
    const target = this.board.at(entity.coords, direction); // should always be null?
    if (entity.roundness !== 5 && target && target.roundness !== 5) {
      return this._deflect(entity, direction);
    }
    return direction;
  }

  _deflect(entity, direction) {
    const target = this.board.at(entity.coords, direction);

    // Does the roundness of the object I hit permit me only a particular direction?
    const directions = getDeflections(direction, target.roundness);

    if (directions) {
      const [direction1, direction2] = directions;
      // Need to check that nothing is in the way to the left or right!

      const canUse1 = !direction1
        ? false
        : this.board.canMove(entity, direction1) && this.board.canMove(entity, leftOf(direction));
      const canUse2 = !direction2
        ? false
        : this.board.canMove(entity, direction2) && this.board.canMove(entity, rightOf(direction));

      if (canUse1 && canUse2) {
        if (this.board.random.nextBoolean()) {
          direction = direction1;
        } else {
          direction = direction2;
        }
      } else if (canUse1) {
        direction = direction1;
      } else if (canUse2) {
        direction = direction2;
      }
    }
    return direction;
  }
}
