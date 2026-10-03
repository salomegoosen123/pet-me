// Jumping.ts – press the space bar to jump, anywhere: on the ground, or up out of the water. Mia designed this game.
import type { Keys } from "../../game-kit/useKeys";
import { JUMP_HEIGHT, JUMP_SECONDS } from "./settings";

const SPACE_BAR: string = " "; // the space bar's name

// Jumping remembers if you're in the middle of a jump
export class Jumping {
  jumpTime: number | null; // how long ago you jumped, or null when you're not jumping

  constructor() {
    this.jumpTime = null;
  }

  // this starts a jump when you press space (but not while you're already in the air),
  // and says how high off the ground you are right now
  lift(keys: Keys, seconds: number): number {
    if (this.jumpTime == null && keys.isDown(SPACE_BAR)) this.jumpTime = 0;
    if (this.jumpTime == null) return 0;
    this.jumpTime = this.jumpTime + seconds;
    const along = this.jumpTime / JUMP_SECONDS; // 0 as you jump, 1 as you land
    if (along >= 1) {
      this.jumpTime = null;
      return 0;
    }
    return Math.sin(along * Math.PI) * JUMP_HEIGHT;
  }
}
