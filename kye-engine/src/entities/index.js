import EntityTypeRegistry from '../entity-type-registry';

import Field from './field';
import Interactor from './interactor';
import Player from './player';
import Thinker from './thinker';
import Magnet from './magnet';

const coreEntities = [Field, Interactor, Player, Thinker, Magnet];

/**
 * The singleton entity registry instance. Frequently just called 'entities' in code.
 * @type {EntityTypeRegistry}
 **/
export const entityTypeRegistry = new Proxy(new EntityTypeRegistry(coreEntities), {
  get(obj, prop) {
    return prop in obj ? obj[prop] : obj.entities.get(prop);
  },
});

export default entityTypeRegistry;
