// PetMe3D.tsx – the screen for Pet Me 3D. Mia designed this game.
import type { CSSProperties, FormEvent, KeyboardEvent, ReactNode } from "react";
import { useGame } from "../../game-kit/useGame";
import { useKeys } from "../../game-kit/useKeys";
import { useWorld3D } from "../../game-kit/useWorld3D";
import type { World3D } from "../../game-kit/useWorld3D";
import { showBar } from "./bars";
import { BeachScenery } from "./beachThings";
import { Game } from "./Game";
import type { Place } from "./Game";
import { GrandparentsScenery } from "./grandparentsPlace";
import { Home3D } from "./Home3D";
import { Outside3D } from "./Outside3D";
import { ParkScenery } from "./parkThings";
import { HUNGER_START, SLEEP_START, TICK_MS, WATER_START } from "./settings";

const SCREEN_STYLE: CSSProperties = { textAlign: "center", padding: 24 };
const WORLD_STYLE: CSSProperties = {
  display: "block", width: "100%", maxWidth: 800, height: 440, margin: "0 auto",
  borderRadius: 24, touchAction: "none", cursor: "grab",
};

// this makes Saydee's 3D home
function makeHome(): World3D<Game> {
  return new Home3D();
}

// this makes the 3D park
function makePark(): World3D<Game> {
  return new Outside3D(new ParkScenery());
}

// this makes the 3D beach
function makeBeach(): World3D<Game> {
  return new Outside3D(new BeachScenery());
}

// this makes Ouma and Oupa's place
function makeGrandparents(): World3D<Game> {
  return new Outside3D(new GrandparentsScenery());
}

// this shows one line of the chat with your family
function showChatLine(line: string, which: number): ReactNode {
  return <div key={which}>{line}</div>;
}

// which 3D world to show for each place
const WORLD_MAKERS: Record<Place, { (): World3D<Game> }> = {
  home: makeHome, park: makePark, beach: makeBeach, grandparents: makeGrandparents,
};

// this shows Pet Me 3D on the screen
function PetMe3D(): ReactNode {
  const keys = useKeys();

  // this makes a brand new game, which can feel the arrow keys
  function makeGame(): Game {
    return new Game(keys);
  }

  const { game, drawAgain } = useGame(makeGame, TICK_MS);
  const drawWorldOn = useWorld3D(WORLD_MAKERS[game.place], game);

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

  // this happens when you press Sleep for Saydee
  function pressSleep(): void {
    game.putToBed();
    drawAgain();
  }

  // this happens when you press Bath
  function pressBath(): void {
    game.bathe();
    drawAgain();
  }

  // this happens when you press Sit
  function pressSit(): void {
    game.ask("sit");
  }

  // this happens when you press Go to bed
  function pressGoToBed(): void {
    game.ask("bed");
  }

  // this happens when you press Apple at the fridge
  function pressApple(): void {
    game.ask("apple");
  }

  // this happens when you press Treat at the fridge
  function pressTreat(): void {
    game.ask("treat");
  }

  // this happens when you press Park
  function pressPark(): void {
    game.goOut("park");
    drawAgain();
  }

  // this happens when you press Beach
  function pressBeach(): void {
    game.goOut("beach");
    drawAgain();
  }

  // this happens when you press Home
  function pressHome(): void {
    game.goHome();
    drawAgain();
  }

  // this happens when you press Send in the chat: your family hears what you typed
  function sendChat(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = event.currentTarget;
    const words = new FormData(form).get("words");
    if (typeof words === "string") game.say(words);
    form.reset();
    const box = form.elements.namedItem("words");
    if (box instanceof HTMLInputElement) box.blur(); // so the arrow keys walk you again
  }

  // this keeps your typing in the chat box, so the space bar doesn't make you jump while you type
  function keepTypingInTheBox(event: KeyboardEvent<HTMLInputElement>): void {
    event.stopPropagation();
  }

  if (!game.started) {
    return (
      <div style={SCREEN_STYLE}>
        <h1>Pet Me 3D</h1>
        <button onClick={pressPlay}>▶ Play</button>
      </div>
    );
  }

  return (
    <div style={SCREEN_STYLE}>
      <h1>{game.petName}</h1>
      <canvas ref={drawWorldOn} style={WORLD_STYLE}></canvas>
      <p>⬆️⬇️⬅️➡️ Walk with the arrow keys. Space to jump. 🖱️ Drag to spin the camera, scroll to zoom.</p>
      {game.place === "home"
        ? (
          <form onSubmit={sendChat}>
            💬 <input name="words" maxLength={60} autoComplete="off" placeholder="Say something to your family"
              onKeyDown={keepTypingInTheBox} />
            <button type="submit">Send</button>
            {game.chat.map(showChatLine)}
          </form>
        )
        : null}
      {showBar("🦴 Hunger", game.pet.hunger, HUNGER_START)}
      {showBar("💧 Water", game.pet.water, WATER_START)}
      {showBar("💤 Sleep", game.pet.rest, SLEEP_START)}
      {game.place === "home" && game.atFridge
        ? (
          <p>
            🧊 The fridge:
            <button onClick={pressApple}>🍎 Apple</button>
            <button onClick={pressTreat}>🍖 Treat</button>
          </p>
        )
        : null}
      {game.place === "home"
        ? (
          <p>
            <button onClick={pressFeed}>🦴 Feed</button>
            <button onClick={pressWater}>💧 Water</button>
            <button onClick={pressBath}>🛁 Bath</button>
            <button onClick={pressSleep}>💤 Saydee sleep</button>
            <button onClick={pressSit}>🪑 Sit</button>
            <button onClick={pressGoToBed}>🛏️ Go to bed</button>
            <button onClick={pressPark}>🌳 Park</button>
            <button onClick={pressBeach}>🏖️ Beach</button>
          </p>
        )
        : (
          <div>
            <p>
              <button onClick={pressHome}>🏠 Home</button>
            </p>
          </div>
        )}
    </div>
  );
}

export default PetMe3D;
