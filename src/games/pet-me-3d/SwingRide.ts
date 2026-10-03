// SwingRide.ts – a go on the swings: you sit on a seat and swing higher and higher,
// and your brother swings on the seat next to you. Mia designed this game.
import type { Keys } from "../../game-kit/useKeys";
import type { Person3D } from "./Person3D";
import type { Ride } from "./ride";
import { SWING_HIGH, SWING_SPEED } from "./settings";
import type { Swings3D } from "./Swings3D";
import { anyArrowDown } from "./walking";

const GET_GOING_SECONDS: number = 3; // how long you take to swing all the way up high
const ON_THE_SEAT: number = 0.04; // how far above the seat you sit
const FACING_FORWARD: number = 0;
const HOP_OFF: number = 0.9; // how far in front of the swing you land when you get off
const SETTLE_SECONDS: number = 0.5; // the arrow keys can't get you off until you've sat down
const OTHER_WAY: number = Math.PI; // your brother swings the other way from you: when you go forward, he goes back

// a SwingRide sits you on the closer seat and your brother on the other one, and swings you both,
// until you press an arrow key to get off
export class SwingRide implements Ride {
  swings: Swings3D;
  brother: Person3D;
  seat: number; // which seat you are on (your brother is on the other one)
  time: number; // how long you have been swinging

  constructor(swings: Swings3D, brother: Person3D) {
    this.swings = swings;
    this.brother = brother;
    this.seat = 0;
    this.time = 0;
  }

  // this says which seat your brother is on: the one you're not on
  brothersSeat(): number {
    return 1 - this.seat;
  }

  // this sits you on the seat closer to you
  begin(you: Person3D): void {
    this.seat = this.swings.nearestSeat(you.model.position);
    this.time = 0;
  }

  // this swings you both back and forth, a little higher each time. It says if you're still on
  move(you: Person3D, now: number, seconds: number, keys: Keys): boolean {
    this.time = this.time + seconds;
    if (this.time > SETTLE_SECONDS && anyArrowDown(keys)) return this.getOff(you);
    const high = SWING_HIGH * Math.min(1, this.time / GET_GOING_SECONDS);
    this.swing(you, this.seat, high * Math.sin(now * SWING_SPEED));
    this.swing(this.brother, this.brothersSeat(), high * Math.sin(now * SWING_SPEED + OTHER_WAY));
    return true;
  }

  // this swings one seat out, with someone sitting on it
  swing(person: Person3D, seat: number, angle: number): void {
    this.swings.swingTo(seat, angle);
    const spot = this.swings.seatSpot(seat, angle);
    person.sitDown(spot, FACING_FORWARD, spot.y + ON_THE_SEAT);
  }

  // this stops the seats, and hops you both off, each in front of your own seat
  getOff(you: Person3D): boolean {
    this.hopOff(you, this.seat);
    this.hopOff(this.brother, this.brothersSeat());
    return false;
  }

  // this stops one seat and hops someone off in front of it
  hopOff(person: Person3D, seat: number): void {
    this.swings.swingTo(seat, 0);
    const spot = this.swings.seatSpot(seat, 0);
    person.standUp();
    person.model.position.set(spot.x, 0, spot.z + HOP_OFF);
  }
}
