// house.ts – the outside walls and the roof of Saydee's 3D home. Mia designed this game.
import { BoxGeometry, ConeGeometry, Group, Mesh } from "three";
import type { Vector3 } from "three";
import { DOOR_HALF, spread } from "./homeSpots";
import { makePart, paint } from "./paint";
import { HOUSE_WALL_COLOUR, HOUSE_WALL_HEIGHT, ROOF_COLOUR, ROOF_HEIGHT } from "./settings";

const WALL_HEIGHT: number = HOUSE_WALL_HEIGHT;
const LEFT: number = spread(-10); // the house goes from here...
const RIGHT: number = spread(10); // ...to here
export const BACK: number = spread(-10); // and from the back wall, with a door out to the yard...
export const FRONT: number = spread(5); // ...to the front wall, with the front door in the middle
export const BACK_DOOR_X: number = spread(-1.7); // the back door is in your bedroom, between your wardrobe and your bed
export const HOUSE_LEFT: number = LEFT;
export const HOUSE_RIGHT: number = RIGHT;
const ROOF_DOWN: number = WALL_HEIGHT + ROOF_HEIGHT / 2; // where the roof sits on the walls
const ROOF_UP: number = ROOF_DOWN + 8; // where it floats when it lifts off
const ROOF_SPEED: number = 12; // how fast it lifts off and comes down
const SQUARE_CORNERS: number = 4; // a cone with four sides is a pyramid
const TURN_TO_SQUARE: number = Math.PI / 4; // turns the pyramid so it lines up with the walls

// this says if a spot is inside the house
export function insideHouse(spot: Vector3): boolean {
  return spot.x > LEFT && spot.x < RIGHT && spot.z > BACK && spot.z < FRONT;
}

// this makes a straight piece of wall along the front or the back, from one side to the other
function wallAlong(fromX: number, toX: number, z: number): Mesh {
  const length = toX - fromX;
  return makePart(new BoxGeometry(length, WALL_HEIGHT, 0.2), HOUSE_WALL_COLOUR, fromX + length / 2, WALL_HEIGHT / 2, z);
}

// this makes the four outside walls, with a front door, and a back door out to the yard
export function makeOuterWalls(): Mesh[] {
  const depth = FRONT - BACK;
  const middleZ = (FRONT + BACK) / 2;
  const up = WALL_HEIGHT / 2;
  const backLeft = wallAlong(LEFT, BACK_DOOR_X - DOOR_HALF, BACK);
  const backRight = wallAlong(BACK_DOOR_X + DOOR_HALF, RIGHT, BACK);
  const left = makePart(new BoxGeometry(0.2, WALL_HEIGHT, depth), HOUSE_WALL_COLOUR, LEFT, up, middleZ);
  const right = makePart(new BoxGeometry(0.2, WALL_HEIGHT, depth), HOUSE_WALL_COLOUR, RIGHT, up, middleZ);
  const frontLeft = wallAlong(LEFT, -DOOR_HALF, FRONT);
  const frontRight = wallAlong(DOOR_HALF, RIGHT, FRONT);
  const walls = [backLeft, backRight, left, right, frontLeft, frontRight];
  for (const wall of walls) wall.receiveShadow = true;
  return walls;
}

// a Roof3D is the pointy roof: it sits on the house while you're outside, and lifts off when you go in
export class Roof3D {
  model: Group;

  constructor() {
    this.model = new Group();
    const width = RIGHT - LEFT + 1;
    const depth = FRONT - BACK + 1;
    const pyramid = new Mesh(new ConeGeometry(width / Math.SQRT2, ROOF_HEIGHT, SQUARE_CORNERS), paint(ROOF_COLOUR));
    pyramid.rotation.y = TURN_TO_SQUARE;
    pyramid.castShadow = true;
    this.model.add(pyramid);
    this.model.scale.set(1, 1, depth / width);
    this.model.position.set(0, ROOF_UP, (FRONT + BACK) / 2);
    this.model.visible = false;
  }

  // this brings the roof down onto the house, or lifts it off
  settle(onTheHouse: boolean, seconds: number): void {
    const goal = onTheHouse ? ROOF_DOWN : ROOF_UP;
    const step = ROOF_SPEED * seconds;
    const y = this.model.position.y;
    this.model.position.y = Math.abs(goal - y) <= step ? goal : y + Math.sign(goal - y) * step;
    this.model.visible = this.model.position.y < ROOF_UP;
  }
}
