import React, { PureComponent } from 'react';
import Entity from '../entity';
import { entities } from 'potato-engine';
import c from 'keycode-js';

import './style.css';

const keysToDirections = {
  [c.KEY_UP]: 'UP',
  [c.KEY_W]: 'UP',
  [c.KEY_DOWN]: 'DOWN',
  [c.KEY_S]: 'DOWN',
  [c.KEY_LEFT]: 'LEFT',
  [c.KEY_A]: 'LEFT',
  [c.KEY_RIGHT]: 'RIGHT',
  [c.KEY_D]: 'RIGHT',
};

export default class Game extends PureComponent {
  constructor(props) {
    super(props);

    this.keydown = this.keydown.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);

    this._iterables = {
      statics: {
        [Symbol.iterator]: this.iterate.bind(this, board => board.statics()),
      },
      fields: {
        [Symbol.iterator]: this.iterate.bind(this, board => board.fields()),
      },
      entities: {
        [Symbol.iterator]: this.iterate.bind(this, board => board.entities()),
      },
    };
  }

  componentDidMount() {
    this.setupInput();
    this.setupGame();
  }

  componentWillUnmount() {
    this.teardownGame();
    this.teardownInput();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.input !== this.props.input) {
      this.teardownInput();
      this.setupInput();
    }
    if (oldProps.game !== this.props.game) {
      this.teardownGame();
      this.setupGame();
    }
  }

  keydown(event) {
    const direction = keysToDirections[event.keyCode];
    if (direction) {
      this._game.tick(direction);
    }
  }

  setupInput() {
    if (!this.props.displayOnly) {
      this._input = this.props.input;
      this._input.on('keydown', this.keydown);
      this._input.start();
    }
  }

  teardownInput() {
    if (this._input) {
      this._input.off('keydown', this.keydown);
      this._input.end();
      this._input = null;
    }
  }

  setupGame() {
    this._game = this.props.game;
    this._game.start();
    this._game.on('tick', this.forceUpdate);
  }

  teardownGame() {
    this._game.off('tick', this.forceUpdate);
    this._game.end();
    this._game = null;
  }

  *iterate(iteratorSelector) {
    const { game } = this.props;
    const { board } = game;
    const { height, width } = board.dimensions;

    const iterator = iteratorSelector(board);

    for (const entity of iterator) {
      const { state, attribute, coords } = entity;
      const [x, y] = coords;
      const key = state ? state.id : `${x}-${y}`;

      let element = entity && (
        <Entity entity={entity} x={x} y={y} attribute={attribute} key={key} />
      );
      if (this.props.entityWrapper) {
        const Wrapper = this.props.entityWrapper;
        element = entity && (
          <Wrapper entity={entity} x={x} y={y} attribute={attribute} key={key}>
            {element}
          </Wrapper>
        );
      }
      yield element;
    }
  }

  render() {
    const { game } = this.props;
    const { board } = game;
    const { height, width } = board.dimensions;

    if (!board) {
      return null;
    }

    return (
      <div className="board" style={{ height: `${height * 20}px`, width: `${width * 20}px` }}>
        <div className="layer statics">{this._iterables.statics}</div>
        <div className="layer fields">{this._iterables.fields}</div>
        <div className="layer entities">{this._iterables.entities}</div>
      </div>
    );
  }
}
