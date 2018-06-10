# Kye Entities

You needn't worry about this unless you are building a game using the `kye-engine` package.

In the kye engine, particular types of playing pieces have particular names, visual representations, and behaviors. In the engine a piece type is called an entity. This package contains the entities which were present in the original video game, Kye 2.0. If you wish to create either a clone of the original game, or a game which expands on the original solely by adding new entities, you will want to use this package!

NOTE: Not all entities are implemented yet.

## Usage

This package registers its entity types with `kye-engine` as a side effect, but also re-exports the engine's singleton entity registry. Therefore you may use it either by requiring it only for its side effects, or by using it as the registry itself.

The build outputs es modules as well as commonJS ones, so if you wish to build a game which contains some but not all of the original entities you may require and register the files individually and let tree shaking do the rest.

If you wish to build an open source game with your own entity types that runs on the kye engine, you are encouraged to copy the structure of this package to make the rules of the game open source and reusable, even if your presentation layer is not.
