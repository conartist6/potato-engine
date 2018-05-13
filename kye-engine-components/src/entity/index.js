import React, { Component } from 'react';
import cx from 'classnames'; // :'
import dasherize from 'dasherize';
import { Set } from 'immutable';
import e from 'kye-engine/entities';

import './entity.css';

const styledEntities = Set([
  e.Player,
  e.Block,
  e.Rocky,
  e.Sentry,
  e.Slider,
  e.Wall,
  e.Edible,
  e.Diamond,
  e.Magnet,
]);

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
    return this.props.entity !== nextProps.entity;
  }

  render() {
    const { entity } = this.props;
    const attribute = entity.attribute && `a_${dasherize(entity.attribute)}`;
    const name = dasherize(entity.constructor.__name);

    const classNames = { entity: true, [name]: true, [attribute]: !!attribute };

    if (this.twinkling) {
      classNames.twinkle = this.twinkling;
    }

    return (
      <div className={cx(classNames)}>
        {styledEntities.has(entity.constructor) ? null : entity.symbol}
      </div>
    );
  }
}
