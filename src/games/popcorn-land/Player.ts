// Player.ts – you, in Popcorn Land: walking, jumping, and landing on clouds. Mia designed this game.
import type { Cloud } from "./Cloud";
import { GRAVITY, JUMP_SPEED, WALK_SPEED, YOU_SIZE } from "./settings";
import { WORLD_WIDTH } from "./world";

// the Player is you: where you are, and how fast you're going up or down
export class Player {
  across: number; // how far from the left side you are
  height: number; // how high your feet are, from the bottom of the sky
  speed: number; // how fast you're going up (or down, when it's below 0)
  standing: boolean; // are you standing on a cloud (you can only jump from a cloud)
  facingLeft: boolean; // which way you're looking

  constructor(across: number, height: number) {
    this.across = across;
    this.height = height;
    this.speed = 0;
    this.standing = false;
    this.facingLeft = false;
  }

  // this says the spot under the middle of you
  middle(): number {
    return this.across + YOU_SIZE / 2;
  }

  // this walks you left (way is -1) or right (way is 1), but not out of the sky
  walk(way: number): void {
    this.across = Math.min(WORLD_WIDTH - YOU_SIZE, Math.max(0, this.across + way * WALK_SPEED));
    this.facingLeft = way < 0;
  }

  // this puts you standing in the middle of a cloud
  landOn(cloud: Cloud): void {
    this.across = cloud.across + cloud.width / 2 - YOU_SIZE / 2;
    this.height = cloud.top;
    this.speed = 0;
    this.standing = true;
  }

  // this makes you jump, if you're standing on a cloud
  jump(): void {
    if (!this.standing) return;
    this.speed = JUMP_SPEED;
    this.standing = false;
  }

  // this moves you up or down, and lands you on a cloud if you come down on one
  fall(clouds: Cloud[]): void {
    const before = this.height;
    this.speed = this.speed - GRAVITY;
    this.height = this.height + this.speed;
    this.standing = false;
    if (this.speed > 0) return; // still going up
    for (const cloud of clouds) {
      const landing = before >= cloud.top && this.height <= cloud.top && cloud.isUnder(this.middle());
      if (!landing) continue;
      this.height = cloud.top;
      this.speed = 0;
      this.standing = true;
    }
  }
}
