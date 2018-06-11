import BlackHole from './black-hole';
import Block from './block';
import Diamond from './diamond';
import Edible from './edible';
import Magnet from './magnet';
import Monster from './monster';
import OneWay from './one-way';
import Player from './player';
import Rocky from './rocky';
import RockyShooter from './rocky-shooter';
import Sentry from './sentry';
import Shooter from './shooter';
import Slider from './slider';
import Timer from './timer';
import Turner from './turner';
import Wall from './wall';
import WhiteHole from './white-hole';

import { entityTypeRegistry } from 'potato-engine';

[
  BlackHole,
  Block,
  Diamond,
  Edible,
  Magnet,
  Monster,
  OneWay,
  Player,
  Rocky,
  RockyShooter,
  Sentry,
  Shooter,
  Slider,
  Timer,
  Turner,
  Wall,
  WhiteHole,
].forEach(EntityType => entityTypeRegistry.register(EntityType));

export default entityTypeRegistry;
