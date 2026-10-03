// Seesaw3D.ts – the seesaw in the park playground: a stand, and a long board that tips up and down. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, Vector3 } from "three";
import { makePart } from "./paint";
import { SEESAW_COLOUR } from "./settings";
import { FRAME_COLOUR } from "./Swings3D";

export const SEESAW_SPOT: Vector3 = new Vector3(3.3, 0, -4); // on your right when you arrive at the park
export const BROTHER_WAITS: Vector3 = SEESAW_SPOT.clone().add(new Vector3(0, 0, 1)); // your brother waits here for a go
const SEESAW_LENGTH: number = 3;
const SEESAW_MIDDLE: number = 0.55; // how high the middle of the seesaw is
export const SEESAW_TIP: number = 0.35; // how far it tips, so one end touches the grass
const SEAT_OUT: number = 1.35; // how far from the middle you sit, just behind the handle

// the seesaw: a stand in the middle, and a long board with a handle at each end
export class Seesaw3D {
  model: Group;
  board: Group;

  constructor() {
    this.model = new Group();
    this.board = new Group();
    this.build();
    this.tipTo(SEESAW_TIP);
  }

  // this makes the stand and the board
  build(): void {
    this.model.add(makePart(new BoxGeometry(0.3, SEESAW_MIDDLE, 0.4), FRAME_COLOUR, 0, SEESAW_MIDDLE / 2, 0));
    this.board.add(makePart(new BoxGeometry(SEESAW_LENGTH, 0.08, 0.35), SEESAW_COLOUR, 0, 0, 0));
    for (const x of [-1.2, 1.2]) this.board.add(makePart(new CylinderGeometry(0.03, 0.03, 0.35, 6), FRAME_COLOUR, x, 0.2, 0));
    this.board.position.y = SEESAW_MIDDLE;
    this.model.add(this.board);
    this.model.position.copy(SEESAW_SPOT);
  }

  // this tips the board: more than 0 lifts the right end up, less than 0 lifts the left end up
  tipTo(angle: number): void {
    this.board.rotation.z = angle;
  }

  // this says where someone sits on one end (-1 is the left end, 1 is the right end), when the board is tipped
  seatSpot(end: number, angle: number): Vector3 {
    const out = new Vector3(end * SEAT_OUT * Math.cos(angle), SEESAW_MIDDLE + end * SEAT_OUT * Math.sin(angle), 0);
    return SEESAW_SPOT.clone().add(out);
  }

  // this says which way someone on an end faces: towards the middle
  facingFrom(end: number): number {
    return -end * Math.PI / 2;
  }

  // this says which end is closer to you: -1 is the left end, 1 is the right end
  nearestEnd(spot: Vector3): number {
    return spot.x < SEESAW_SPOT.x ? -1 : 1;
  }
}
