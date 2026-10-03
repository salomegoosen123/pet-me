// doors.ts – the doors in Saydee's 3D home, which swing open when you or Saydee walk up. Mia designed this game.
import { BoxGeometry, Group, SphereGeometry, Vector3 } from "three";
import { DOOR_HALF, ROOM_WALL } from "./homeSpots";
import { BACK, BACK_DOOR_X, FRONT } from "./house";
import { makePart } from "./paint";
import { PARENTS_DOOR_X } from "./parentsRoom";
import { PLAYROOM_DOOR_Z } from "./playRoom";
import { DOOR_COLOUR, DOOR_OPEN_DISTANCE, DOOR_SPEED } from "./settings";

const QUARTER_TURN: number = Math.PI / 2; // a door swings open a quarter of the way round
const INSIDE_DOOR_HEIGHT: number = 1.5; // doors between rooms, a bit lower than the room walls
const OUTSIDE_DOOR_HEIGHT: number = 2.3; // the front door and the back door
const DOOR_THICKNESS: number = 0.08;

// a Door3D is a door on a hinge at one side of a doorway
export class Door3D {
  model: Group; // the hinge: the door swings round this
  middle: Vector3; // the middle of the doorway
  openAngle: number; // how far round it turns when it's open, and which way

  constructor(middle: Vector3, across: boolean, height: number, openAngle: number) {
    this.model = new Group();
    this.middle = middle;
    this.openAngle = openAngle;
    const width = DOOR_HALF * 2 - 0.05;
    const panelShape = across ? new BoxGeometry(width, height, DOOR_THICKNESS) : new BoxGeometry(DOOR_THICKNESS, height, width);
    const panel = across
      ? makePart(panelShape, DOOR_COLOUR, DOOR_HALF, height / 2, 0)
      : makePart(panelShape, DOOR_COLOUR, 0, height / 2, DOOR_HALF);
    const handle = across
      ? makePart(new SphereGeometry(0.06, 10, 8), "gold", DOOR_HALF * 1.7, height / 2, 0.08)
      : makePart(new SphereGeometry(0.06, 10, 8), "gold", 0.08, height / 2, DOOR_HALF * 1.7);
    this.model.add(panel, handle);
    const hinge = across ? new Vector3(-DOOR_HALF, 0, 0) : new Vector3(0, 0, -DOOR_HALF);
    this.model.position.copy(middle).add(hinge);
  }

  // this says if someone is near enough for the door to open
  someoneNear(spots: Vector3[]): boolean {
    for (const spot of spots) {
      if (Math.hypot(spot.x - this.middle.x, spot.z - this.middle.z) < DOOR_OPEN_DISTANCE) return true;
    }
    return false;
  }

  // this swings the door a little way open or shut
  swing(open: boolean, seconds: number): void {
    const goal = open ? this.openAngle : 0;
    const now = this.model.rotation.y;
    const step = DOOR_SPEED * seconds;
    this.model.rotation.y = Math.abs(goal - now) <= step ? goal : now + Math.sign(goal - now) * step;
  }
}

// this makes every door in the house
export function makeDoors(): Door3D[] {
  return [
    new Door3D(new Vector3(ROOM_WALL, 0, 0), false, INSIDE_DOOR_HEIGHT, QUARTER_TURN), // into the kitchen
    new Door3D(new Vector3(-ROOM_WALL, 0, 0), false, INSIDE_DOOR_HEIGHT, -QUARTER_TURN), // into the bathroom
    new Door3D(new Vector3(0, 0, -ROOM_WALL), true, INSIDE_DOOR_HEIGHT, QUARTER_TURN), // into your bedroom
    new Door3D(new Vector3(0, 0, FRONT), true, OUTSIDE_DOOR_HEIGHT, QUARTER_TURN), // the front door
    new Door3D(new Vector3(BACK_DOOR_X, 0, BACK), true, OUTSIDE_DOOR_HEIGHT, QUARTER_TURN), // the back door
    new Door3D(new Vector3(PARENTS_DOOR_X, 0, -ROOM_WALL), true, INSIDE_DOOR_HEIGHT, QUARTER_TURN), // into your parents' room
    new Door3D(new Vector3(-ROOM_WALL, 0, PLAYROOM_DOOR_Z), false, INSIDE_DOOR_HEIGHT, -QUARTER_TURN), // into the play room
  ];
}
