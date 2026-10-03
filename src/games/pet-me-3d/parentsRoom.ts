// parentsRoom.ts – your parents' bedroom, behind the kitchen: a big bed for two, with a lamp on each side. Mia designed this game.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, PlaneGeometry, Vector3 } from "three";
import { DOOR_HALF, ROOM_WALL } from "./homeSpots";
import { BACK, HOUSE_RIGHT } from "./house";
import { makePart, paint } from "./paint";
import {
  LAMP_COLOUR, PARENTS_BEDCOVER_COLOUR, PARENTS_CARPET_COLOUR, PARENTS_WALL_COLOUR, WARDROBE_COLOUR,
} from "./settings";

const FLAT: number = -Math.PI / 2; // turns a flat thing so it lies on the floor
const WALL_HEIGHT: number = 1.6; // low walls, like the other rooms, so you can see over them
const ROOM_MIDDLE_X: number = (ROOM_WALL + HOUSE_RIGHT) / 2;
const ROOM_WIDE: number = HOUSE_RIGHT - ROOM_WALL; // from the kitchen wall to the side of the house
const ROOM_DEEP: number = -ROOM_WALL - BACK; // from the kitchen to the back of the house
const MATTRESS_TOP: number = 0.55;

export const PARENTS_DOOR_X: number = ROOM_WALL + 1.2; // the door in from the kitchen, just past the kitchen wall
export const PARENTS_BED_WIDTH: number = 2.8;
export const PARENTS_BED_LENGTH: number = 3.2;
export const PARENTS_BED_SPOT: Vector3 = new Vector3(ROOM_MIDDLE_X, 0, BACK + PARENTS_BED_LENGTH / 2 + 0.3); // against the back wall
const PILLOW_APART: number = 0.7; // each pillow is this far from the middle of the bed
// where your mum and dad lie at bedtime: their feet near the end of the bed, their heads on the pillows
export const MUM_LYING_SPOT: Vector3 = new Vector3(ROOM_MIDDLE_X - PILLOW_APART, MATTRESS_TOP + 0.3, PARENTS_BED_SPOT.z + 1);
export const DAD_LYING_SPOT: Vector3 = new Vector3(ROOM_MIDDLE_X + PILLOW_APART, MATTRESS_TOP + 0.3, PARENTS_BED_SPOT.z + 1);
export const PARENTS_LAMP_SPOTS: Vector3[] = [
  new Vector3(ROOM_MIDDLE_X - PARENTS_BED_WIDTH / 2 - 0.6, 0, BACK + 0.6),
  new Vector3(ROOM_MIDDLE_X + PARENTS_BED_WIDTH / 2 + 0.6, 0, BACK + 0.6),
];

// this makes the carpet on the floor
function makeCarpet(): Mesh {
  const carpet = new Mesh(new PlaneGeometry(ROOM_WIDE, ROOM_DEEP), paint(PARENTS_CARPET_COLOUR));
  carpet.rotation.x = FLAT;
  carpet.position.set(ROOM_MIDDLE_X, 0.005, BACK + ROOM_DEEP / 2);
  carpet.receiveShadow = true;
  return carpet;
}

// this makes the two walls: one next to the kitchen, with a doorway, and one next to your bedroom
function makeWalls(): Mesh[] {
  const doorEdge = PARENTS_DOOR_X + DOOR_HALF;
  const kitchenSide = HOUSE_RIGHT - doorEdge;
  return [
    makePart(new BoxGeometry(kitchenSide, WALL_HEIGHT, 0.2), PARENTS_WALL_COLOUR, doorEdge + kitchenSide / 2, WALL_HEIGHT / 2, -ROOM_WALL),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, ROOM_DEEP), PARENTS_WALL_COLOUR, ROOM_WALL, WALL_HEIGHT / 2, BACK + ROOM_DEEP / 2),
  ];
}

// this makes the big bed: a frame, a mattress, a blanket and two pillows
function makeBigBed(): Group {
  const bed = new Group();
  const pillowZ = -PARENTS_BED_LENGTH / 2 + 0.35;
  bed.add(
    makePart(new BoxGeometry(PARENTS_BED_WIDTH + 0.2, 0.35, PARENTS_BED_LENGTH + 0.2), WARDROBE_COLOUR, 0, 0.18, 0),
    makePart(new BoxGeometry(PARENTS_BED_WIDTH, 0.2, PARENTS_BED_LENGTH), "white", 0, 0.45, 0),
    makePart(new BoxGeometry(PARENTS_BED_WIDTH + 0.04, 0.06, 2), PARENTS_BEDCOVER_COLOUR, 0, MATTRESS_TOP, 0.5),
    makePart(new BoxGeometry(1, 0.18, 0.5), "white", -PILLOW_APART, MATTRESS_TOP + 0.08, pillowZ),
    makePart(new BoxGeometry(1, 0.18, 0.5), "white", PILLOW_APART, MATTRESS_TOP + 0.08, pillowZ),
  );
  bed.position.copy(PARENTS_BED_SPOT);
  return bed;
}

// this makes a little table with a lamp on it
function makeLamp(spot: Vector3): Group {
  const lamp = new Group();
  lamp.add(
    makePart(new BoxGeometry(0.6, 0.6, 0.6), WARDROBE_COLOUR, 0, 0.3, 0),
    makePart(new CylinderGeometry(0.04, 0.08, 0.5, 10), "white", 0, 0.85, 0),
    makePart(new ConeGeometry(0.28, 0.3, 20, 1, true), LAMP_COLOUR, 0, 1.2, 0),
  );
  lamp.position.copy(spot);
  return lamp;
}

// this makes the whole room
export function makeParentsRoom(): Group {
  const room = new Group();
  room.add(makeCarpet(), ...makeWalls(), makeBigBed(), ...PARENTS_LAMP_SPOTS.map(makeLamp));
  return room;
}
