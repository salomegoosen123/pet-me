// Salomé's. The clock and the redraw: the one place with React hooks.
// Every game uses it the same way:
//   const { game, drawAgain, restart } = useGame(makeGame, TICK_MS);
// Claude never changes this file.
import { useEffect, useState } from "react";

// a game is anything with a tick(): what happens every TICK_MS
export interface Ticking {
  tick(): void;
}

// a function that makes a brand new game
export interface GameMaker<G extends Ticking> {
  (): G;
}

// what a screen gets back
export interface RunningGame<G extends Ticking> {
  game: G;
  drawAgain: VoidFunction; // call after a button press, so the screen shows it straight away
  restart: VoidFunction; // makes a brand new game, for Play Again
}

// this adds one to a number
function addOne(count: number): number {
  return count + 1;
}

// this runs one game: makes it once, ticks it, and redraws the screen
export function useGame<G extends Ticking>(makeGame: GameMaker<G>, tickMs: number): RunningGame<G> {
  const [game, setGame] = useState<G>(makeGame);
  const [, setDrawCount] = useState<number>(0);

  // this tells React to draw the screen again
  function drawAgain(): void {
    setDrawCount(addOne);
  }

  // this throws the old game away and makes a new one
  function restart(): void {
    setGame(makeGame());
  }

  useEffect(function startTheClock(): VoidFunction {
    const clockId = window.setInterval(function tickAndDraw(): void {
      game.tick();
      setDrawCount(addOne);
    }, tickMs);

    // this stops the clock when the game closes, so it never runs twice
    return function stopTheClock(): void {
      window.clearInterval(clockId);
    };
  }, [game, tickMs]);

  return { game, drawAgain, restart };
}
