// Swings3D.ts – the swings in the park playground: a bar on A-shaped legs, and two seats that really swing. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, Vector3 } from "three";
import type { Mesh } from "three";
import { makePart } from "./paint";
import { SWING_COLOUR } from "./settings";

export const FRAME_COLOUR: string = "slategray"; // the colour of the metal poles in the playground
const SIDEWAYS: number = Math.PI / 2; // turns a pole to lie flat, from side to side
export const SWINGS_SPOT: Vector3 = new Vector3(-3.2, 0, -4); // on your left when you arrive at the park
export const SWING_TOP: number = 2.2; // how high the swing bar is
const SWING_HALF: number = 1.2; // the swing frame goes this far each way from its middle
const SWING_FEET: number = 0.8; // how far out the swing legs stand at the bottom
const ROPE_LENGTH: number = SWING_TOP - 0.5; // the seats hang this far below the bar
const SEAT_SIDES: number[] = [-0.6, 0.6]; // where the two seats hang along the bar

// this makes a pole lying flat, from side to side
export function makeCrossPole(length: number, x: number, y: number, z: number): Mesh {
  const pole = makePart(new CylinderGeometry(0.05, 0.05, length, 8), FRAME_COLOUR, x, y, z);
  pole.rotation.z = SIDEWAYS;
  return pole;
}

// this makes one swing seat, hanging on two ropes from the bar
function makeSwingSeat(x: number): Group {
  const seat = new Group();
  seat.add(
    makePart(new CylinderGeometry(0.015, 0.015, ROPE_LENGTH, 6), "white", -0.22, -ROPE_LENGTH / 2, 0),
    makePart(new CylinderGeometry(0.015, 0.015, ROPE_LENGTH, 6), "white", 0.22, -ROPE_LENGTH / 2, 0),
    makePart(new BoxGeometry(0.55, 0.06, 0.28), SWING_COLOUR, 0, -ROPE_LENGTH, 0),
  );
  seat.position.set(x, SWING_TOP, 0);
  return seat;
}

// the swings: a frame, and two seats that can swing back and forth
export class Swings3D {
  model: Group;
  seats: Group[];

  constructor() {
    this.model = new Group();
    this.seats = SEAT_SIDES.map(makeSwingSeat);
    this.build();
  }

  // this makes the bar on its two A-shaped legs, and hangs the seats from it
  build(): void {
    const legLength = Math.hypot(SWING_TOP, SWING_FEET);
    const lean = Math.atan2(SWING_FEET, SWING_TOP);
    this.model.add(makeCrossPole(SWING_HALF * 2 + 0.2, 0, SWING_TOP, 0));
    for (const x of [-SWING_HALF, SWING_HALF]) {
      for (const side of [-1, 1]) {
        const leg = makePart(new CylinderGeometry(0.05, 0.05, legLength, 8), FRAME_COLOUR, x, SWING_TOP / 2, side * SWING_FEET / 2);
        leg.rotation.x = -side * lean;
        this.model.add(leg);
      }
    }
    this.model.add(...this.seats);
    this.model.position.copy(SWINGS_SPOT);
  }

  // this swings one seat out (0 means it hangs straight down)
  swingTo(seat: number, angle: number): void {
    this.seats[seat].rotation.x = angle;
  }

  // this says where a seat is, when it's swung out that far
  seatSpot(seat: number, angle: number): Vector3 {
    const out = new Vector3(SEAT_SIDES[seat], SWING_TOP - ROPE_LENGTH * Math.cos(angle), -ROPE_LENGTH * Math.sin(angle));
    return SWINGS_SPOT.clone().add(out);
  }

  // this says which seat is closer to you: 0 is the left one, 1 is the right one
  nearestSeat(spot: Vector3): number {
    return spot.x < SWINGS_SPOT.x ? 0 : 1;
  }
}

// this says where the swing legs stand, so you and Saydee bump into them
export function swingsPosts(): Vector3[] {
  const posts: Vector3[] = [];
  for (const x of [-SWING_HALF, SWING_HALF]) {
    for (const z of [-SWING_FEET, SWING_FEET]) posts.push(SWINGS_SPOT.clone().add(new Vector3(x, 0, z)));
  }
  return posts;
}
