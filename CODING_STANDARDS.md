# Coding standards for Mia's games

How the code in Mia's games is written. Claude writes the code; Mia reads
parts of it and turns the knobs. What the games must *do*, and how to work
with Mia, is in `CLAUDE.md`. Where the two differ, `CLAUDE.md` wins.

These are the grown-ups' standards (TypeScript and React) cut down to fit a
9-year-old's games: the same rules for types, names and functions, without the
parts that only big apps need.

## Where things live

```text
pet-me/
├── package.json, vite.config.ts, tsconfig.json   Salomé's: never changed by Claude
├── index.html              the page the game server opens. Salomé's.
├── start-games.sh, Mias-Games.desktop            the desktop shortcut. Salomé's.
├── src/
│   ├── main.tsx            starts the arcade. Salomé's.
│   ├── Arcade.tsx          a Play button for every game and every save
│   ├── game-kit/           the parts every game shares. Salomé's.
│   │   ├── useGame.ts      the clock and the redraw: the one place with React hooks
│   │   ├── useKeys.ts      which keys are held down
│   │   ├── beep.ts         short beeps
│   │   ├── bestScore.ts    the best score, saved in the browser
│   │   └── PuzzleScreen.tsx  shows a broken game's puzzle instead of a blank page
│   └── games/
│       └── catch-the-stars/
│           ├── settings.ts         her knobs, and only her knobs
│           ├── Game.ts             the whole game: holds the things, has tick()
│           ├── Star.ts             one file per game thing (a class)
│           ├── Player.ts
│           └── CatchTheStars.tsx   the screen: Play screen, game, Game Over
├── games/                  her first games, plain HTML: never changed
├── logbook.md
└── ideas.md
```

- One folder per game in `src/games/`, in small letters and dashes.
- A game folder is on its own. It imports only from `react`, from
  `../../game-kit/`, and from its own files. Never from another game.
- Class files and component files start with a capital: `Star.ts`,
  `CatchTheStars.tsx`. Other files are small letters: `settings.ts`.
- If the screen file gets long, the Play screen and Game Over may get their
  own files (`PlayScreen.tsx`, `GameOverScreen.tsx`) in the same folder.
