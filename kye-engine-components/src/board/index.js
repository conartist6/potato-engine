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
    board.on('tick', (this._listener = () => this.forceUpdate()));
    board.start();
  }
  teardownBoard(board) {
    board.end();
    board.off('tick', this._listener);
    this._listener = null;
  }
  render() {
    const { board } = this.props;
    if (!board) {
      return null;
    }

    const rows = Array.from(board, (row, rIdx) => {
      const entities = Array.from(row, (entity, cIdx) => {
        let element = entity && <Entity entity={entity} />;
        if (this.props.entityWrapper) {
          const Wrapper = this.props.entityWrapper;
          element = entity && <Wrapper>{element}</Wrapper>;
        }
        return (
          <td key={cIdx} data-x={cIdx} data-y={rIdx}>
            {element}
          </td>
        );
      });
      return <tr key={rIdx}>{entities}</tr>;
    });
    return (
      <table className="board">
        <tbody>{rows}</tbody>
      </table>
    );
  }
}
