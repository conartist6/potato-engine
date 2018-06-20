import React, { PureComponent } from 'react';
import Entity from '../entity';
import { entities } from 'potato-engine';

import './style.css';

export default class Game extends PureComponent {
  constructor(props) {
    super(props);
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
    this.setupGame(this.props.game);
  }

  componentWillUnmount() {
    this.teardownGame(this.props.game);
  }

  componentDidUpdate(oldProps) {
    if (oldProps.game !== this.props.game) {
      this.teardownGame(oldProps.game);
      this.setupGame(this.props.game);
    }
  }

  setupGame(game) {
    game.start();
    game.on('tick', () => this.forceUpdate());
  }

  teardownGame(game) {
    game.end();
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
