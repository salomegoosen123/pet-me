// SandcastleRide.ts – building a sandcastle with your brother: you both sit down by it, and it grows. Mia designed this game.
import { Vector3 } from "three";
import type { BeachFamily } from "./beachFamily";
import type { Person3D } from "./Person3D";
import type { Ride } from "./ride";
import { SANDCASTLE_SPOT } from "./Sandcastle3D";
import type { Sandcastle3D } from "./Sandcastle3D";

const ON_THE_SAND: number = 0.02; // how high you sit on the sand
const YOUR_SIDE: Vector3 = SANDCASTLE_SPOT.clone().add(new Vector3(0, 0, 1)); // you sit in front of the castle
const HIS_SIDE: Vector3 = SANDCASTLE_SPOT.clone().add(new Vector3(0, 0, -1)); // your brother sits behind it
const STAND_UP_TO: Vector3 = YOUR_SIDE.clone().add(new Vector3(0, 0, 0.5)); // where you stand when it's finished
const FACING_THE_CASTLE_FROM_THE_FRONT: number = Math.PI;
const FACING_THE_CASTLE_FROM_THE_BACK: number = 0;

// a SandcastleRide sits you and your brother by the castle, builds it, then gets you both up
export class SandcastleRide implements Ride {
  castle: Sandcastle3D;
  family: BeachFamily;

  constructor(castle: Sandcastle3D, family: BeachFamily) {
    this.castle = castle;
    this.family = family;
  }

  // this sits you and your brother down, one on each side of the castle
  begin(you: Person3D): void {
    you.sitDown(YOUR_SIDE, FACING_THE_CASTLE_FROM_THE_FRONT, ON_THE_SAND);
    this.family.brother.sitDown(HIS_SIDE, FACING_THE_CASTLE_FROM_THE_BACK, ON_THE_SAND);
  }

  // this builds the castle while you both sit there. When it's finished you get up, and he goes back to his towel.
  // It says if you're still building
  move(you: Person3D, _now: number, seconds: number): boolean {
    if (!this.castle.grow(seconds)) return true;
    you.standUp();
    you.model.position.copy(STAND_UP_TO);
    this.family.brotherBackToHisTowel();
    return false;
  }
}
