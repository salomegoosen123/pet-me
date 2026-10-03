// Family.ts – you and your family, running along in Candy Land and jumping all together. Mia designed this game.
import { GRAVITY, JUMP_SPEED } from "./settings";

const RUN_SPEED: number = 0.4; // how fast your legs go (how quickly everyone bobs up and down)
const RUN_BOUNCE: number = 4; // how high everyone bobs while running
const OUT_OF_STEP: number = 1.5; // each of you is a little out of step with the one in front

// Family is you and your family: how high you've jumped, and how fast you're going up or down
export class Family {
  height: number; // how high above the ground you all are
  speed: number; // how fast you're going up (or down, when it's below 0)
  steps: number; // how many steps you've run, for bobbing along

  constructor() {
    this.height = 0;
    this.speed = 0;
    this.steps = 0;
  }

  // this says if you're all on the ground (you can only jump from the ground)
  onTheGround(): boolean {
    return this.height <= 0;
  }

  // this makes you all jump together, if you're on the ground
  jump(): void {
    if (!this.onTheGround()) return;
    this.speed = JUMP_SPEED;
  }

  // this runs your legs, and moves you all up or down until you land
  run(): void {
    this.steps = this.steps + 1;
    this.height = this.height + this.speed;
    this.speed = this.speed - GRAVITY;
    if (this.height > 0) return;
    this.height = 0;
    this.speed = 0;
  }

  // this says how high one of you bobs up as you run along the ground
  bob(which: number): number {
    if (!this.onTheGround()) return 0;
    return Math.abs(Math.sin((this.steps + which * OUT_OF_STEP) * RUN_SPEED)) * RUN_BOUNCE;
  }
}
