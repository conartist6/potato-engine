import React, { PureComponent } from 'react';
import Entity from '../entity';
import entities from 'potato-engine/lib/entities';

import './board.css';

export default class Board extends PureComponent {
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
    this.setupBoard(this.props.board);
  }
  componentWillUnmount() {
    this.teardownBoard(this.props.board);
  }
  componentDidUpdate(oldProps) {
    if (oldProps.board !== this.props.board) {
      this.teardownBoard(oldProps.board);
      this.setupBoard(this.props.board);
    }
  }
  setupBoard(board) {
    board.start('tick', () => this.forceUpdate());
  }
  teardownBoard(board) {
    board.end();
  }

  *iterate(iteratorSelector) {
    const { board } = this.props;
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
    const { board } = this.props;
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
