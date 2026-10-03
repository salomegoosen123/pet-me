// SeesawRide.ts – a go on the seesaw: you sit on one end, your brother sits on the other, and up and down you go. Mia designed this game.
import type { Keys } from "../../game-kit/useKeys";
import type { Person3D } from "./Person3D";
import type { Ride } from "./ride";
import { SEESAW_TIP } from "./Seesaw3D";
import type { Seesaw3D } from "./Seesaw3D";
import { SEESAW_SPEED } from "./settings";
import { anyArrowDown } from "./walking";

const ON_THE_BOARD: number = 0.06; // how far above the middle of the board you sit
const HOP_OFF: number = 0.6; // how far past the end you land when you get off
const SETTLE_SECONDS: number = 0.5; // the arrow keys can't get you off until you've sat down

// a SeesawRide sits you and your brother on the two ends, and tips you up and down until you press an arrow key
export class SeesawRide implements Ride {
  seesaw: Seesaw3D;
  brother: Person3D;
  yourEnd: number; // -1 is the left end, 1 is the right end
  time: number; // how long you have been on

  constructor(seesaw: Seesaw3D, brother: Person3D) {
    this.seesaw = seesaw;
    this.brother = brother;
    this.yourEnd = -1;
    this.time = 0;
  }

  // this sits you on the end closer to you
  begin(you: Person3D): void {
    this.yourEnd = this.seesaw.nearestEnd(you.model.position);
    this.time = 0;
  }

  // this tips the seesaw up and down, with you on one end and your brother on the other. It says if you're still on
  move(you: Person3D, now: number, seconds: number, keys: Keys): boolean {
    this.time = this.time + seconds;
    if (this.time > SETTLE_SECONDS && anyArrowDown(keys)) return this.getOff(you);
    const angle = SEESAW_TIP * Math.cos(this.time * SEESAW_SPEED);
    this.seesaw.tipTo(angle);
    this.sitOnEnd(you, this.yourEnd, angle);
    this.sitOnEnd(this.brother, -this.yourEnd, angle);
    return true;
  }

  // this sits someone on one end of the board
  sitOnEnd(person: Person3D, end: number, angle: number): void {
    const spot = this.seesaw.seatSpot(end, angle);
    person.sitDown(spot, this.seesaw.facingFrom(end), spot.y + ON_THE_BOARD);
  }

  // this hops you both off, each past your own end
  getOff(you: Person3D): boolean {
    this.seesaw.tipTo(SEESAW_TIP);
    this.hopOff(you, this.yourEnd);
    this.hopOff(this.brother, -this.yourEnd);
    return false;
  }

  // this hops someone off past their end of the seesaw
  hopOff(person: Person3D, end: number): void {
    const spot = this.seesaw.seatSpot(end, 0);
    person.standUp();
    person.model.position.set(spot.x + end * HOP_OFF, 0, spot.z);
  }
}
