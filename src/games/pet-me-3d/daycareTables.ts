// daycareTables.ts – the two little tables in the daycare, with four little chairs round each one. Mia designed this game.
import { BoxGeometry, Group, Vector3 } from "three";
import { blockAround } from "./bumping";
import type { Block } from "./bumping";
import { makePart } from "./paint";
import { DAYCARE_CHAIR_COLOURS, DAYCARE_TABLE_COLOUR } from "./settings";

const TABLES: Vector3[] = [new Vector3(-1.6, 0, 0.6), new Vector3(1.6, 0, 0.6)]; // from the middle of the daycare
const CHAIRS: Vector3[] = [new Vector3(-0.85, 0, 0), new Vector3(0.85, 0, 0), new Vector3(0, 0, -0.65), new Vector3(0, 0, 0.65)];
const TABLE_TOP: number = 0.45; // child-size: low down
const SEAT_TOP: number = 0.25;
const ROOM_ROUND: number = 2; // how much room a table and its chairs take up, across...
const ROOM_DEEP: number = 1.8; // ...and from front to back

// this makes one little chair, turned to face its table
function makeChair(spot: Vector3, colour: string): Group {
  const chair = new Group();
  chair.add(
    makePart(new BoxGeometry(0.35, 0.05, 0.35), colour, 0, SEAT_TOP, 0),
    makePart(new BoxGeometry(0.35, 0.35, 0.05), colour, 0, SEAT_TOP + 0.18, -0.16),
  );
  for (const x of [-0.14, 0.14]) {
    for (const z of [-0.14, 0.14]) chair.add(makePart(new BoxGeometry(0.04, SEAT_TOP, 0.04), colour, x, SEAT_TOP / 2, z));
  }
  chair.position.copy(spot);
  chair.rotation.y = Math.atan2(-spot.x, -spot.z); // it faces the middle of the table
  return chair;
}

// this makes one little table, with a chair on each side
function makeTable(spot: Vector3): Group {
  const table = new Group();
  table.add(makePart(new BoxGeometry(1.2, 0.06, 0.8), DAYCARE_TABLE_COLOUR, 0, TABLE_TOP, 0));
  for (const x of [-0.5, 0.5]) {
    for (const z of [-0.32, 0.32]) table.add(makePart(new BoxGeometry(0.06, TABLE_TOP, 0.06), DAYCARE_TABLE_COLOUR, x, TABLE_TOP / 2, z));
  }
  for (let i = 0; i < CHAIRS.length; i++) table.add(makeChair(CHAIRS[i], DAYCARE_CHAIR_COLOURS[i % DAYCARE_CHAIR_COLOURS.length]));
  table.position.copy(spot);
  return table;
}

// this makes both tables and their chairs, placed from the middle of the daycare
export function makeDaycareTables(): Group {
  const tables = new Group();
  for (const spot of TABLES) tables.add(makeTable(spot));
  return tables;
}

// this says where the tables and chairs are, for a daycare with its middle here, so nobody walks through them
export function tableBlocks(middle: Vector3): Block[] {
  const blocks: Block[] = [];
  for (const spot of TABLES) blocks.push(blockAround(middle.clone().add(spot), ROOM_ROUND, ROOM_DEEP));
  return blocks;
}
