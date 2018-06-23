import { entities, directions as _directions, BoardPlugin } from 'potato-engine';

const { at, setAt, array2d, aligned, directions, directionsByOrientation } = _directions;

// Magnets are polar, i.e. two horizontal magnets (S S) will not snap together.
// Pulling is passive, being pulled happens on your turn.
// For this to work right, objects must be attracted (move in response to detecting a magnet)
// 55555      55555
// 5s S5      5 s 5
// 5   5  =>  5  S5
// 5S s5      5Ss 5
// 55555      55555
// Magnetized bouncing also occurs in Python kye and kye2.0: (works w/ B too)
// Ss S   =>  S sS   =>  Ss S   =>  ... ad infintem
// This suggests that being attracted has priority over being stuck

export default class MagnetismPlugin extends BoardPlugin {
  constructor(board, findEntities) {
    super(board, findEntities);

    this._magnetization = array2d(board.dimensions, 0);
    for (const magnet of findEntities(s => s instanceof entities.Magnet)) {
      this._trackMagnet(magnet);
    }
  }

  untrack(entity) {
    if (entity instanceof entities.Magnet) {
      this._untrackMagnet(entity);
    }
  }

  track(entity) {
    if (entity instanceof entities.Magnet) {
      this._trackMagnet(entity);
    }
  }

  onEntityTick(entity) {
    const stuck = this._theMagneticFields(entity);
    if (!(entity instanceof entities.Player)) {
      entity.state.stuck = stuck;
    }
  }

  // On a Ferris wheel, looking out on Coney Island...
  _theMagneticFields(entity) {
    const magnetismOnEntity = at(this._magnetization, entity.coords);

    if (magnetismOnEntity === 0) {
      return false;
    }

    directions.forEach((direction, i) => {
      const possibleTarget = at(this.board._board, entity.coords, direction, 2);

      if (
        entity instanceof entities.Magnet &&
        aligned(entity.orientation, direction) &&
        (possibleTarget && possibleTarget.electroMagnet) &&
        this.board.at(entity.coords, direction) === null
      ) {
        this.board._move(entity, direction);
      } else if (
        possibleTarget instanceof entities.Magnet &&
        aligned(possibleTarget.orientation, direction) &&
        !entity.electroMagnet &&
        !possibleTarget.nonFerrous &&
        this.board.at(entity.coords, direction) === null
      ) {
        const entityIsMagnet = entity instanceof entities.Magnet;
        if (
          !entityIsMagnet ||
          (entityIsMagnet && entity.orientation !== possibleTarget.orientation)
        ) {
          this.board._move(entity, direction);
        }
      }
    });
    return at(this._magnetization, entity.coords) >= 32;
  }

  _alterMagnetTracking(magnet, plusMinus) {
    const { coords } = magnet;
    setAt(this._magnetization, coords, at(this._magnetization, coords) + 1 * plusMinus);
    directionsByOrientation[magnet.orientation].forEach(direction => {
      setAt(
        this._magnetization,
        coords,
        at(this._magnetization, coords, direction, 1) + 32 * plusMinus,
        direction,
        1,
      );
      setAt(
        this._magnetization,
        coords,
        at(this._magnetization, coords, direction, 2) + 1 * plusMinus,
        direction,
        2,
      );
    });
  }

  _trackMagnet(magnet) {
    this._alterMagnetTracking(magnet, 1);
  }

  _untrackMagnet(magnet) {
    this._alterMagnetTracking(magnet, -1);
  }
}
