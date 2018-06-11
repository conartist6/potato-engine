## Potato Engine Components

This is the default rendering layer for the potato engine. It uses react to render the game board, and any entities on it.

It has three layers, rendered on top of each other using absoulte positioning. The rearmost is the static layer, for walls and such. Making it its own layer removes work for things that never need to change anyway. The middle layer is for fields. Fields are effects that show up on the ground but that may still be walked on. The foremost layer is entities, which should
never appear on top of each other, and can move around the playing area.
