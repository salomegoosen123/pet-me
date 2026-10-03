// CandyLand.tsx – the screen for Candy Land. Mia designed this game.
import type { CSSProperties, ReactNode } from "react";
import { useGame } from "../../game-kit/useGame";
import { useKeys } from "../../game-kit/useKeys";
import { Game } from "./Game";
import type { Rock } from "./Rock";
import { FAMILY, FAMILY_SIZE, GROUND_COLOUR, ROCK, ROCK_SIZE, SKY_COLOUR, TICK_MS } from "./settings";
import { GROUND_HEIGHT, placeInLine, WORLD_HEIGHT, WORLD_WIDTH } from "./world";

const SCREEN_STYLE: CSSProperties = { textAlign: "center", padding: 24 };
const WORLD_STYLE: CSSProperties = {
  position: "relative", width: "100%", maxWidth: WORLD_WIDTH, aspectRatio: `${WORLD_WIDTH} / ${WORLD_HEIGHT}`,
  margin: "0 auto", borderRadius: 24, overflow: "hidden", background: SKY_COLOUR,
  containerType: "size",
};
const GROUND_STYLE: CSSProperties = {
  position: "absolute", left: 0, right: 0, bottom: 0, height: toCqw(GROUND_HEIGHT), background: GROUND_COLOUR,
};

// this turns a number of pixels, from the game's own world (640 wide), into a size that shrinks and grows
// with the screen: so Candy Land fits a phone too, not just a computer
function toCqw(worldPixels: number): string {
  return `${(worldPixels / WORLD_WIDTH) * 100}cqw`;
}

// this shows Candy Land on the screen
function CandyLand(): ReactNode {
  const keys = useKeys();

  // this makes a brand new game, which can feel the space bar
  function makeGame(): Game {
    return new Game(keys);
  }

  const { game, drawAgain, restart } = useGame(makeGame, TICK_MS);

  // this happens when you press Play
  function pressPlay(): void {
    game.start();
    drawAgain();
  }

  // this shows one of your family, in their place in the line, bobbing or jumping
  function showRunner(face: string, which: number): ReactNode {
    const style: CSSProperties = {
      position: "absolute", fontSize: toCqw(FAMILY_SIZE), left: toCqw(placeInLine(which)),
      bottom: toCqw(GROUND_HEIGHT + game.family.height + game.family.bob(which)),
    };
    return <span key={which} style={style}>{face}</span>;
  }

  // this shows one rock, rolling along the ground
  function showRock(rock: Rock, which: number): ReactNode {
    const style: CSSProperties = {
      position: "absolute", fontSize: toCqw(ROCK_SIZE), left: toCqw(rock.across), bottom: toCqw(GROUND_HEIGHT),
      transform: `rotate(${rock.turn}deg)`,
    };
    return <span key={which} style={style}>{ROCK}</span>;
  }

  if (!game.started) {
    return (
      <div style={SCREEN_STYLE}>
        <h1>🍭 Candy Land 🍭</h1>
        <button onClick={pressPlay}>▶ Play</button>
      </div>
    );
  }

  if (game.isOver) {
    return (
      <div style={SCREEN_STYLE}>
        <h1>Game Over</h1>
        <p>A rock got you! 🪨</p>
        <button onClick={restart}>Play Again</button>
      </div>
    );
  }

  return (
    <div style={SCREEN_STYLE}>
      <h1>🍭 Candy Land 🍭</h1>
      <div style={WORLD_STYLE}>
        <div style={GROUND_STYLE}></div>
        {game.rocks.map(showRock)}
        {FAMILY.map(showRunner)}
      </div>
      <p>Press space to jump!</p>
    </div>
  );
}

export default CandyLand;
