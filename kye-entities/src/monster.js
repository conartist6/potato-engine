import Interactor from 'kye-engine/lib/entities/interactor';

import { randomDirection } from 'kye-engine/lib/directions';

const monsterTypes = {
  GNASHER: 'E',
  TWISTER: 'T',
  SPIKE: '[',
  SNAKE: '~',
  BLOB: 'C',
};

export default class Monster extends Interactor {
  constructor(type) {
    super();
    this.type = type;
    this.frequency = 3;
    this.opportunistic = true;
  }

  think(board, coords) {
    if (Math.random() > 0.5) {
      board.seek(coords);
    } else {
      board.move(coords, randomDirection());
    }
  }

  eatPlayers(board, coords, direction, entities) {
    const targetEntity = board.at(coords, direction);
    if (targetEntity instanceof entities.Player) {
      board.eat(coords, direction);
    }
  }

  interact() {
    this.eatPlayers(...arguments);
  }

  react() {
    this.eatPlayers(...arguments);
  }

  get symbol() {
    return monsterTypes[this.type];
  }

  static validParams() {
    return Object.keys(monsterTypes);
  }
}
Monster.__name = 'Monster'; // uglify killin' me
