// Rock.ts – one rock, rolling along the candy ground towards you and your family. Mia designed this game.
import { FAMILY_SIZE, ROCK_SIZE, ROCK_SPEED } from "./settings";
import { WORLD_WIDTH } from "./world";

const SPIN: number = 2; // how much a rock turns for every step it rolls
const OFF_THE_EDGE: number = -60; // when a rock is this far past the left side, it's gone
const BUMP_REACH: number = 0.5; // how close a rock and a runner have to be to bump (smaller is kinder)
const ROCK_TOP: number = 0.7; // you have to be at least this high (times the rock's size) to jump over it

// a Rock is where it is along the ground, and how far round it has turned
export class Rock {
  across: number; // how far from the left side it is
  turn: number; // how far round it has rolled

  constructor() {
    this.across = WORLD_WIDTH;
    this.turn = 0;
  }

  // this rolls the rock a little way to the left
  roll(): void {
    this.across = this.across - ROCK_SPEED;
    this.turn = this.turn - ROCK_SPEED * SPIN;
  }

  // this says if the rock has rolled right off the side
  isGone(): boolean {
    return this.across < OFF_THE_EDGE;
  }

  // this says if the rock bumps into someone running here, this high off the ground
  bumps(runnerAcross: number, runnerHeight: number): boolean {
    const apart = Math.abs(this.across + ROCK_SIZE / 2 - (runnerAcross + FAMILY_SIZE / 2));
    const close = apart < (ROCK_SIZE + FAMILY_SIZE) / 2 * BUMP_REACH;
    return close && runnerHeight < ROCK_SIZE * ROCK_TOP;
  }
}
