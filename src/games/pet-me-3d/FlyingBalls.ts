// FlyingBalls.ts – when you bounce in the ball pit, balls fly out everywhere and land on the play room floor.
// Then you tidy up: walk to each ball and it jumps back into the ball pit. Mia designed this game.
import { Group, Material, SphereGeometry, Vector3 } from "three";
import type { Mesh } from "three";
import { bumpOffBlocks } from "./bumping";
import { ROOM_WALL } from "./homeSpots";
import { BACK, HOUSE_LEFT } from "./house";
import { BLOCKS_EVERYONE, BLOCKS_ONLY_YOU } from "./obstacles";
import { makePart } from "./paint";
import type { Person3D } from "./Person3D";
import { BALL_PIT_SIZE, BALL_PIT_SPOT } from "./playRoom";
import { BALL_PIT_COLOURS, BALLS_FLY_OUT_SECONDS, MOST_BALLS_OUT } from "./settings";

const BALL_SIZE: number = 0.12; // the same as the balls in the pit
const OUT_OF_THE_PIT: number = 0.5; // how high a ball starts when it flies out
const FLING: number = 3; // how hard balls fly out, sideways
const FLING_UP: number = 4; // and upwards
const GRAVITY: number = 10; // how fast they fall
const NEAR_THE_WALL: number = 0.3; // balls stop this far from the play room walls
const PICK_UP_REACH: number = 0.6; // walk this close to a ball to pick it up
const JUMP_HOME_SECONDS: number = 0.6; // how long a ball takes to jump back into the pit
const JUMP_HIGH: number = 1; // how high it jumps on the way
const IN_THE_PIT: number = 0.35; // how high a ball lands back in the pit

// where a ball is: flying out, on the floor, or jumping back into the pit
type BallPlace = "flying" | "floor" | "jumpingHome";

// this keeps a ball inside the play room, not in the walls
function insideThePlayRoom(spot: Vector3): void {
  spot.x = Math.min(-ROOM_WALL - NEAR_THE_WALL, Math.max(HOUSE_LEFT + NEAR_THE_WALL, spot.x));
  spot.z = Math.min(-ROOM_WALL - NEAR_THE_WALL, Math.max(BACK + NEAR_THE_WALL, spot.z));
}

// this says a spot somewhere in the ball pit, this high up
function somewhereInThePit(height: number): Vector3 {
  const reach = BALL_PIT_SIZE / 2 - BALL_SIZE * 2;
  return BALL_PIT_SPOT.clone().add(new Vector3((Math.random() - 0.5) * 2 * reach, height, (Math.random() - 0.5) * 2 * reach));
}

// FlyingBalls are the balls that have flown out of the ball pit
export class FlyingBalls {
  group: Group; // all the balls that are out
  balls: Mesh[];
  places: BallPlace[]; // where each ball is
  speeds: Vector3[]; // how fast each ball is flying
  jumpFrom: Vector3[]; // where each ball jumped from, on its way back into the pit
  jumpTo: Vector3[]; // and where in the pit it lands
  jumpTime: number[]; // how far through its jump each ball is (0 to 1)
  nextBallIn: number; // how long until another ball flies out

  constructor() {
    this.group = new Group();
    this.balls = [];
    this.places = [];
    this.speeds = [];
    this.jumpFrom = [];
    this.jumpTo = [];
    this.jumpTime = [];
    this.nextBallIn = 0;
  }

  // this throws balls out while you bounce, flies them, picks them up when you walk to them,
  // and jumps them back into the pit
  update(you: Person3D, bouncing: boolean, seconds: number): void {
    this.nextBallIn = this.nextBallIn - seconds;
    if (bouncing && this.nextBallIn <= 0 && this.balls.length < MOST_BALLS_OUT) this.throwOne();
    for (let i = 0; i < this.balls.length; i++) {
      if (this.places[i] === "flying") this.fly(i, seconds);
      else if (this.places[i] === "floor" && !bouncing) this.pickUpIfNear(i, you);
      else if (this.places[i] === "jumpingHome") this.jumpHome(i, seconds);
    }
  }

  // this throws one ball out of the pit, in a random colour and a random way
  throwOne(): void {
    this.nextBallIn = BALLS_FLY_OUT_SECONDS;
    const colour = BALL_PIT_COLOURS[Math.floor(Math.random() * BALL_PIT_COLOURS.length)];
    const ball = makePart(new SphereGeometry(BALL_SIZE, 10, 8), colour, 0, 0, 0);
    ball.position.copy(somewhereInThePit(OUT_OF_THE_PIT));
    const angle = Math.random() * Math.PI * 2;
    const push = FLING * (0.5 + Math.random());
    this.balls.push(ball);
    this.places.push("flying");
    this.speeds.push(new Vector3(Math.cos(angle) * push, FLING_UP * (0.6 + Math.random() * 0.6), Math.sin(angle) * push));
    this.jumpFrom.push(new Vector3());
    this.jumpTo.push(new Vector3());
    this.jumpTime.push(0);
    this.group.add(ball);
  }

  // this flies a ball through the air until it lands on the floor, out of the way of the furniture
  fly(which: number, seconds: number): void {
    const ball = this.balls[which];
    const speed = this.speeds[which];
    speed.y = speed.y - GRAVITY * seconds;
    ball.position.addScaledVector(speed, seconds);
    insideThePlayRoom(ball.position);
    if (ball.position.y > BALL_SIZE) return;
    ball.position.y = BALL_SIZE;
    bumpOffBlocks(ball.position, BALL_SIZE, [...BLOCKS_EVERYONE, ...BLOCKS_ONLY_YOU]); // not back in the pit
    this.places[which] = "floor";
  }

  // when you walk up to a ball on the floor, you pick it up and it jumps back into the ball pit
  pickUpIfNear(which: number, you: Person3D): void {
    const spot = this.balls[which].position;
    if (Math.hypot(spot.x - you.model.position.x, spot.z - you.model.position.z) > PICK_UP_REACH) return;
    this.jumpFrom[which].copy(spot);
    this.jumpTo[which].copy(somewhereInThePit(IN_THE_PIT));
    this.jumpTime[which] = 0;
    this.places[which] = "jumpingHome";
  }

  // this jumps a ball in an arc back into the pit, where it goes back in with all the others
  jumpHome(which: number, seconds: number): void {
    const ball = this.balls[which];
    this.jumpTime[which] = Math.min(1, this.jumpTime[which] + seconds / JUMP_HOME_SECONDS);
    const along = this.jumpTime[which];
    ball.position.lerpVectors(this.jumpFrom[which], this.jumpTo[which], along);
    ball.position.y = ball.position.y + Math.sin(along * Math.PI) * JUMP_HIGH;
    if (along < 1) return;
    this.putAway(which);
  }

  // this takes a ball away once it's back in the pit
  putAway(which: number): void {
    const ball = this.balls[which];
    this.group.remove(ball);
    ball.geometry.dispose();
    if (ball.material instanceof Material) ball.material.dispose();
    this.balls.splice(which, 1);
    this.places.splice(which, 1);
    this.speeds.splice(which, 1);
    this.jumpFrom.splice(which, 1);
    this.jumpTo.splice(which, 1);
    this.jumpTime.splice(which, 1);
  }
}
