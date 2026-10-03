// walls.ts – every wall and fence in the 3D home, as lines on the floor, so Saydee can bump into them. Mia designed this game.
import { DOOR_HALF, ROOM_WALL } from "./homeSpots";
import { BACK, BACK_DOOR_X, FRONT, HOUSE_LEFT, HOUSE_RIGHT } from "./house";
import { PARENTS_DOOR_X } from "./parentsRoom";
import { PLAYROOM_DOOR_Z } from "./playRoom";
import { YARD_END } from "./yard";

// a wall on the floor: a straight line from one end to the other
export interface Wall {
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
}

// this makes a wall running across (left to right), at one z
function across(fromX: number, toX: number, z: number): Wall {
  return { fromX, fromZ: z, toX, toZ: z };
}

// this makes a wall running front to back, at one x
function frontToBack(x: number, fromZ: number, toZ: number): Wall {
  return { fromX: x, fromZ, toX: x, toZ };
}

// the kitchen, bathroom and bedroom walls, each with a door in the middle,
// your parents' room walls, with a door in from the kitchen,
// and the play room walls, with a door in from your bedroom
const ROOM_WALLS: Wall[] = [
  frontToBack(ROOM_WALL, -ROOM_WALL, -DOOR_HALF),
  frontToBack(ROOM_WALL, DOOR_HALF, ROOM_WALL),
  frontToBack(-ROOM_WALL, -ROOM_WALL, -DOOR_HALF),
  frontToBack(-ROOM_WALL, DOOR_HALF, ROOM_WALL),
  across(-ROOM_WALL, -DOOR_HALF, -ROOM_WALL),
  across(DOOR_HALF, ROOM_WALL, -ROOM_WALL),
  across(PARENTS_DOOR_X + DOOR_HALF, HOUSE_RIGHT, -ROOM_WALL),
  frontToBack(ROOM_WALL, BACK, -ROOM_WALL),
  across(HOUSE_LEFT, -ROOM_WALL, -ROOM_WALL),
  frontToBack(-ROOM_WALL, BACK, PLAYROOM_DOOR_Z - DOOR_HALF),
  frontToBack(-ROOM_WALL, PLAYROOM_DOOR_Z + DOOR_HALF, -ROOM_WALL),
];

// the outside walls, with the front door and the back door
const OUTSIDE_WALLS: Wall[] = [
  across(HOUSE_LEFT, BACK_DOOR_X - DOOR_HALF, BACK),
  across(BACK_DOOR_X + DOOR_HALF, HOUSE_RIGHT, BACK),
  across(HOUSE_LEFT, -DOOR_HALF, FRONT),
  across(DOOR_HALF, HOUSE_RIGHT, FRONT),
  frontToBack(HOUSE_LEFT, BACK, FRONT),
  frontToBack(HOUSE_RIGHT, BACK, FRONT),
];

// the fence round the back yard
const FENCE: Wall[] = [
  frontToBack(HOUSE_LEFT, YARD_END, BACK),
  frontToBack(HOUSE_RIGHT, YARD_END, BACK),
  across(HOUSE_LEFT, HOUSE_RIGHT, YARD_END),
];

// every wall and fence at home
export const HOME_WALLS: Wall[] = [...ROOM_WALLS, ...OUTSIDE_WALLS, ...FENCE];
