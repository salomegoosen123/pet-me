// cottageTable.ts – the table in Ouma and Oupa's cottage, with four chairs round it. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, Vector3 } from "three";
import type { Chair } from "./kitchen";
import { makePart } from "./paint";
import { CHAIR_COLOUR, TABLE_COLOUR } from "./settings";

export const COTTAGE_TABLE_SPOT: Vector3 = new Vector3(1.5, 0, -10.3); // between the kitchen and the fireplace
const TABLE_WIDE: number = 1.6;
const TABLE_DEEP: number = 1.1;
const TABLE_HEIGHT: number = 0.75;
const SEAT_HEIGHT: number = 0.5;

// the four chairs, two on each side of the table, facing it
export const COTTAGE_CHAIRS: Chair[] = [
  { spot: COTTAGE_TABLE_SPOT.clone().add(new Vector3(-0.4, 0, -1)), facing: 0 },
  { spot: COTTAGE_TABLE_SPOT.clone().add(new Vector3(0.4, 0, -1)), facing: 0 },
  { spot: COTTAGE_TABLE_SPOT.clone().add(new Vector3(-0.4, 0, 1)), facing: Math.PI },
  { spot: COTTAGE_TABLE_SPOT.clone().add(new Vector3(0.4, 0, 1)), facing: Math.PI },
];

// this makes the table: a top and four legs
function makeTable(): Group {
  const table = new Group();
  table.add(makePart(new BoxGeometry(TABLE_WIDE, 0.1, TABLE_DEEP), TABLE_COLOUR, 0, TABLE_HEIGHT, 0));
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.45, 0.45]) table.add(makePart(new CylinderGeometry(0.05, 0.05, TABLE_HEIGHT - 0.05, 10), TABLE_COLOUR, x, 0.35, z));
  }
  table.position.copy(COTTAGE_TABLE_SPOT);
  return table;
}

// this makes one chair: a seat, a back, and four legs
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
  whole.position.copy(chair.spot);
  return whole;
}

// this makes the table and its four chairs
export function makeCottageTable(): Group {
  const dining = new Group();
  dining.add(makeTable(), ...COTTAGE_CHAIRS.map(makeChair));
  return dining;
}

// this says spots on the table, so you and your brother bump into it (you can squeeze past the chairs)
export function cottageTablePosts(): Vector3[] {
  return [-0.6, 0, 0.6].map(function alongTheTable(along: number): Vector3 {
    return COTTAGE_TABLE_SPOT.clone().add(new Vector3(along, 0, 0));
  });
}
