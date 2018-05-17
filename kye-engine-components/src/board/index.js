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
    let i = 0;
    for (const { x, y, entity, field } of board) {
      let element = entity && <Entity entity={entity} />;
      if (this.props.entityWrapper) {
        const Wrapper = this.props.entityWrapper;
        element = entity && <Wrapper>{element}</Wrapper>;
      }
      yield (
        <div
          className="cell"
          key={i}
          data-x={x}
          data-y={y}
          // This sucks but using a single iterator has constraints and advantages.
          // Ideally css calc could be used with css attr, and this would be unneccesary.
          style={{ position: 'absolute', top: `${y * 20}px`, left: `${x * 20}px` }}
        >
          {element}
        </div>
      );
      i++;
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
