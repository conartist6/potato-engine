import Thinker from 'kye-engine/lib/entities/thinker';
import { Map } from 'immutable';

import { rightOf, getCoordsInDirection } from 'kye-engine/lib/directions';

export default class Shooter extends Thinker {
  constructor(coords, attribute, ...args) {
    super(coords, 'UP', ...args);
    this._timer = 0;
  }

  get frequency() {
    return 7;
  }

  get content() {
    return 'F';
  }

  get direction() {
    return this.__attribute;
  }

  get projectileClass() {
    return this.entities.Slider;
  }

  makeProjectile() {
    const Projectile = this.projectileClass;
    return new Projectile(getCoordsInDirection(this.coords, this.direction), this.direction);
  }

  think(board) {
    this.__attribute = rightOf(this.__attribute);
    this._timer++;

    const { Slider } = this.entities;
    const [x, y] = this.coords;
    const target = board.at(this.coords, this.direction);

    if (this._timer > y && target == null) {
      board.create(this.makeProjectile());
      this._timer = 0;
    }
  }
}
Shooter.attributesBySymbol = Map({ A: 'UP' });
Shooter.__name = 'Shooter'; // uglify killin' me
