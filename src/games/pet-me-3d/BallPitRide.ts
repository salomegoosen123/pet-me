// BallPitRide.ts – a go in the ball pit: you jump in, bounce about in the balls, and jump out again. Mia designed this game.
import { Vector3 } from "three";
import type { Keys } from "../../game-kit/useKeys";
import type { Person3D } from "./Person3D";
import { BALL_PIT_SIZE, BALL_PIT_SPOT } from "./playRoom";
import type { Ride } from "./ride";
import { anyArrowDown } from "./walking";

const JUMP_SECONDS: number = 0.6; // how long a jump in or out takes
const JUMP_HIGH: number = 0.8; // how high you jump
const SINK_IN: number = -0.2; // how far down into the balls you sink
const BOUNCE_HIGH: number = 0.4; // how high you bounce
const BOUNCE_SPEED: number = 6; // how fast you bounce
const SETTLE_SECONDS: number = 0.5; // the arrow keys can't get you out until you've landed
const JUMP_OUT_TO: Vector3 = BALL_PIT_SPOT.clone().add(new Vector3(BALL_PIT_SIZE / 2 + 0.6, 0, 0)); // on the door side

// the parts of a go in the ball pit
type PitPart = "jumpingIn" | "bouncing" | "jumpingOut";

// a BallPitRide jumps you into the balls, bounces you, and jumps you out when you press an arrow key
export class BallPitRide implements Ride {
  part: PitPart; // which part of your go you are on
  partTime: number; // how many seconds into that part you are
  from: Vector3; // where you jumped in from

  constructor() {
    this.part = "jumpingIn";
    this.partTime = 0;
    this.from = new Vector3();
  }

  // this gets you ready to jump in from where you are
  begin(you: Person3D): void {
    this.from = you.model.position.clone().setY(0);
    this.nextPart("jumpingIn");
  }

  // this moves on to the next part of your go
  nextPart(part: PitPart): void {
    this.part = part;
    this.partTime = 0;
  }

  // this jumps you in, bounces you, and jumps you out. It says if you're still in
  move(you: Person3D, now: number, seconds: number, keys: Keys): boolean {
    this.partTime = this.partTime + seconds;
    if (this.part === "jumpingIn") {
      if (this.jump(you, this.from, BALL_PIT_SPOT, 0, SINK_IN)) this.nextPart("bouncing");
    } else if (this.part === "bouncing") {
      this.bounce(you, now, keys);
    } else if (this.jump(you, BALL_PIT_SPOT, JUMP_OUT_TO, SINK_IN, 0)) {
      return false;
    }
    return true;
  }

  // this jumps you in an arc from one spot to another. It says if you've landed
  jump(you: Person3D, from: Vector3, to: Vector3, fromY: number, toY: number): boolean {
    const along = Math.min(1, this.partTime / JUMP_SECONDS);
    if (along < 1) you.faceTowards(to);
    you.model.position.lerpVectors(from, to, along);
    you.model.position.y = fromY + (toY - fromY) * along + Math.sin(along * Math.PI) * JUMP_HIGH;
    return along >= 1;
  }

  // this bounces you up and down in the balls, kicking your legs, until you press an arrow key
  bounce(you: Person3D, now: number, keys: Keys): void {
    you.model.position.y = SINK_IN + Math.abs(Math.sin(now * BOUNCE_SPEED)) * BOUNCE_HIGH;
    you.marchOnTheSpot(now);
    if (this.partTime > SETTLE_SECONDS && anyArrowDown(keys)) this.nextPart("jumpingOut");
  }
}
