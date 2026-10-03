// BallPitBuddy.ts – your brother jumping into the ball pit with you and bouncing about. Mia designed this game.
import { Vector3 } from "three";
import { bumpOff, bumpOffBlocks, bumpOffWalls } from "./bumping";
import type { Away } from "./FamilyWalker";
import { BLOCKS_EVERYONE, BLOCKS_ONLY_YOU } from "./obstacles";
import { PERSON_SIZE } from "./Person3D";
import type { Person3D } from "./Person3D";
import { BALL_PIT_SIZE, BALL_PIT_SPOT } from "./playRoom";
import { routeBetween } from "./routes";
import { FAMILY_WALK_SPEED } from "./settings";
import { HOME_WALLS } from "./walls";

const HURRY: number = FAMILY_WALK_SPEED * 1.7; // he hurries over, because he loves the ball pit
const BY_THE_PIT: Vector3 = BALL_PIT_SPOT.clone().add(new Vector3(BALL_PIT_SIZE / 2 + 0.5, 0, 0.9)); // he jumps in from here
const IN_THE_PIT: Vector3 = BALL_PIT_SPOT.clone().add(new Vector3(0.45, 0, 0.45)); // he bounces here, next to you
const THERE: number = 0.2; // this close to a stop counts as being there
const FAR_AWAY: number = 100; // walking never stops him by itself
const JUMP_SECONDS: number = 0.6; // how long his jump in takes
const JUMP_HIGH: number = 0.8; // how high he jumps
const SINK_IN: number = -0.2; // how far down into the balls he sinks
const BOUNCE_HIGH: number = 0.4; // how high he bounces
const BOUNCE_SPEED: number = 6; // how fast he bounces

// the parts of his go in the ball pit
type PitPart = "runningOver" | "jumpingIn" | "bouncing";

// BallPitBuddy runs your brother over to the ball pit, jumps him in, and bounces him next to you
export class BallPitBuddy implements Away {
  part: PitPart;
  partTime: number; // how many seconds into this part he is
  stops: Vector3[]; // the doors on the way, if he's in another room
  jumpFrom: Vector3; // where he jumped from

  constructor() {
    this.part = "runningOver";
    this.partTime = 0;
    this.stops = [];
    this.jumpFrom = new Vector3();
  }

  // this works out the way over to the ball pit
  begin(person: Person3D): void {
    this.part = "runningOver";
    this.partTime = 0;
    this.stops = routeBetween(person.model.position, BY_THE_PIT);
  }

  // this runs him over, jumps him in, and bounces him
  move(person: Person3D, you: Person3D, now: number, seconds: number): void {
    this.partTime = this.partTime + seconds;
    if (this.part === "runningOver") this.runOver(person, you, now, seconds);
    else if (this.part === "jumpingIn") this.jumpIn(person);
    else this.bounce(person, you, now);
  }

  // this runs him to the edge of the ball pit, through the doors
  runOver(person: Person3D, you: Person3D, now: number, seconds: number): void {
    const here = person.model.position;
    const goal = this.stops.length > 0 ? this.stops[0] : BY_THE_PIT;
    const way = new Vector3(goal.x - here.x, 0, goal.z - here.z);
    if (way.length() < THERE) {
      if (this.stops.length > 0) this.stops.shift();
      if (this.stops.length > 0) return;
      this.jumpFrom = here.clone().setY(0);
      this.part = "jumpingIn";
      this.partTime = 0;
      return;
    }
    person.stepAlong(way.clone().normalize(), Math.min(way.length(), HURRY * seconds), FAR_AWAY, now);
    bumpOffWalls(here, PERSON_SIZE, HOME_WALLS);
    bumpOffBlocks(here, PERSON_SIZE, BLOCKS_EVERYONE);
    bumpOffBlocks(here, PERSON_SIZE, BLOCKS_ONLY_YOU);
    bumpOff(here, PERSON_SIZE, you.model.position, PERSON_SIZE);
  }

  // this jumps him over the side of the ball pit, in a big arc, down into the balls
  jumpIn(person: Person3D): void {
    const along = Math.min(1, this.partTime / JUMP_SECONDS);
    person.model.position.lerpVectors(this.jumpFrom, IN_THE_PIT, along);
    person.model.position.y = SINK_IN * along + Math.sin(along * Math.PI) * JUMP_HIGH;
    person.faceTowards(IN_THE_PIT);
    if (along >= 1) this.part = "bouncing";
  }

  // this bounces him up and down in the balls, kicking his legs, looking at you
  bounce(person: Person3D, you: Person3D, now: number): void {
    person.model.position.y = SINK_IN + Math.abs(Math.sin(now * BOUNCE_SPEED + 1)) * BOUNCE_HIGH;
    person.marchOnTheSpot(now);
    person.faceTowards(you.model.position);
  }

  // when you jump out, he climbs out too
  end(person: Person3D): void {
    person.model.position.copy(BY_THE_PIT);
    person.standStill();
  }
}
