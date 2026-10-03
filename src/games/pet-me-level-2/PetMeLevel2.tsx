// PetMeLevel2.tsx – the screen for Pet Me level 2. Mia designed this game.
import type { CSSProperties, ReactNode } from "react";
import { useGame } from "../../game-kit/useGame";
import { Game } from "./Game";
import { showBar, showWhereSheIs } from "./pictures";
import { GROWN_UP, HAPPY_START, HUNGER_START, SLEEP_START, TICK_MS, WATER_START } from "./settings";

const SCREEN_STYLE: CSSProperties = { textAlign: "center", padding: 24 };

// this makes a brand new game
function makeGame(): Game {
  return new Game();
}

// this shows Pet Me level 2 on the screen
function PetMeLevel2(): ReactNode {
  const { game, drawAgain } = useGame(makeGame, TICK_MS);

  // this happens when you press Play
  function pressPlay(): void {
    game.start();
    drawAgain();
  }

  // this happens when you press Feed
  function pressFeed(): void {
    game.feed();
    drawAgain();
  }

  // this happens when you press Water
  function pressWater(): void {
    game.giveWater();
    drawAgain();
  }

  // this happens when you press Sleep
  function pressSleep(): void {
    game.putToBed();
    drawAgain();
  }

  // this happens when you press Pet
  function pressPet(): void {
    game.petHer();
    drawAgain();
  }

  // this happens when you press Park
  function pressPark(): void {
    game.goToPark();
    drawAgain();
  }

  // this happens when you press Pool
  function pressPool(): void {
    game.goToPool();
    drawAgain();
  }

  // this happens when you press Home
  function pressHome(): void {
    game.goHome();
    drawAgain();
  }

  // this happens when you press Throw
  function pressThrow(): void {
    game.throwToy();
    drawAgain();
  }

  if (!game.started) {
    return (
      <div style={SCREEN_STYLE}>
        <h1>Pet Me · Level 2</h1>
        <button onClick={pressPlay}>▶ Play</button>
      </div>
    );
  }

  return (
    <div style={SCREEN_STYLE}>
      <h1>{game.pet.name}</h1>
      {showWhereSheIs(game)}
      {showBar("🌱 Growing up", game.pet.growth, GROWN_UP)}
      {showBar("💖 Happiness", game.pet.happiness, HAPPY_START)}
      {showBar("🦴 Hunger", game.pet.hunger, HUNGER_START)}
      {showBar("💧 Water", game.pet.water, WATER_START)}
      {showBar("💤 Sleep", game.pet.rest, SLEEP_START)}
      <p>
        <button onClick={pressFeed}>🦴 Feed</button>
        <button onClick={pressWater}>💧 Water</button>
        <button onClick={pressSleep}>💤 Sleep</button>
        <button onClick={pressPet}>🖐️ Pet</button>
      </p>
      <p>
        {game.place === "park" ? <button onClick={pressThrow}>{game.nextToy()} Throw</button> : null}
        {game.place === "home"
          ? <><button onClick={pressPark}>🌳 Park</button><button onClick={pressPool}>🏊 Pool</button></>
          : <button onClick={pressHome}>🏠 Home</button>}
      </p>
    </div>
  );
}

export default PetMeLevel2;
