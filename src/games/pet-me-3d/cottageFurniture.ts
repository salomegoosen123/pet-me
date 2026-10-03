// cottageFurniture.ts – everything inside Ouma and Oupa's cottage: three beds, a kitchen, a sofa, a TV,
// a fireplace, Oupa's rocking chair, and a table with four chairs (that one's in cottageTable.ts). Mia designed this game.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Vector3 } from "three";
import { COTTAGE_BACK, COTTAGE_LEFT, COTTAGE_RIGHT } from "./cottage";
import { cottageTablePosts, makeCottageTable } from "./cottageTable";
import type { Chair } from "./kitchen";
import { makePart } from "./paint";
import {
  CHAIR_COLOUR, COTTAGE_BED_COLOURS, COUNTER_COLOUR, COUNTER_TOP_COLOUR, FRIDGE_COLOUR, SOFA_COLOUR, WARDROBE_COLOUR,
} from "./settings";

const BED_LONG: number = 2.2;
const BED_Z: number = COTTAGE_BACK + BED_LONG / 2 + 0.15;

// one bed: where it is, how wide it is, and how many pillows it has
interface Bed {
  x: number;
  wide: number;
  pillows: number;
}

// three beds side by side along the back wall: one for you, one for your brother,
// and a big double one that fits two people, for Ouma and Oupa
const BEDS: Bed[] = [
  { x: -5, wide: 1.2, pillows: 1 },
  { x: -3.4, wide: 1.2, pillows: 1 },
  { x: -1.4, wide: 2.2, pillows: 2 },
];
const COUNTER_SPOT: Vector3 = new Vector3(3, 0, COTTAGE_BACK + 0.45);
const FRIDGE_SPOT: Vector3 = new Vector3(COTTAGE_RIGHT - 0.6, 0, COTTAGE_BACK + 0.55);
const FIREPLACE_SPOT: Vector3 = new Vector3(COTTAGE_RIGHT - 0.35, 0, -8.5);
const SOFA_SPOT: Vector3 = new Vector3(-2.8, 0, -7);
export const COTTAGE_TV_SPOT: Vector3 = new Vector3(COTTAGE_LEFT + 0.35, 0, -7); // against the left wall, facing the sofa
const FACING_THE_FIRE: number = Math.PI / 2; // looking towards the right-hand wall

// where Oupa sits: in the rocking chair, looking at the fire
export const ROCKING_CHAIR: Chair = { spot: new Vector3(4, 0, -8.5), facing: FACING_THE_FIRE };

// where Ouma stands: at the stove, cooking
export const AT_THE_STOVE: Vector3 = COUNTER_SPOT.clone().add(new Vector3(0, 0, 1));

// this makes one bed: a frame, a mattress, a blanket and its pillows, with its head against the back wall
function makeBed(bed: Bed, blanket: string): Group {
  const parts = new Group();
  parts.add(
    makePart(new BoxGeometry(bed.wide + 0.1, 0.35, BED_LONG + 0.1), WARDROBE_COLOUR, 0, 0.18, 0),
    makePart(new BoxGeometry(bed.wide, 0.18, BED_LONG), "white", 0, 0.44, 0),
    makePart(new BoxGeometry(bed.wide + 0.04, 0.06, 1.4), blanket, 0, 0.55, 0.35),
  );
  for (let i = 0; i < bed.pillows; i++) {
    const across = (i + 0.5) * (bed.wide / bed.pillows) - bed.wide / 2; // pillows share the bed out evenly
    parts.add(makePart(new BoxGeometry(0.8, 0.15, 0.4), "white", across, 0.6, -BED_LONG / 2 + 0.3));
  }
  parts.position.set(bed.x, 0, BED_Z);
  return parts;
}

// this makes the kitchen: a counter with a stove on top, and a fridge
function makeKitchen(): Group {
  const kitchen = new Group();
  kitchen.add(
    makePart(new BoxGeometry(3.4, 0.9, 0.7), COUNTER_COLOUR, COUNTER_SPOT.x, 0.45, COUNTER_SPOT.z),
    makePart(new BoxGeometry(3.5, 0.08, 0.8), COUNTER_TOP_COLOUR, COUNTER_SPOT.x, 0.94, COUNTER_SPOT.z),
    makePart(new CylinderGeometry(0.15, 0.15, 0.03, 20), "black", COUNTER_SPOT.x - 0.3, 0.99, COUNTER_SPOT.z),
    makePart(new CylinderGeometry(0.15, 0.15, 0.03, 20), "black", COUNTER_SPOT.x + 0.3, 0.99, COUNTER_SPOT.z),
    makePart(new BoxGeometry(0.9, 2, 0.8), FRIDGE_COLOUR, FRIDGE_SPOT.x, 1, FRIDGE_SPOT.z),
  );
  return kitchen;
}

