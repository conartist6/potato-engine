## Potato Engine

This project is an engine for 2D games, particularly for simple box-pushing kinds. Its primary goal is to facilitate educational game creation and whimsical game prototyping.

The intention is for there to be an extremely easy workflow to take a playable game that runs in a _modern_ web browser, fork a copy for yourself, and start tweaking the game's rules right away. It should continue to be simple to take more and more control over from the engine if you know what you are doing.

The Potato Engine is not an engine on which any game can be built, and that is not the intention. Most importantly in the Potato Engine every game piece must reside in one and only one game square. You don't get to animate between squares. There are no physics. You can't write Pac Man, Mario, or Space Invaders on the Potato Engine. You should, however, be able to write something like the original version of Chip's Challenge quite easily.

### Installing

You can install the engine with yarn or npm, but do you want to?? It is far easier to fork a project which already has the engine and its rendering layer installed and wired up.

If you just want to get started quickly, please go take a look at [Kye](https://github.com/conartist6/kye), which is the reference game implementation on the engine. By following that repository's [setup instructions](https://github.com/conartist6/kye#initial-setup) you will end up with a working game whose source code you can start tweaking. You will see the results right away!

If you want to install the engine in your own project, simply run `yarn add potato-engine` or `npm install --save potato-engine`.

### The mechanics

What the game engine supports out of the box is relatively simple:

-   **Levels.** You can define maps which can be played multiple times. Campaigns consist of multiple sequential levels. Interchangable parsers can load levels defined in text files.
-   **Walls.** Nothing can move or be moved into a wall.
-   **Fields.** These are areas of the floor which can be moved onto and which may have an effect on anything which does so. Fields make great traps, or portals!
-   **Entities.** The boxes of box pushing. Could look like anything. They sit on the floor. By default they are open to being pushed around. Entities can only be pushed into spaces of floor not occupied by other entities.
-   **Thinkers.** These are entities that can take actions (e.g. moving, pushing, eating, spawning other entities) for themselves. They make great monsters!
-   **Interactions.** In most cases, entities can react if something has acted on them. For example a key entity might react to being eaten by adding a hasKey flag to the consumer's state.
-   **Eating.** A thinker or player may attempt to eat an entity when it encounters it.
-   **State.** Entities can carry around some data about themselves. Why not make an adventue game? Perhaps Dwarf Fortress?

Also:

-   **Board wrapping.** You may configure the game such that it is possible to walk off one edge and onto the opposite.
-   **Replays.** You can record a sequence of moves and play it back!
-   **Isomporphism.** The game engine can be run in a browser or in node.js. Combined with replays, this allows the artful coder to validate that a sequence of moves happening in a web browser is a legitimate win.
-   **Performance!** The engine is fast.

### What it _could_ do

It should already be possible to simply make a very large level -- more of a stage -- and let the player wander around it.

It should be relatively simple to script board portals for an adventure game, such that walking off the edge of one screen moves you onto another.

It should be simple to code an inventory, hit points, attributes, or extra lives into the engine.

I would be open to features which move the engine in the direction of supporting a more minecraft-ish style of creating level chunks which are loaded or unloaded in a radius around the player allowing free, player-centered movement in an open world. Someone could even write a random map generator!

### The technology

The Potato Engine is written in es6+ javascript, and transpiled to es6. Most javascript is transpiled into es5 (i.e. turned into far uglier javascript) or written without use of modern features -- in service of old versions of Internet Explorer. When reading code that has been transpiled this heavily, it can be hard to see both what is actually being run and what it was that you wrote (since they are different!). By transpiling less heavily the Potato Engine requires an up to date browser to run, but is far easier to use and understand during development.

In order to run the Potato Engine, a browser must support es6. In particular the engine uses Iterators (which IE11 doesn't have) and Generator functions. Other features such as Classes are also required but widely supported. If needed, the engine can be transpiled more heavily. In fact, it is possible to use create-react-app to do so using the stragegy employed in [potato-engine-kye-develop](https://github.com/conartist6/potato-engine-kye-develop).

In order to be performant the core game loop avoids doing memory allocation as much as possible.

The Potato Engine is intended to support plugins! For kye, I created a magnet plugin and a deflection plugin which help implement those game rules which many other games will not need or want. The engine does not yet have a full plugin API, but I will be developing that API as I start seeing what people need in order to make more complicated games/functionality.

The core engine is agnostic as to how the game is rendered, but comes with [a default renderer](https://github.com/conartist6/potato-engine/tree/master/packages/potato-engine-components) - a thin layer written in React. There are advantages to using React as the rendering layer, since HTML elements are themselves easy to inspect, style, and script, and there are plethoras of tutorials on dealing with both HTML and React.

The engine itself is meant to be a bit of a model codebase, as easy as possible to read. I treat code patterning issues as bugs.

### Documentation!

The Potato Engine is (will be soon) well documented, having a full documentation site. The engine also makes it very easy to spin up small instances of your game to use as live examples or in tests.
