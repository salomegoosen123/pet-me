// Game.ts – the whole Candy Land game: you and your family, running and jumping in a candy world,
// with rocks rolling towards you. Mia designed this game.
import type { Keys } from "../../game-kit/useKeys";
import { Family } from "./Family";
import { Rock } from "./Rock";
import { FAMILY, ROCK_SECONDS, TICK_MS } from "./settings";
import { placeInLine } from "./world";

const MS_IN_A_SECOND: number = 1000;
const LEAST_WAIT: number = 0.6; // a new rock comes after at least this much of ROCK_SECONDS...
const MORE_WAIT: number = 0.8; // ...and up to this much more, so you can't tell exactly when

// the Game holds your family and the rocks, and makes everything move every tick
export class Game {
  keys: Keys; // the keyboard, for the space bar
  family: Family;
  rocks: Rock[];
  nextRockIn: number; // how many seconds until the next rock comes
  started: boolean;
  isOver: boolean; // did a rock get you

  constructor(keys: Keys) {
    this.keys = keys;
    this.family = new Family();
    this.rocks = [];
    this.nextRockIn = ROCK_SECONDS;
    this.started = false;
    this.isOver = false;
  }

  // this starts the game when you press Play
  start(): void {
    this.started = true;
  }

  // this happens every TICK_MS: press space and you all jump, and the rocks roll along.
  // If a rock bumps into any of you, it's Game Over
  tick(): void {
    if (!this.started || this.isOver) return;
    if (this.keys.isDown(" ")) this.family.jump();
    this.family.run();
    this.rollTheRocks();
    this.sendARock();
    if (this.aRockGotYou()) this.isOver = true;
  }

  // this says if a rock has bumped into anyone in your family
  aRockGotYou(): boolean {
    for (const rock of this.rocks) {
      for (let which = 0; which < FAMILY.length; which++) {
        if (rock.bumps(placeInLine(which), this.family.height)) return true;
      }
    }
    return false;
  }

  // this rolls every rock along, and forgets the ones that have rolled off the side
  rollTheRocks(): void {
    const stillHere: Rock[] = [];
    for (const rock of this.rocks) {
      rock.roll();
      if (!rock.isGone()) stillHere.push(rock);
    }
    this.rocks = stillHere;
  }

  // this sends a new rock rolling in from the right, every now and then
  sendARock(): void {
    this.nextRockIn = this.nextRockIn - TICK_MS / MS_IN_A_SECOND;
    if (this.nextRockIn > 0) return;
    this.rocks.push(new Rock());
    this.nextRockIn = ROCK_SECONDS * (LEAST_WAIT + Math.random() * MORE_WAIT);
  }
}
