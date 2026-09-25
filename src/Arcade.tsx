// The arcade: a Play button for every game and every save.
// Claude adds one line to GAMES when a game or a save starts, and changes
// nothing else here.
import { lazy, Suspense, useState } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { PuzzleScreen } from "./game-kit/PuzzleScreen";

// one game in the arcade
interface GameEntry {
  name: string; // what the button says
  folder: string; // the folder in src/games
  screen: LazyExoticComponent<ComponentType>;
}

// every game and every save, newest first. To add one, copy a line:
// { name: "Catch the Stars", folder: "catch-the-stars", screen: lazy(function loadCatchTheStars() { return import("./games/catch-the-stars/CatchTheStars"); }) },
const GAMES: GameEntry[] = [];

// her first games, in plain HTML, from before the arcade
const FIRST_GAMES: { name: string; path: string }[] = [
  { name: "Pet Me", path: "/games/pet-me/index.html" },
  { name: "Saydee the dog", path: "/games/saydee-the-dog/index.html" },
];

const CURRENT_GAME_KEY = "arcade-current-game";

// this remembers which game is open, so a save brings her back to it
function loadCurrentGame(): string {
  try {
    return sessionStorage.getItem(CURRENT_GAME_KEY) ?? "";
  } catch {
    return ""; // the browser said no; start at the arcade
  }
}

function saveCurrentGame(folder: string): void {
  try {
    sessionStorage.setItem(CURRENT_GAME_KEY, folder);
  } catch {
    // the browser said no; she just picks the game again after a save
  }
}

// this shows the arcade, or the one game that is open
export function Arcade() {
  const [currentFolder, setCurrentFolder] = useState<string>(loadCurrentGame);
  const current = GAMES.find(function isCurrent(entry: GameEntry): boolean {
    return entry.folder === currentFolder;
  });

  function openGame(folder: string): void {
    saveCurrentGame(folder);
    setCurrentFolder(folder);
  }

  function backToArcade(): void {
    openGame("");
  }

  if (current != null) {
    const Screen = current.screen;
    return (
      <div>
        <button onClick={backToArcade}>⬅ Arcade</button>
        <PuzzleScreen key={current.folder}>
          <Suspense fallback={<p>Loading…</p>}>
            <Screen />
          </Suspense>
        </PuzzleScreen>
      </div>
    );
  }

  return (
    <div className="arcade">
      <h1>🕹️ Mia's Arcade</h1>
      {GAMES.length === 0 ? <p>No games in here yet. Let's make one!</p> : null}
      <ul>
        {GAMES.map(function showGame(entry: GameEntry) {
          function pressPlay(): void {
            openGame(entry.folder);
          }
          return (
            <li key={entry.folder}>
              <button onClick={pressPlay}>▶ {entry.name}</button>
            </li>
          );
        })}
      </ul>
      <h2>First games</h2>
      <ul>
        {FIRST_GAMES.map(function showFirstGame(game: { name: string; path: string }) {
          return (
            <li key={game.path}>
              <a href={game.path}>▶ {game.name}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
