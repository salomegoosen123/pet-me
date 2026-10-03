// pool.ts – the swimming pool in the back yard: blue water, a white edge, and a ring floating on it. Mia designed this game.
import { BoxGeometry, Group, Mesh, PlaneGeometry, TorusGeometry, Vector3 } from "three";
import { blockAround } from "./bumping";
import type { Block } from "./bumping";
import { BACK } from "./house";
import { makePart, paint } from "./paint";
import type { Person3D } from "./Person3D";
import { POOL_FLOAT_COLOUR, POOL_WATER_COLOUR } from "./settings";

export const POOL_SPOT: Vector3 = new Vector3(4, 0, BACK - 6); // in the middle of the back yard
const POOL_WIDTH: number = 6; // from side to side
const POOL_LENGTH: number = 4; // from front to back
const WATER_TOP: number = 0.05; // how high the water is
const EDGE_WIDTH: number = 0.3;
const EDGE_HEIGHT: number = 0.12;
const FLAT: number = -Math.PI / 2;
const SINK_FOR_YOUR_SIZE: number = -1.3; // how far down someone sinks in the water, times how big they are

const BOB_HIGH: number = 0.04; // how far you bob up and down
const BOB_SPEED: number = 2; // how fast you bob
const WAIT_AWAY: number = 0.8; // Saydee waits this far from the edge of the pool

// the pool: in your clothes you bump into it, in your swimming costume you can get in
export const POOL_BLOCK: Block = blockAround(POOL_SPOT, POOL_WIDTH, POOL_LENGTH);

// this makes the white edge all round the pool
function makeEdge(): Mesh[] {
  const halfWide = POOL_WIDTH / 2 + EDGE_WIDTH / 2;
  const halfLong = POOL_LENGTH / 2 + EDGE_WIDTH / 2;
  const across = POOL_WIDTH + EDGE_WIDTH * 2;
  return [
    makePart(new BoxGeometry(across, EDGE_HEIGHT, EDGE_WIDTH), "white", 0, EDGE_HEIGHT / 2, -halfLong),
    makePart(new BoxGeometry(across, EDGE_HEIGHT, EDGE_WIDTH), "white", 0, EDGE_HEIGHT / 2, halfLong),
    makePart(new BoxGeometry(EDGE_WIDTH, EDGE_HEIGHT, POOL_LENGTH), "white", -halfWide, EDGE_HEIGHT / 2, 0),
    makePart(new BoxGeometry(EDGE_WIDTH, EDGE_HEIGHT, POOL_LENGTH), "white", halfWide, EDGE_HEIGHT / 2, 0),
  ];
}

// this makes the pool: the water, the edge, and a swimming ring floating in one corner
export function makePool(): Group {
  const pool = new Group();
  const water = new Mesh(new PlaneGeometry(POOL_WIDTH, POOL_LENGTH), paint(POOL_WATER_COLOUR));
  water.rotation.x = FLAT;
  water.position.y = WATER_TOP;
  const ring = makePart(new TorusGeometry(0.35, 0.12, 12, 24), POOL_FLOAT_COLOUR, 1.8, WATER_TOP + 0.05, -0.8);
  ring.rotation.x = FLAT;
  pool.add(water, ...makeEdge(), ring);
  pool.position.copy(POOL_SPOT);
  return pool;
}

// this says if a spot is in the pool
export function inThePool(spot: Vector3): boolean {
  return spot.x > POOL_BLOCK.minX && spot.x < POOL_BLOCK.maxX && spot.z > POOL_BLOCK.minZ && spot.z < POOL_BLOCK.maxZ;
}

// this finds the spot just outside the pool's edge that's closest to you, where Saydee waits while you swim
export function besideThePool(spot: Vector3): Vector3 {
  const beside = spot.clone();
  const toLeft = spot.x - POOL_BLOCK.minX;
  const toRight = POOL_BLOCK.maxX - spot.x;
  const toBack = spot.z - POOL_BLOCK.minZ;
  const toFront = POOL_BLOCK.maxZ - spot.z;
  const nearest = Math.min(toLeft, toRight, toBack, toFront);
  if (nearest === toLeft) beside.x = POOL_BLOCK.minX - WAIT_AWAY;
  else if (nearest === toRight) beside.x = POOL_BLOCK.maxX + WAIT_AWAY;
  else if (nearest === toBack) beside.z = POOL_BLOCK.minZ - WAIT_AWAY;
  else beside.z = POOL_BLOCK.maxZ + WAIT_AWAY;
  return beside;
}

// this finds a spot in the pool next to you, where your brother swims (always inside the pool, not over the edge)
export function nextToYouInThePool(you: Vector3): Vector3 {
  const spot = you.clone().add(new Vector3(1.2, 0, 0));
  spot.x = Math.min(POOL_BLOCK.maxX - 0.4, Math.max(POOL_BLOCK.minX + 0.4, spot.x));
  spot.z = Math.min(POOL_BLOCK.maxZ - 0.4, Math.max(POOL_BLOCK.minZ + 0.4, spot.z));
  return spot.setY(0);
}

// this says how far down someone sinks in the water, so it comes up to their chest (a baby sinks less than a child)
export function swimDepth(person: Person3D): number {
  return SINK_FOR_YOUR_SIZE * person.model.scale.y;
}

// this sinks you into the water up to your chest, bobbing, when you're in the pool, or keeps your feet on the ground
export function floatInPool(you: Person3D, now: number): void {
  const spot = you.model.position;
  spot.y = inThePool(spot) ? swimDepth(you) + Math.sin(now * BOB_SPEED) * BOB_HIGH : 0;
}
