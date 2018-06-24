## Potato Engine Components

This is the default rendering layer for the potato engine. It uses React to render the game board and any entities and fields on it.

It has three layers, rendered on top of each other using absoulte positioning. The rearmost is the static layer, for walls and such. Making it its own layer removes work for things that will never need to change anyway. The middle layer is for fields. Fields are effects that show up on the ground but that may still be walked on. The foremost layer is entities, which should never appear on top of each other, and can move around the playing area.

### Attributes

This particular rendering layer uses two main pieces of data to choose what to render for an entity: the name of the entity (`__name`, as set on the class), and a single attribute, which the entity's attribute getter returns. These are applied as CSS classes. The attribute is prefixed with `a_`. For example, an entity named SentryShooter with a directional attribute might look like `<div class="entity sentry-shooter a_left" />"`.

Attributes are key to the functioning of this rendering layer because they allow React to know when entity data has changed, thus when it needs to rerender entities.
