## Kye Parser ASCII

The purpose of this package is to facilitate the deserialization of .kye files into potato-engine Campagin and Level instances.

### The file format

A .kye (or .KYE) file is mostly a series of lines. The lines may be separated with any platform's line separators. There should be no blank lines, and no spaces at the beginnings or ends of lines. If a byte order mark is present, it will be ignored.

The first line of a .kye file is the number of levels in the campagin. This is the only metadata about the campaign aside from the file name, which should be considered the campaign's name.

Levels follow. A level has a 3 line header, followed by a board. The header consists of these lines:

1.  The level code, case insensitive but traditionally specified in uppercase
2.  A short hint, which will be displayed alongside the game board during play
3.  A completion message, to be shown when the level is beaten

The board, which is a series of lines. The board must, at minimum:

-   Have every line the same length
-   Be surrounded by walls
-   Include at least one player
-   Include at least one diamond

Thus, the simplest board would be:

```
555
5K5
5*5
555
```

Note that walls are specified with `5`, the diamond is a `*` and the player is a `K`. These are the symbols which are used in original kye level files to describe those entities, however kye-parser-ascii itself does not perscribe any particular mapping of characters to entities. Instead entities themselves choose which symbols should represent them in an ascii file.
