// PopcornLand.tsx – the screen for Popcorn Land. Mia designed this game.
import type { CSSProperties, ReactNode } from "react";
import { useGame } from "../../game-kit/useGame";
import { useKeys } from "../../game-kit/useKeys";
import type { Balloon } from "./Balloon";
import type { Cloud } from "./Cloud";
import { Game } from "./Game";
import { BALLOON, BALLOON_SIZE, CLOUD_COLOUR, SKY_COLOUR, TICK_MS, WIN_AT, YOU, YOU_SIZE } from "./settings";
import { WORLD_HEIGHT, WORLD_WIDTH } from "./world";

const CLOUD_THICKNESS: number = 24; // how thick the clouds look
const SCREEN_STYLE: CSSProperties = { textAlign: "center", padding: 24 };
const SKY_STYLE: CSSProperties = {
  position: "relative", width: "100%", maxWidth: WORLD_WIDTH, aspectRatio: `${WORLD_WIDTH} / ${WORLD_HEIGHT}`,
  margin: "0 auto", borderRadius: 24, overflow: "hidden", background: SKY_COLOUR,
  containerType: "size",
};

// this turns a number of pixels, from the game's own sky (640 wide), into a size that shrinks and grows with
// the screen: so Popcorn Land fits a phone too, not just a computer
function toCqw(worldPixels: number): string {
  return `${(worldPixels / WORLD_WIDTH) * 100}cqw`;
}

// this shows Popcorn Land on the screen
function PopcornLand(): ReactNode {
  const keys = useKeys();

  // this makes a brand new game, which can feel the arrow keys and space
  function makeGame(): Game {
    return new Game(keys);
  }

  const { game, drawAgain, restart } = useGame(makeGame, TICK_MS);

  // this happens when you press Play
  function pressPlay(): void {
    game.start();
    drawAgain();
  }

  // this says how high up the screen something is, now that the screen has climbed up the sky
  function onScreen(height: number): number {
    return height - game.bottomOfTheScreen;
  }

  // this shows one cloud, a soft white puff with its top where you stand
  function showCloud(cloud: Cloud, which: number): ReactNode {
    const style: CSSProperties = {
      position: "absolute", left: toCqw(cloud.across), width: toCqw(cloud.width),
      bottom: toCqw(onScreen(cloud.top) - CLOUD_THICKNESS), height: toCqw(CLOUD_THICKNESS),
      borderRadius: toCqw(CLOUD_THICKNESS), background: CLOUD_COLOUR,
    };
    return <div key={which} style={style}></div>;
  }

  // this shows one balloon, floating up
  function showBalloon(balloon: Balloon, which: number): ReactNode {
    const style: CSSProperties = {
      position: "absolute", fontSize: toCqw(BALLOON_SIZE), left: toCqw(balloon.across), bottom: toCqw(onScreen(balloon.height)),
    };
    return <span key={which} style={style}>{BALLOON}</span>;
  }

  if (!game.started) {
    return (
      <div style={SCREEN_STYLE}>
        <h1>🍿 Popcorn Land 🍿</h1>
        <button onClick={pressPlay}>▶ Play</button>
      </div>
    );
  }

  if (game.won) {
    return (
      <div style={SCREEN_STYLE}>
        <h1>🎉 You win! 🎉</h1>
        <p>You popped {game.popped} balloons! 🎈</p>
        <p>{game.newBest ? "⭐ New best! ⭐" : "🏆 Best ever: " + game.best}</p>
        <button onClick={restart}>Play Again</button>
      </div>
    );
  }

  if (game.isOver) {
    return (
      <div style={SCREEN_STYLE}>
        <h1>Game Over</h1>
        <p>You fell off the clouds! ☁️ You popped {game.popped} balloons. 🎈</p>
        <p>{game.newBest ? "⭐ New best! ⭐" : "🏆 Best ever: " + game.best}</p>
        <button onClick={restart}>Play Again</button>
      </div>
    );
  }

  const youStyle: CSSProperties = {
    position: "absolute", fontSize: toCqw(YOU_SIZE), left: toCqw(game.player.across),
    bottom: toCqw(onScreen(game.player.height)), transform: game.player.facingLeft ? "scaleX(-1)" : "none",
  };
  return (
    <div style={SCREEN_STYLE}>
      <h1>🍿 Popcorn Land 🍿</h1>
      <p>🎈 {game.popped} / {WIN_AT} &nbsp; {"❤️".repeat(game.lives)}</p>
      <div style={SKY_STYLE}>
        {game.balloons.map(showBalloon)}
        {game.clouds.map(showCloud)}
        <span style={youStyle}>{YOU}</span>
      </div>
      <p>⬅️➡️ Walk with the arrow keys. Press space to jump up, up, up!</p>
    </div>
  );
}

export default PopcornLand;
