// FollowYou.ts – your brother following you all round the house, through the doors, like Saydee does. Mia designed this game.
import { Vector3 } from "three";
import { bumpOff, bumpOffBlocks, bumpOffWalls } from "./bumping";
import type { Away } from "./FamilyWalker";
import { BLOCKS_EVERYONE, BLOCKS_ONLY_YOU } from "./obstacles";
import { PERSON_SIZE } from "./Person3D";
import type { Person3D } from "./Person3D";
import { POOL_BLOCK } from "./pool";
import { roomOf, routeBetween } from "./routes";
import type { Room } from "./routes";
import { FAMILY_WALK_SPEED } from "./settings";
import { HOME_WALLS } from "./walls";

const HURRY: number = FAMILY_WALK_SPEED * 1.7; // he walks as fast as you, so he keeps up
const CLOSE_ENOUGH: number = 1.6; // when he's this close to you, he stops and waits
const BEHIND: number = 1.2; // he walks this far behind you...
const TO_THE_SIDE: number = 0.7; // ...and a little to one side, so he doesn't bump into Saydee
const THERE: number = 0.15; // this close to a stop counts as being there
const FAR_AWAY: number = 100; // walking never stops him by itself

// this says the spot a little behind you and to one side, where your brother follows
export function spotBehindYou(you: Person3D): Vector3 {
  const facing = you.facing();
  const side = new Vector3(facing.z, 0, -facing.x);
  return you.model.position.clone().addScaledVector(facing, -BEHIND).addScaledVector(side, TO_THE_SIDE).setY(0);
}

// FollowYou walks your brother after you, working out the doors again whenever you go into a different room
export class FollowYou implements Away {
  stops: Vector3[]; // the doors on the way, then the spot behind you
  yourRoom: Room | null; // the room you were in when he last worked out the doors

  constructor() {
    this.stops = [];
    this.yourRoom = null;
  }

  // this gets him ready to follow you
  begin(): void {
    this.stops = [];
    this.yourRoom = null;
  }

  // this walks him towards you, through the doors, and stops him when he's close
  move(person: Person3D, you: Person3D, now: number, seconds: number): void {
    const here = person.model.position;
    if (Math.hypot(here.x - you.model.position.x, here.z - you.model.position.z) < CLOSE_ENOUGH) {
      person.standStill();
      person.faceTowards(you.model.position);
      this.bump(person, you);
      return;
    }
    const target = spotBehindYou(you);
    const yourRoom = roomOf(target);
    if (yourRoom !== this.yourRoom || this.stops.length === 0) {
      this.stops = routeBetween(here, target);
      this.yourRoom = yourRoom;
    }
    this.stops[this.stops.length - 1] = target;
    const way = new Vector3(this.stops[0].x - here.x, 0, this.stops[0].z - here.z);
    if (way.length() < THERE && this.stops.length > 1) this.stops.shift();
    else person.stepAlong(way.clone().normalize(), Math.min(way.length(), HURRY * seconds), FAR_AWAY, now);
    this.bump(person, you);
    here.y = 0;
  }

  // this stops him walking through walls, furniture, the pool, or you
  bump(person: Person3D, you: Person3D): void {
    const spot = person.model.position;
    bumpOffWalls(spot, PERSON_SIZE, HOME_WALLS);
    bumpOffBlocks(spot, PERSON_SIZE, BLOCKS_EVERYONE);
    bumpOffBlocks(spot, PERSON_SIZE, BLOCKS_ONLY_YOU);
    bumpOffBlocks(spot, PERSON_SIZE, [POOL_BLOCK]);
    bumpOff(spot, PERSON_SIZE, you.model.position, PERSON_SIZE);
  }

  // he stops following when he goes to do something else
  end(): void {
    this.stops = [];
  }
}
