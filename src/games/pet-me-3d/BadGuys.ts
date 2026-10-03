// BadGuys.ts – cartoon bad guys at the park: when Saydee isn't by your side, they sneak up, grab you, and carry
// you off to their hideout under your home (that's Hideout.ts). They come at night too (NightBadGuys.ts).
// Mia designed this game.
import { BoxGeometry, SphereGeometry, Vector3 } from "three";
import type { Scene } from "three";
import type { Dog3D } from "./Dog3D";
import { makePart } from "./paint";
import { PERSON_SIZE, Person3D } from "./Person3D";
import type { PersonLook } from "./Person3D";
import type { Bumper } from "./SaydeeRide";
import { BAD_GUY_SPEED } from "./settings";
import { stepTowards } from "./walking";

const HIDEOUTS: Vector3[] = [new Vector3(-14, 0, 9), new Vector3(14, 0, -9)]; // where they hide, at the edge of the park
const SAYDEE_NEAR: number = 4; // if Saydee is this close to you, she's by your side and they don't dare come
const STOP_AT: number = 0.9; // they sneak up this close to you
const GRAB_DISTANCE: number = 1; // this close, they grab you
const RUN_BACK_SPEED: number = 4; // how fast they run back to hide when Saydee's by your side
const CARRY_SECONDS: number = 3; // how long they carry you across the park before you're gone
const IN_HIS_ARMS: number = 0.45; // he holds you this far in front of him
const ARMS_HEIGHT: number = 0.8; // and this high up

// how the bad guys look: all in black, with short hair
const BAD_GUY_LOOK: PersonLook = {
  hair: "black", skin: "tan", shirt: "black", pants: "dimgray", size: 1, ponytail: false, blanket: "white",
};

// this says how far apart two spots are along the ground (so jumping doesn't count)
function groundDistance(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

// this makes one bad guy, with a black mask and two white eyes, standing at a spot
export function makeBadGuy(spot: Vector3): Person3D {
  const badGuy = new Person3D(BAD_GUY_LOOK);
  badGuy.model.add(makePart(new BoxGeometry(0.56, 0.14, 0.12), "black", 0, 1.97, 0.22));
  badGuy.model.add(makePart(new SphereGeometry(0.04, 12, 8), "white", -0.09, 1.97, 0.28));
  badGuy.model.add(makePart(new SphereGeometry(0.04, 12, 8), "white", 0.09, 1.97, 0.28));
  badGuy.model.position.copy(spot);
  return badGuy;
}

// this holds you in a bad guy's arms, in front of him
export function holdInArms(you: Person3D, grabber: Person3D): void {
  you.model.position.copy(grabber.model.position).addScaledVector(grabber.facing(), IN_HIS_ARMS);
  you.model.position.y = ARMS_HEIGHT;
  you.model.rotation.y = grabber.model.rotation.y;
  you.standStill();
}

// BadGuys are the bad guys at the park
export class BadGuys {
  badGuys: Person3D[];
  grabber: Person3D | null; // the bad guy who has got you, if one has
  carryLeft: number; // how much longer he carries you before you're gone from the park
  jailed: boolean; // did the police take them to jail

  constructor() {
    this.badGuys = HIDEOUTS.map(makeBadGuy);
    this.grabber = null;
    this.carryLeft = 0;
    this.jailed = false;
  }

  // this puts the bad guys in their hideouts at the edge of the park
  start(scene: Scene): void {
    for (const badGuy of this.badGuys) scene.add(badGuy.model);
  }

  // this says where the bad guys are, so you and Saydee bump into them (unless they're in jail)
  spots(): Vector3[] {
    if (this.inJail()) return [];
    return this.badGuys.map(function whereHeIs(badGuy: Person3D): Vector3 {
      return badGuy.model.position;
    });
  }

  // the police took them to jail, so they're not at the park any more
  lockUp(): void {
    this.jailed = true;
    for (const badGuy of this.badGuys) badGuy.model.visible = false;
  }

  // this says if they're in jail
  inJail(): boolean {
    return this.jailed;
  }

  // this says if a bad guy is carrying you off
  holdingYou(): boolean {
    return this.grabber != null;
  }

  // this moves the bad guys (and you, if they've got you). They can only grab you if you're not on something.
  // It says when they've carried you off, to their hideout under your home
  update(you: Person3D, dog: Dog3D, leashOn: boolean, canGrab: boolean, now: number, seconds: number, bump: Bumper): boolean {
    if (this.inJail()) return false;
    if (this.grabber == null) this.sneak(you, dog, leashOn, canGrab, now, seconds);
    else this.carryYouOff(this.grabber, now, seconds);
    for (const badGuy of this.badGuys) bump(badGuy.model.position, PERSON_SIZE);
    if (this.grabber != null) holdInArms(you, this.grabber);
    return this.grabber != null && this.carryLeft <= 0;
  }

  // while Saydee's by your side they stay in their hideouts, but when she's away they sneak up and grab you
  sneak(you: Person3D, dog: Dog3D, leashOn: boolean, canGrab: boolean, now: number, seconds: number): void {
    const saydeeAway = !leashOn && groundDistance(dog.model.position, you.model.position) > SAYDEE_NEAR;
    for (let i = 0; i < this.badGuys.length; i++) {
      const badGuy = this.badGuys[i];
      if (!saydeeAway) {
        stepTowards(badGuy, HIDEOUTS[i], RUN_BACK_SPEED, 0, now, seconds);
        continue;
      }
      stepTowards(badGuy, you.model.position, BAD_GUY_SPEED, STOP_AT, now, seconds);
      badGuy.faceTowards(you.model.position);
      if (canGrab && groundDistance(badGuy.model.position, you.model.position) < GRAB_DISTANCE) {
        this.grabber = badGuy;
        this.carryLeft = CARRY_SECONDS;
        return;
      }
    }
  }

  // the bad guy who grabbed you runs off with you to his hideout at the edge of the park, and the other one runs too
  carryYouOff(grabber: Person3D, now: number, seconds: number): void {
    this.carryLeft = this.carryLeft - seconds;
    for (let i = 0; i < this.badGuys.length; i++) {
      const speed = this.badGuys[i] === grabber ? BAD_GUY_SPEED : RUN_BACK_SPEED;
      stepTowards(this.badGuys[i], HIDEOUTS[i], speed, 0, now, seconds);
    }
  }
}
