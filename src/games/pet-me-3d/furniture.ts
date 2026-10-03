// furniture.ts – the floor, Saydee's bed, and the walls and tiles for each room, in 3D. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Mesh, PlaneGeometry, TorusGeometry } from "three";
import { BED_TOP, DOG_BED_MIDDLE, DOG_BED_SIZE, DOOR_HALF, spread } from "./homeSpots";
import { makePart, paint } from "./paint";
import { BED_COLOUR, FLOOR_COLOUR } from "./settings";

const FLOOR_SIZE: number = spread(20) + 10; // the floor reaches a bit past the house, all round
const FLAT: number = -Math.PI / 2; // turns a flat thing so it lies on the floor
const WALL_HEIGHT: number = 1.6; // low walls, so you can still see over them
const WALL_LENGTH: number = spread(4); // each room wall goes this far from the middle, both ways
const ROOM_WIDTH: number = spread(6); // how wide the kitchen, the bathroom and the bedroom are

// this makes the floor
export function makeFloor(): Mesh {
  const floor = new Mesh(new PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE), paint(FLOOR_COLOUR));
  floor.rotation.x = FLAT;
  floor.receiveShadow = true;
  return floor;
}

// this makes Saydee's round bed: a soft cushion with a puffy edge
export function makeBed(): Mesh {
  const cushion = new Mesh(new CylinderGeometry(1.4, 1.5, BED_TOP, 48), paint(BED_COLOUR));
  cushion.position.y = BED_TOP / 2;
  cushion.receiveShadow = true;
  const edge = new Mesh(new TorusGeometry(1.4, 0.35, 24, 64), paint(BED_COLOUR));
  edge.rotation.x = FLAT;
  edge.position.y = 0.2;
  edge.castShadow = true;
  edge.receiveShadow = true;
  cushion.add(edge);
  cushion.position.x = DOG_BED_MIDDLE.x;
  cushion.position.z = DOG_BED_MIDDLE.z;
  cushion.scale.set(DOG_BED_SIZE, 1, DOG_BED_SIZE);
  return cushion;
}

// this makes the tiles on a room's floor, in the room's colour
export function makeTiles(wallAt: number, side: 1 | -1, colour: string): Mesh {
  const tiles = new Mesh(new PlaneGeometry(ROOM_WIDTH, WALL_LENGTH * 2), paint(colour));
  tiles.rotation.x = FLAT;
  tiles.position.set(wallAt + (side * ROOM_WIDTH) / 2, 0.005, 0);
  tiles.receiveShadow = true;
  return tiles;
}

// this makes a wall between two rooms, with a door in the middle
export function makeWallWithDoor(wallAt: number, colour: string): Mesh[] {
  const length = WALL_LENGTH - DOOR_HALF;
  const middle = DOOR_HALF + length / 2;
  const back = makePart(new BoxGeometry(0.2, WALL_HEIGHT, length), colour, wallAt, WALL_HEIGHT / 2, -middle);
  const front = makePart(new BoxGeometry(0.2, WALL_HEIGHT, length), colour, wallAt, WALL_HEIGHT / 2, middle);
  return [back, front];
}
