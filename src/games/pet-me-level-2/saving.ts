// saving.ts – keeps how much Saydee has grown up, so it's still there next time. Mia designed this game.
import { GAME_NAME } from "./settings";

const GROWTH_KEY: string = GAME_NAME + "-growth";

// this reads how much she had grown last time
export function loadGrowth(): number {
  try {
    const saved = Number(localStorage.getItem(GROWTH_KEY));
    return Number.isFinite(saved) ? saved : 0;
  } catch {
    return 0; // the browser said no; she starts as a tiny puppy
  }
}

// this writes down how much she has grown
export function saveGrowth(growth: number): void {
  try {
    localStorage.setItem(GROWTH_KEY, String(growth));
  } catch {
    // the browser said no; she just starts small next time
  }
}
