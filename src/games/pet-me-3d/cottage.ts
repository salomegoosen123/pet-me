// cottage.ts – Ouma and Oupa's cottage: yellow walls with windows, a doorway you can walk through,
// a wooden floor, and a roof that lifts off when you go inside. Mia designed this game.
import { BoxGeometry, ConeGeometry, Group, Mesh, PlaneGeometry, Vector3 } from "three";
import { makePart, paint } from "./paint";
import { COTTAGE_COLOUR, COTTAGE_FLOOR_COLOUR, COTTAGE_ROOF_COLOUR } from "./settings";

export const COTTAGE_SPOT: Vector3 = new Vector3(0, 0, -9); // the middle of the cottage, in front of you when you arrive
const WIDE: number = 12;
const DEEP: number = 9;
const WALL_HEIGHT: number = 2.6;
const ROOF_HEIGHT: number = 2.4;
const DOOR_HALF: number = 1; // the doorway goes this far each side of the middle of the front wall
const DOOR_HEIGHT: number = 2;
const SQUARE_CORNERS: number = 4; // a cone with four sides is a pyramid
const TURN_TO_SQUARE: number = Math.PI / 4; // turns the pyramid so it lines up with the walls
const FLAT: number = -Math.PI / 2;
const POST_GAP: number = 0.8; // how far apart the bump spots go along the walls

// the edges of the cottage
export const COTTAGE_LEFT: number = COTTAGE_SPOT.x - WIDE / 2;
export const COTTAGE_RIGHT: number = COTTAGE_SPOT.x + WIDE / 2;
export const COTTAGE_BACK: number = COTTAGE_SPOT.z - DEEP / 2;
export const COTTAGE_FRONT: number = COTTAGE_SPOT.z + DEEP / 2;

// this says if a spot is inside the cottage
export function insideCottage(spot: Vector3): boolean {
  return spot.x > COTTAGE_LEFT && spot.x < COTTAGE_RIGHT && spot.z > COTTAGE_BACK && spot.z < COTTAGE_FRONT;
}

// this makes a wall from one spot to another along the front or the back, so tall
function wallAcross(fromX: number, toX: number, z: number, height: number, y: number): Mesh {
  return makePart(new BoxGeometry(toX - fromX, height, 0.2), COTTAGE_COLOUR, (fromX + toX) / 2, y, z);
}

// this makes the walls: the back, the two sides, and the front with a doorway and two windows
function makeWalls(): Mesh[] {
  const up = WALL_HEIGHT / 2;
  const middleZ = COTTAGE_SPOT.z;
  return [
    wallAcross(COTTAGE_LEFT, COTTAGE_RIGHT, COTTAGE_BACK, WALL_HEIGHT, up),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, DEEP), COTTAGE_COLOUR, COTTAGE_LEFT, up, middleZ),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, DEEP), COTTAGE_COLOUR, COTTAGE_RIGHT, up, middleZ),
    wallAcross(COTTAGE_LEFT, -DOOR_HALF, COTTAGE_FRONT, WALL_HEIGHT, up),
    wallAcross(DOOR_HALF, COTTAGE_RIGHT, COTTAGE_FRONT, WALL_HEIGHT, up),
    wallAcross(-DOOR_HALF, DOOR_HALF, COTTAGE_FRONT, WALL_HEIGHT - DOOR_HEIGHT, DOOR_HEIGHT + (WALL_HEIGHT - DOOR_HEIGHT) / 2),
    makePart(new BoxGeometry(1, 0.8, 0.05), "lightblue", -3.5, 1.5, COTTAGE_FRONT + 0.12),
    makePart(new BoxGeometry(1, 0.8, 0.05), "lightblue", 3.5, 1.5, COTTAGE_FRONT + 0.12),
  ];
}

// this makes the wooden floor inside
function makeFloor(): Mesh {
  const floor = new Mesh(new PlaneGeometry(WIDE, DEEP), paint(COTTAGE_FLOOR_COLOUR));
  floor.rotation.x = FLAT;
  floor.position.set(COTTAGE_SPOT.x, 0.01, COTTAGE_SPOT.z);
  floor.receiveShadow = true;
  return floor;
}

// this makes the cottage: the floor and the walls (the roof is separate, because it lifts off)
export function makeCottage(): Group {
  const cottage = new Group();
  cottage.add(makeFloor(), ...makeWalls());
  return cottage;
}

// this makes the pointy roof, sitting on top of the walls
export function makeCottageRoof(): Mesh {
  const roofShape = new ConeGeometry((WIDE / 2) * Math.SQRT2 + 0.3, ROOF_HEIGHT, SQUARE_CORNERS);
  const roof = makePart(roofShape, COTTAGE_ROOF_COLOUR, 0, 0, 0);
  roof.rotation.y = TURN_TO_SQUARE;
  roof.scale.set(1, 1, DEEP / WIDE);
  roof.position.set(COTTAGE_SPOT.x, WALL_HEIGHT + ROOF_HEIGHT / 2, COTTAGE_SPOT.z);
  return roof;
}

// this says spots all along the walls (but not the doorway), so you and your brother bump into them
export function cottagePosts(): Vector3[] {
  const posts: Vector3[] = [];
  for (let x = COTTAGE_LEFT; x <= COTTAGE_RIGHT; x += POST_GAP) {
    posts.push(new Vector3(x, 0, COTTAGE_BACK));
    if (Math.abs(x - COTTAGE_SPOT.x) > DOOR_HALF) posts.push(new Vector3(x, 0, COTTAGE_FRONT));
  }
  for (let z = COTTAGE_BACK; z <= COTTAGE_FRONT; z += POST_GAP) {
    posts.push(new Vector3(COTTAGE_LEFT, 0, z), new Vector3(COTTAGE_RIGHT, 0, z));
  }
  return posts;
}
