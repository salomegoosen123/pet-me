// seats.ts – every place you can sit: the kitchen chairs, the sofa, and the free chairs at school. Mia designed this game.
import type { Vector3 } from "three";
import { CHAIRS } from "./kitchen";
import type { Chair } from "./kitchen";
import { SOFA_SEATS } from "./livingRoom";
import { FREE_SCHOOL_SEATS } from "./schoolBuilding";

const ALL_SEATS: Chair[] = [...CHAIRS, ...SOFA_SEATS, ...FREE_SCHOOL_SEATS];
const SIT_DISTANCE: number = 1; // walk this close to a seat and you sit on it
const ON_IT: number = 0.2; // this close to a seat counts as sitting on it

// this says which seat you have walked up to, if any
export function seatUnder(spot: Vector3): Chair | null {
  for (const seat of ALL_SEATS) {
    if (Math.hypot(spot.x - seat.spot.x, spot.z - seat.spot.z) < SIT_DISTANCE) return seat;
  }
  return null;
}

// this finds the seat closest to you
export function nearestSeat(spot: Vector3): Chair {
  let closest = ALL_SEATS[0];
  for (const seat of ALL_SEATS) {
    if (seat.spot.distanceTo(spot) < closest.spot.distanceTo(spot)) closest = seat;
  }
  return closest;
}

// this says if you are sitting on the sofa (so the TV can come on)
export function onTheSofa(spot: Vector3): boolean {
  for (const seat of SOFA_SEATS) {
    if (Math.hypot(spot.x - seat.spot.x, spot.z - seat.spot.z) < ON_IT) return true;
  }
  return false;
}
