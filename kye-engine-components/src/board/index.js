import React, { PureComponent } from 'react';
import Entity from '../entity';

import './board.css';

export default class Board extends PureComponent {
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

  *[Symbol.iterator]() {
    const { board } = this.props;
    const { height, width } = board.dimensions;

    for (const { x, y, entity, field } of board) {
      const key = entity && entity.state.key;
      let element = entity && <Entity entity={entity} x={x} y={y} key={key} />;
      if (this.props.entityWrapper) {
        const Wrapper = this.props.entityWrapper;
        element = entity && (
          <Wrapper entity={entity} x={x} y={y} key={key}>
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
        {this}
      </div>
    );
  }
}
