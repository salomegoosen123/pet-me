// Balloon.ts – one balloon, floating up through the sky and swaying a little. Mia designed this game.
import { BALLOON_SIZE, BALLOON_SPEED, YOU_SIZE } from "./settings";
import { WORLD_HEIGHT, WORLD_WIDTH } from "./world";

const SWAY_SPEED: number = 0.05; // how quickly it sways from side to side
const SWAY: number = 0.6; // how far it sways each step
const TOUCH_REACH: number = 0.8; // how close you have to be to touch it (bigger is easier)

// a Balloon is where it is in the sky
export class Balloon {
  across: number; // how far from the left side it is
  height: number; // how high up it is, from the bottom of the sky
  age: number; // how many steps it has floated, for swaying

  constructor(bottomOfTheScreen: number) {
    this.across = Math.random() * (WORLD_WIDTH - BALLOON_SIZE);
    this.height = bottomOfTheScreen - BALLOON_SIZE; // it starts just below the screen, and floats up into it
    this.age = 0;
  }

  // this floats the balloon up a little, swaying from side to side
  float(): void {
    this.age = this.age + 1;
    this.height = this.height + BALLOON_SPEED;
    this.across = this.across + Math.sin(this.age * SWAY_SPEED) * SWAY;
  }

  // this says if you're touching the balloon (your middle is close enough to its middle)
  isTouching(youAcross: number, youHeight: number): boolean {
    const apartAcross = this.across + BALLOON_SIZE / 2 - (youAcross + YOU_SIZE / 2);
    const apartUp = this.height + BALLOON_SIZE / 2 - (youHeight + YOU_SIZE / 2);
    return Math.hypot(apartAcross, apartUp) < (BALLOON_SIZE + YOU_SIZE) / 2 * TOUCH_REACH;
  }

  // this says if the balloon has floated right out of the top of the screen
  isGone(bottomOfTheScreen: number): boolean {
    return this.height > bottomOfTheScreen + WORLD_HEIGHT;
  }
}
