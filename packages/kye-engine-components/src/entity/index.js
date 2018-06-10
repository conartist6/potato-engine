import React, { Component } from 'react';
import cx from 'classnames'; // :'
import dasherize from 'dasherize';
import { Set } from 'immutable';
import e from 'kye-engine/lib/entities';

import './entity.css';

export default class Entity extends Component {
  constructor() {
    super();
    this._count = 0;
    this.twinkling = false;
  }

  shouldComponentUpdate(nextProps) {
    this._count++;
    if (nextProps.entity.twinkles && Math.random() < this._count / 800) {
      this._count = 0;
      this.twinkling = !this.twinkling;
      return true;
    }

    return (
      this.props.entity !== nextProps.entity ||
      this.props.attribute !== nextProps.attribute ||
      this.props.x !== nextProps.x ||
      this.props.y !== nextProps.y
    );
  }

  render() {
    const { entity, x, y } = this.props;
    const attribute = entity.attribute && `a_${dasherize(entity.attribute)}`;
    const name = dasherize(entity.constructor.__name);

    const classNames = { entity: true, [name]: true, [attribute]: !!attribute };

    if (this.twinkling) {
      classNames.twinkle = this.twinkling;
    }

    return (
      <div
        className="cell"
        data-x={x}
        data-y={y}
        // This sucks but using a single iterator has constraints and advantages.
        // Ideally css calc could be used with css attr, and this would be unneccesary.
        style={{ top: `${y * 20}px`, left: `${x * 20}px` }}
      >
        <div className={cx(classNames)}>{entity.content}</div>
      </div>
    );
  }
}
