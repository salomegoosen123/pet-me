// TowelRide.ts – relaxing on your beach towel: you lie in the sun until you press an arrow key. Mia designed this game.
import { Vector3 } from "three";
import type { Keys } from "../../game-kit/useKeys";
import type { Person3D } from "./Person3D";
import type { Ride } from "./ride";
import { anyArrowDown } from "./walking";

const SETTLE_SECONDS: number = 0.5; // the arrow keys can't get you up until you've lain down
const GET_UP_TO: Vector3 = new Vector3(0.9, 0, 0); // you get up just to the side of your towel

// a TowelRide lies you on your towel, and gets you up again when you press an arrow key
export class TowelRide implements Ride {
  feet: Vector3; // where your feet go when you lie down
  time: number; // how long you've been lying there

  constructor(feet: Vector3) {
    this.feet = feet;
    this.time = 0;
  }

  // this lies you down on your towel, with no blanket, in the sun
  begin(you: Person3D): void {
    you.lieDown(this.feet, false);
    this.time = 0;
  }

  // this keeps you lying there until you press an arrow key. It says if you're still lying there
  move(you: Person3D, _now: number, seconds: number, keys: Keys): boolean {
    this.time = this.time + seconds;
    if (this.time < SETTLE_SECONDS || !anyArrowDown(keys)) return true;
    you.standUp();
    you.model.position.copy(this.feet).setY(0).add(GET_UP_TO);
    return false;
  }
}
