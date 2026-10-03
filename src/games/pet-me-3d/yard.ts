// yard.ts – the back yard behind the house: grass, a fence, a big tree, flowers, a doghouse and a pool. Mia designed this game.
import { BoxGeometry, ConeGeometry, Group, Mesh, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { BACK, HOUSE_LEFT, HOUSE_RIGHT } from "./house";
import { makePart, paint } from "./paint";
import { makePool } from "./pool";
import { makeTree } from "./tree";
import {
  DOGHOUSE_COLOUR, DOGHOUSE_ROOF_COLOUR, FENCE_COLOUR, FLOWER_COLOURS, GRASS_COLOUR, YARD_FLOWER_COUNT,
} from "./settings";

export const YARD_DEPTH: number = 12; // how far the yard goes back from the house
export const YARD_END: number = BACK - YARD_DEPTH; // the fence at the very back of the yard
export const DOGHOUSE_SPOT: Vector3 = new Vector3(HOUSE_RIGHT - 4, 0, YARD_END + 3); // in the far corner
export const YARD_TREE_SPOT: Vector3 = new Vector3(HOUSE_LEFT + 5, 0, YARD_END + 5); // in the other corner
const FLAT: number = -Math.PI / 2;
const FENCE_HEIGHT: number = 1;
const POST_GAP: number = 1.5; // how far apart the fence posts are
const SQUARE_CORNERS: number = 4; // a cone with four sides is a pyramid, for the doghouse roof
const TURN_TO_SQUARE: number = Math.PI / 4;

// this makes the yard's grass
function makeYardGrass(): Mesh {
  const grass = new Mesh(new PlaneGeometry(HOUSE_RIGHT - HOUSE_LEFT, YARD_DEPTH), paint(GRASS_COLOUR));
  grass.rotation.x = FLAT;
  grass.position.set(0, 0.004, BACK - YARD_DEPTH / 2);
  grass.receiveShadow = true;
  return grass;
}

// this makes one straight bit of fence between two spots: posts, and two rails across
function makeFenceSide(fromX: number, fromZ: number, toX: number, toZ: number): Mesh[] {
  const parts: Mesh[] = [];
  const length = Math.hypot(toX - fromX, toZ - fromZ);
  const posts = Math.round(length / POST_GAP);
  for (let i = 0; i <= posts; i++) {
    const x = fromX + ((toX - fromX) * i) / posts;
    const z = fromZ + ((toZ - fromZ) * i) / posts;
    parts.push(makePart(new BoxGeometry(0.15, FENCE_HEIGHT, 0.15), FENCE_COLOUR, x, FENCE_HEIGHT / 2, z));
  }
  const alongX = Math.abs(toX - fromX) > Math.abs(toZ - fromZ);
  for (const height of [0.4, 0.8]) {
    const size = alongX ? new BoxGeometry(length, 0.1, 0.06) : new BoxGeometry(0.06, 0.1, length);
    parts.push(makePart(size, FENCE_COLOUR, (fromX + toX) / 2, height, (fromZ + toZ) / 2));
  }
  return parts;
}

// this makes the fence round the three sides of the yard (the house is the fourth side)
function makeFence(): Mesh[] {
  return [
    ...makeFenceSide(HOUSE_LEFT, BACK, HOUSE_LEFT, YARD_END),
    ...makeFenceSide(HOUSE_LEFT, YARD_END, HOUSE_RIGHT, YARD_END),
    ...makeFenceSide(HOUSE_RIGHT, YARD_END, HOUSE_RIGHT, BACK),
  ];
}

// this makes Saydee's doghouse: a little house with a pointy roof and a dark door
function makeDoghouse(): Group {
  const doghouse = new Group();
  const roof = makePart(new ConeGeometry(1.1, 0.8, SQUARE_CORNERS), DOGHOUSE_ROOF_COLOUR, 0, 1.6, 0);
  roof.rotation.y = TURN_TO_SQUARE;
  doghouse.add(
    makePart(new BoxGeometry(1.5, 1.2, 1.5), DOGHOUSE_COLOUR, 0, 0.6, 0),
    roof,
    makePart(new BoxGeometry(0.6, 0.7, 0.05), "black", 0, 0.35, 0.76),
  );
  doghouse.position.copy(DOGHOUSE_SPOT);
  return doghouse;
}

// this dots flowers about the yard
function makeYardFlowers(): Mesh[] {
  const flowers: Mesh[] = [];
  for (let i = 0; i < YARD_FLOWER_COUNT; i++) {
    const x = HOUSE_LEFT + 1 + Math.random() * (HOUSE_RIGHT - HOUSE_LEFT - 2);
    const z = BACK - 1 - Math.random() * (YARD_DEPTH - 2);
    const colour = FLOWER_COLOURS[i % FLOWER_COLOURS.length];
    flowers.push(makePart(new SphereGeometry(0.1, 12, 8), colour, x, 0.1, z));
  }
  return flowers;
}

// this makes the whole back yard
export function makeYard(): Group {
  const yard = new Group();
  yard.add(makeYardGrass(), ...makeFence(), makeDoghouse(), ...makeYardFlowers(), makePool());
  yard.add(makeTree(YARD_TREE_SPOT.x, YARD_TREE_SPOT.z));
  return yard;
}