- Every file starts with one comment: what it is, and that Mia designed the
  game. (Salomé's files say they are hers.)
- Each file stays under about 150 lines, and a game under about 400 in all.
- A save or a level 2 is a copy of the whole game folder, named
  `<name-of-game>-save-1` or `<name-of-game>-level-2`. Making one means: copy
  the folder, change its `GAME_NAME` line in `settings.ts` to the new folder
  name, add it to the arcade's `GAMES` list. A save is never changed after
  that. Copies are on purpose, so the "same code twice" rules below apply
  inside one game folder, not across games, saves or levels.

## Knobs and names

- All of a game's knobs live in its `settings.ts`, and nothing else does. Each
  knob is one line with its type and a comment saying what it does:
  `export const FALL_SPEED: number = 3; // how fast things fall`
  The type is written out, even where TypeScript could work it out, because
  reading it is a rung on her ladder.
- Every `settings.ts` has `GAME_NAME: string`, the folder name, and
  `TICK_MS: number`, how often the game moves, in thousandths of a second.
- A number, colour or emoji that means something gets a name. If Mia would
  want to turn it, it goes in `settings.ts`. No bare numbers in the game code.
- A thing she might want more of is a list, one item per line, so copying a
  line adds one: `export const FALLING_THINGS: string[] = ["⭐", "🍎"]`, written
  over several lines. The game loops over the list.
- Knob names are in capitals with underscores: `FALL_SPEED`, `PLAYER_COLOUR`.
  Classes and components start with a capital: `Star`, `CatchTheStars`.
  Methods and functions say what they do: `feed()`, `catchTheStar()`,
  `loseALife()`, never `upd()` or `doStuff()`.
- Whole words everywhere. A single letter only as a loop counter.
- `const` unless the value really changes.

## Types

- Every class field, parameter and return value has a type. No `any`.
- A small set of choices is a type of its own:
  `type Weather = "sunny" | "rainy" | "snowy"`. No `enum`.
- A type is imported with `import type { Weather } from "./weather"`, so the
  game server can drop it cleanly.
- Fields are declared on their own lines, each with its type. No
  `constructor(public name: string)`.
- A function's type is written as `VoidFunction` or `{ (): number }`, not
  with `=>`.
- **A type error never stops the game.** The game server doesn't check types:
  it removes them and runs the game. VS Code checks them and shows each one as
  a red squiggle while the game keeps running. Salomé can run
  `npm run typecheck` to see them all. Claude can't run it, so it reads its
  own code carefully instead.
- Code that is broken outright, like a missing bracket or a colour without
  quotes, is different: that shows big red words on the page. Fix those first.

## Game rules and screens

- Game rules live in plain TypeScript classes, one game thing per file. A class
  keeps its own numbers and changes only its own numbers. Each method does one
  thing: `feed()` feeds.
- Each game has a `Game` class that holds its things, its score and lives, and
  has one `tick()`: what happens every `TICK_MS`. It is the one class that
  calls the other classes' methods. The screen talks only to `Game`.
- A constructor only sets numbers. No timers, sounds or saving in it: React
  may make a game twice while checking things.
- The `.tsx` screen shows the game and passes button presses to `Game`. It
  holds no game rules and no hooks of its own: the React parts come from
  `game-kit`, used the same way in every game:

  ```tsx
  // CatchTheStars.tsx – the screen for Catch the Stars. Mia designed this game.
  import type { ReactNode } from "react";
  import { useGame } from "../../game-kit/useGame";
  import { Game } from "./Game";
  import { TICK_MS } from "./settings";

  // this makes a brand new game
  function makeGame(): Game {
    return new Game();
  }

  // this shows the game on the screen
  function CatchTheStars(): ReactNode {
    const { game, drawAgain, restart } = useGame(makeGame, TICK_MS);

    // this happens when you press Play
    function pressPlay(): void {
      game.start();
      drawAgain();
    }

    if (!game.started) {
      return <div><h1>Catch the Stars</h1><button onClick={pressPlay}>▶ Play</button></div>;
    }
    if (game.isOver) {
      return <div><h1>Game Over</h1><p>⭐ {game.score}</p><button onClick={restart}>Play Again</button></div>;
    }
    return <div>⭐ {game.score}</div>;
  }

  export default CatchTheStars;
  ```

- `useGame` makes the game once, calls `game.tick()` every `TICK_MS` and
  redraws after each tick. After a button press, the handler calls
  `drawAgain()` so the change shows straight away. Play Again calls
  `restart()`, which makes a brand new game.
- Arrow keys: the screen gets `const keys = useKeys();` and hands it to the
  game, `new Game(keys)`. In `tick()` the game asks `this.keys.isDown("ArrowLeft")`.
- Sounds and the best score come from `game-kit` too: `beep(440, 0.1)`,
  `loadBestScore(GAME_NAME)`, `saveBestScore(GAME_NAME, score)`. They may be
  called from a class as well as from the screen.
- Every screen file ends with `export default`, so the arcade can load it on
  its own. A broken game then only breaks itself.
- Words and emoji Mia might change sit plainly in the screen's markup, where
  she can find them: `<h1>Catch the Stars</h1>`, not built up in code.
- Props and state come into her games later, one rung at a time, as
  `CLAUDE.md` says. Until then, keep them out of the game folders.

## Functions

- **No arrow functions**, anywhere. A function always has a name. Inline is
  fine as long as it is named:
  `stars.map(function drawOneStar(star) { … })`.
- Inside a class, loop with `for (const star of this.stars) { … }`, not with
  a callback: a callback loses `this`.
- Never pass a method by itself: not `onClick={pet.feed}`, not
  `setInterval(game.tick, …)`. Wrap it in a named function that calls it.
- If the same few lines turn up twice in one game, they become one named
  function, like `drawBar(name, value)`.
- Check first, and stop early: `if (!this.visiting) return;` at the top,
  rather than wrapping the whole method in an `if`.
- Keep `) {` on the same line; no brace on a line of its own.
- A blank line above every function and method, and above its comment.

## Comments

- One comment per thing, in words Mia uses: `// this makes the stars fall`.
  It says what the code does in the game, not how TypeScript works.
- Never a comment that just repeats the line under it.

## What the game may use

- TypeScript, React, the browser, a canvas, emoji, and `game-kit`. Nothing
  else unless Salomé adds it to `package.json`. No fonts, pictures or sounds
  from the internet.
- No real names except first names of people and pets, and no personal
  details, anywhere in the code or the comments.

## Tidying a game

- Tidy in steps Mia can play: one change at a time, and the game plays the
  same after each one. A tidy that changes how the game plays isn't a tidy.
- Never rewrite a whole game in one go.
- Tidy what's in the way when you come to build the next thing. Don't go
  looking for things to rewrite.

## Before you call it done

- Is every knob in `settings.ts`, with its type and a comment, and nothing
  else in there?
- Does every field, parameter and return value have a type, and no `any`?
  Are types imported with `import type`?
- Any arrow functions, a callback inside a class, or a method passed bare?
- Any game rules or hooks in the `.tsx` screen?
- Does every handler that changes the game call `drawAgain()`?
- Is there one comment per thing, in her words?
- Is each file under about 150 lines, and the game under about 400?
- Ask Mia: does the game load, with no red words?

## What doesn't apply here

The grown-ups' standards also cover Nx, tests with made-up data, layers for
apps with a back end, pull requests and code owners. Mia's games don't need
them: there's no back end, her tests are playing the game and watching someone
else play it, and her Claude can't run commands.

Order of preference, always: **clear → correct → reused → clever**.
