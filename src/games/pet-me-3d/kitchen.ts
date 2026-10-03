// kitchen.ts – the kitchen in Saydee's 3D home: counters, a stove, a fridge and a table. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, Vector3 } from "three";
import { makeTiles, makeWallWithDoor } from "./furniture";
import { ROOM_WALL, spreadSpot } from "./homeSpots";
import { makePart } from "./paint";
import {
  CHAIR_COLOUR, COUNTER_COLOUR, COUNTER_TOP_COLOUR, FRIDGE_COLOUR, KITCHEN_FLOOR_COLOUR, KITCHEN_WALL_COLOUR,
  TABLE_COLOUR,
} from "./settings";

// where each thing stands in the kitchen
export const COUNTER_SPOT: Vector3 = spreadSpot(7, -3.4);
export const FRIDGE_SPOT: Vector3 = spreadSpot(9.4, -2.2);
export const TABLE_SPOT: Vector3 = spreadSpot(7.8, 2.2);

// a place to sit, like a chair at the table: where it is, and which way you face when you sit on it
export interface Chair {
  spot: Vector3;
  facing: number;
  seatTop?: number; // how high the seat is, for low chairs like the ones at school (grown-up chairs don't say)
}

// the four chairs, two on each side of the table: one each for you, your brother, Mum and Dad
export const CHAIRS: Chair[] = [
  { spot: TABLE_SPOT.clone().add(new Vector3(-0.4, 0, -1)), facing: 0 },
  { spot: TABLE_SPOT.clone().add(new Vector3(0.4, 0, -1)), facing: 0 },
  { spot: TABLE_SPOT.clone().add(new Vector3(-0.4, 0, 1)), facing: Math.PI },
  { spot: TABLE_SPOT.clone().add(new Vector3(0.4, 0, 1)), facing: Math.PI },
];

// where the plates go on the table: one in front of each chair
export const PLATE_SPOTS: Vector3[] = [
  TABLE_SPOT.clone().add(new Vector3(-0.4, 0.82, -0.3)),
  TABLE_SPOT.clone().add(new Vector3(0.4, 0.82, -0.3)),
  TABLE_SPOT.clone().add(new Vector3(-0.4, 0.82, 0.3)),
  TABLE_SPOT.clone().add(new Vector3(0.4, 0.82, 0.3)),
];
const SEAT_HEIGHT: number = 0.5;
const FRIDGE_FRONT: Vector3 = FRIDGE_SPOT.clone().add(new Vector3(-1, 0, 0)); // where you stand to open the fridge
const FRIDGE_REACH: number = 0.8; // walk this close to the fridge to get something out

// this puts a group of parts in its spot
function placed(parts: Group, spot: Vector3): Group {
  parts.position.copy(spot);
  return parts;
}

// this makes the counter, with a stove on top
function makeCounter(): Group {
  const counter = new Group();
  counter.add(
    makePart(new BoxGeometry(5, 0.9, 0.7), COUNTER_COLOUR, 0, 0.45, 0),
    makePart(new BoxGeometry(5.1, 0.08, 0.8), COUNTER_TOP_COLOUR, 0, 0.94, 0),
    makePart(new CylinderGeometry(0.15, 0.15, 0.03, 20), "black", 1.1, 0.99, 0),
    makePart(new CylinderGeometry(0.15, 0.15, 0.03, 20), "black", 1.5, 0.99, 0),
  );
  return placed(counter, COUNTER_SPOT);
}

// this makes the tall fridge, with a handle
function makeFridge(): Group {
  const fridge = new Group();
  fridge.add(
    makePart(new BoxGeometry(1.1, 2.2, 0.9), FRIDGE_COLOUR, 0, 1.1, 0),
    makePart(new BoxGeometry(0.06, 0.6, 0.06), "dimgray", -0.58, 1.3, 0.3),
  );
  return placed(fridge, FRIDGE_SPOT);
}

// this makes the table: a top and four legs
function makeTable(): Group {
  const table = new Group();
  table.add(makePart(new BoxGeometry(1.6, 0.1, 1.1), TABLE_COLOUR, 0, 0.75, 0));
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.45, 0.45]) table.add(makePart(new CylinderGeometry(0.05, 0.05, 0.7, 10), TABLE_COLOUR, x, 0.35, z));
  }
  return placed(table, TABLE_SPOT);
}

// this makes one chair: a seat, four legs, and a back
function makeChair(chair: Chair): Group {
  const whole = new Group();
  whole.add(
    makePart(new BoxGeometry(0.6, 0.08, 0.6), CHAIR_COLOUR, 0, SEAT_HEIGHT, 0),
    makePart(new BoxGeometry(0.6, 0.7, 0.08), CHAIR_COLOUR, 0, SEAT_HEIGHT + 0.35, -0.28),
  );
  for (const x of [-0.25, 0.25]) {
    for (const z of [-0.25, 0.25]) whole.add(makePart(new CylinderGeometry(0.04, 0.04, SEAT_HEIGHT, 8), CHAIR_COLOUR, x, SEAT_HEIGHT / 2, z));
  }
  whole.rotation.y = chair.facing;
  return placed(whole, chair.spot);
}

// this says if you are standing at the fridge
export function atFridge(spot: Vector3): boolean {
  return Math.hypot(spot.x - FRIDGE_FRONT.x, spot.z - FRIDGE_FRONT.z) < FRIDGE_REACH;
}

// this makes the whole kitchen
export function makeKitchen(): Group {
  const kitchen = new Group();
  kitchen.add(makeTiles(ROOM_WALL, 1, KITCHEN_FLOOR_COLOUR), ...makeWallWithDoor(ROOM_WALL, KITCHEN_WALL_COLOUR));
  kitchen.add(makeCounter(), makeFridge(), makeTable(), ...CHAIRS.map(makeChair));
  kitchen.traverse(function catchShadows(thing): void {
    thing.receiveShadow = true;
  });
  return kitchen;
}
