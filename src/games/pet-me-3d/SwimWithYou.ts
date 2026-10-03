// SwimWithYou.ts – your brother swimming with you in the pool at home: he puts on his costume, runs out,
// jumps in, and swims next to you. When you get out, he puts his clothes back on. Mia designed this game.
import { Vector3 } from "three";
import { bumpOff, bumpOffBlocks, bumpOffWalls } from "./bumping";
import type { Away } from "./FamilyWalker";
import { BLOCKS_EVERYONE } from "./obstacles";
import { PERSON_SIZE } from "./Person3D";
import type { Person3D, PersonLook } from "./Person3D";
import { floatInPool, inThePool, nextToYouInThePool, swimDepth } from "./pool";
import { roomOf, routeBetween } from "./routes";
import { FAMILY_WALK_SPEED } from "./settings";
import { HOME_WALLS } from "./walls";

const HURRY: number = FAMILY_WALK_SPEED * 1.6; // he hurries, because he loves swimming
const THERE: number = 0.15; // this close to a stop counts as being there
const FAR_AWAY: number = 100; // walking never stops him by itself
const JUMP_SECONDS: number = 0.5; // how long his jump into the pool takes
const JUMP_HIGH: number = 0.8; // how high he jumps

// SwimWithYou takes your brother to the pool and swims him next to you
export class SwimWithYou implements Away {
  costume: PersonLook;
  clothes: PersonLook;
  stops: Vector3[]; // the doors on the way out to the yard
  wasInPool: boolean; // was he in the pool a moment ago, so we know when he jumps in
  jumpLeft: number; // how much longer his jump into the pool takes

  constructor(clothes: PersonLook, costume: PersonLook) {
    this.clothes = clothes;
    this.costume = costume;
    this.stops = [];
    this.wasInPool = false;
    this.jumpLeft = 0;
  }

  // this puts on his costume, and works out the doors on the way to the pool
  begin(person: Person3D, you: Person3D): void {
    person.dress(this.costume);
    this.stops = routeBetween(person.model.position, nextToYouInThePool(you.model.position));
    this.wasInPool = inThePool(person.model.position);
    this.jumpLeft = 0;
  }

  // this runs him through the doors to the pool, jumps him in, and keeps him swimming next to you
  move(person: Person3D, you: Person3D, now: number, seconds: number): void {
    const target = nextToYouInThePool(you.model.position);
    if (this.stops.length > 0 && roomOf(person.model.position) === "yard") this.stops = []; // he's out in the yard now
    const goal = this.stops.length > 0 ? this.stops[0] : target;
    const way = new Vector3(goal.x - person.model.position.x, 0, goal.z - person.model.position.z);
    if (way.length() < THERE) {
      if (this.stops.length > 0) this.stops.shift();
      person.standStill();
      person.faceTowards(you.model.position);
    } else {
      person.stepAlong(way.clone().normalize(), Math.min(way.length(), HURRY * seconds), FAR_AWAY, now);
    }
    this.bump(person, you);
    this.splashAndFloat(person, now, seconds);
  }

  // this jumps him in with a big arc when he gets to the pool, then floats him in the water
  splashAndFloat(person: Person3D, now: number, seconds: number): void {
    const inPool = inThePool(person.model.position);
    if (inPool && !this.wasInPool) this.jumpLeft = JUMP_SECONDS;
    this.wasInPool = inPool;
    if (this.jumpLeft <= 0) {
      floatInPool(person, now);
      return;
    }
    this.jumpLeft = this.jumpLeft - seconds;
    const along = 1 - Math.max(0, this.jumpLeft) / JUMP_SECONDS; // 0 as he jumps, 1 as he lands in the water
    person.model.position.y = swimDepth(person) * along + Math.sin(along * Math.PI) * JUMP_HIGH;
  }

  // this stops him running through walls, furniture or you (he can go in the pool, of course)
  bump(person: Person3D, you: Person3D): void {
    const spot = person.model.position;
    bumpOffWalls(spot, PERSON_SIZE, HOME_WALLS);
    bumpOffBlocks(spot, PERSON_SIZE, BLOCKS_EVERYONE);
    bumpOff(spot, PERSON_SIZE, you.model.position, PERSON_SIZE);
  }

  // this gets him out of the pool and back into his clothes
  end(person: Person3D): void {
    person.dress(this.clothes);
    person.model.position.y = 0;
    this.stops = [];
  }
}