// this makes the fireplace: bricks, a dark hole, a fire burning inside, and a chimney going up
function makeFireplace(): Group {
  const fireplace = new Group();
  fireplace.add(
    makePart(new BoxGeometry(0.6, 1.4, 1.8), "firebrick", 0, 0.7, 0),
    makePart(new BoxGeometry(0.1, 0.8, 1), "black", -0.26, 0.45, 0),
    makePart(new ConeGeometry(0.25, 0.6, 12), "orange", -0.25, 0.35, 0),
    makePart(new ConeGeometry(0.14, 0.4, 12), "yellow", -0.3, 0.3, 0),
    makePart(new BoxGeometry(0.6, 1.2, 0.9), "firebrick", 0, 2, 0),
  );
  fireplace.position.copy(FIREPLACE_SPOT);
  return fireplace;
}

// this makes the rocking chair: a seat, a tall back, and two curved rockers underneath
function makeRockingChair(): Group {
  const chair = new Group();
  chair.add(
    makePart(new BoxGeometry(0.6, 0.08, 0.6), CHAIR_COLOUR, 0, 0.45, 0),
    makePart(new BoxGeometry(0.6, 0.9, 0.08), CHAIR_COLOUR, 0, 0.9, -0.28),
    makePart(new BoxGeometry(0.05, 0.08, 0.9), CHAIR_COLOUR, -0.25, 0.05, 0),
    makePart(new BoxGeometry(0.05, 0.08, 0.9), CHAIR_COLOUR, 0.25, 0.05, 0),
  );
  for (const x of [-0.25, 0.25]) {
    for (const z of [-0.22, 0.22]) chair.add(makePart(new BoxGeometry(0.05, 0.4, 0.05), CHAIR_COLOUR, x, 0.25, z));
  }
  chair.rotation.y = ROCKING_CHAIR.facing;
  chair.position.copy(ROCKING_CHAIR.spot);
  return chair;
}

// this makes the sofa, facing the TV (the TV itself is a TV3D, in GrandparentsPlay.ts, because it plays cartoons)
function makeSofa(): Group {
  const sofa = new Group();
  sofa.add(
    makePart(new BoxGeometry(1, 0.45, 2.2), SOFA_COLOUR, SOFA_SPOT.x, 0.23, SOFA_SPOT.z),
    makePart(new BoxGeometry(0.25, 0.9, 2.2), SOFA_COLOUR, SOFA_SPOT.x + 0.38, 0.45, SOFA_SPOT.z),
  );
  return sofa;
}

// this makes everything inside the cottage
export function makeCottageFurniture(): Group {
  const inside = new Group();
  for (let i = 0; i < BEDS.length; i++) inside.add(makeBed(BEDS[i], COTTAGE_BED_COLOURS[i % COTTAGE_BED_COLOURS.length]));
  inside.add(makeKitchen(), makeFireplace(), makeRockingChair(), makeSofa(), makeCottageTable());
  return inside;
}

// this says spots on all the furniture, so you and your brother bump into it
export function furniturePosts(): Vector3[] {
  const posts: Vector3[] = [];
  for (const bed of BEDS) {
    const acrossSpots = bed.wide > 1.5 ? [bed.x - 0.5, bed.x + 0.5] : [bed.x]; // a wide bed needs two rows of spots
    for (const x of acrossSpots) {
      for (const along of [-0.8, 0, 0.8]) posts.push(new Vector3(x, 0, BED_Z + along));
    }
  }
  for (let x = COUNTER_SPOT.x - 1.5; x <= COUNTER_SPOT.x + 1.5; x += 0.75) posts.push(new Vector3(x, 0, COUNTER_SPOT.z));
  posts.push(FRIDGE_SPOT.clone(), COTTAGE_TV_SPOT.clone(), ROCKING_CHAIR.spot.clone());
  for (const along of [-0.6, 0, 0.6]) posts.push(FIREPLACE_SPOT.clone().add(new Vector3(0, 0, along)));
  for (const along of [-0.8, 0, 0.8]) posts.push(SOFA_SPOT.clone().add(new Vector3(0, 0, along)));
  posts.push(...cottageTablePosts());
  return posts;
}
