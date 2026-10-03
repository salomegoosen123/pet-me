// daycare.ts – the daycare next to your brother's school, across the road from your home. Walk in the door and the
// roof lifts off: it's full of children playing! Mia designed this game.
import { BoxGeometry, ConeGeometry, Group, Mesh, PlaneGeometry, Vector3 } from "three";
import type { Object3D } from "three";
import { blockAround, bumpOffBlocks, insideBlock } from "./bumping";
import type { Block } from "./bumping";
import { makeDaycareTables, tableBlocks } from "./daycareTables";
import { FRONT } from "./house";
import { makePart, paint } from "./paint";
import { Person3D } from "./Person3D";
import type { PersonLook } from "./Person3D";
import {
  DAYCARE_CHILDREN, DAYCARE_COLOUR, DAYCARE_ROOF_COLOUR, DAYCARE_SHIRT_COLOURS, FRIEND_HAIR_COLOURS,
  FRIEND_SKIN_COLOURS,
} from "./settings";
import { stepTowards } from "./walking";

export const DAYCARE_SPOT: Vector3 = new Vector3(2, 0, FRONT + 18.5); // across the road, next to the school
const WIDE: number = 7; // how wide the daycare is, from side to side
const DEEP: number = 5; // and from front to back
const WALL_HEIGHT: number = 2.5;
const DOOR_HALF: number = 0.8; // the doorway is this wide on each side of its middle
const ROOF_DOWN: number = WALL_HEIGHT + 0.75; // where the roof sits on the walls
const ROOF_UP: number = ROOF_DOWN + 6; // where it floats when you're inside
const ROOF_SPEED: number = 10; // how fast it lifts off and comes down
const CHILD_SPEED: number = 1; // how fast the children toddle about
const CHILD_SIZE: number = 0.2; // how much room a child takes up
const GIVE_UP_SECONDS: number = 6; // if a child can't get somewhere, they toddle off somewhere else
const ARRIVED: number = 0.1; // this close to a spot counts as being there
const BLOCK_COLOURS: string[] = ["red", "dodgerblue", "gold"]; // the baby blocks by the door, from the bottom up
const BLOCK_SIZE: number = 0.45;
const FLAT: number = -Math.PI / 2; // turns a flat thing so it lies on the floor

// this says a spot in the daycare, this far across and back from its middle
function at(x: number, z: number): Vector3 {
  return DAYCARE_SPOT.clone().add(new Vector3(x, 0, z));
}

// the tables and chairs inside, so nobody walks through them
const TABLE_BLOCKS: Block[] = tableBlocks(DAYCARE_SPOT);

// the daycare walls (with a gap for the doorway, facing the road) and the tables, so nobody walks through them
export const DAYCARE_BLOCKS: Block[] = [
  blockAround(at(0, DEEP / 2), WIDE, 0.3),
  blockAround(at(-WIDE / 2, 0), 0.3, DEEP),
  blockAround(at(WIDE / 2, 0), 0.3, DEEP),
  blockAround(at(-(WIDE / 4 + DOOR_HALF / 2), -DEEP / 2), WIDE / 2 - DOOR_HALF, 0.3),
  blockAround(at(WIDE / 4 + DOOR_HALF / 2, -DEEP / 2), WIDE / 2 - DOOR_HALF, 0.3),
  ...TABLE_BLOCKS,
];

// this says if a spot is inside the daycare
function insideDaycare(spot: Vector3): boolean {
  return Math.abs(spot.x - DAYCARE_SPOT.x) < WIDE / 2 && Math.abs(spot.z - DAYCARE_SPOT.z) < DEEP / 2;
}

// this says if a spot is at one of the tables
function atATable(spot: Vector3): boolean {
  for (const block of TABLE_BLOCKS) {
    if (insideBlock(spot, block)) return true;
  }
  return false;
}

// this picks a spot somewhere inside the daycare (not at a table), for a child to toddle to
function somewhereInside(): Vector3 {
  let spot = at(0, -DEEP / 2 + 1); // just inside the door, if there's nowhere else
  for (let tries = 0; tries < 10; tries++) {
    spot = at((Math.random() - 0.5) * (WIDE - 1.5), (Math.random() - 0.5) * (DEEP - 1.5));
    if (!atATable(spot)) return spot;
  }
  return spot;
}

// this makes the stack of baby blocks by the door
function makeBlocks(): Group {
  const blocks = new Group();
  for (let i = 0; i < BLOCK_COLOURS.length; i++) {
    const block = makePart(new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), BLOCK_COLOURS[i], 0, BLOCK_SIZE * (i + 0.5), 0);
    block.rotation.y = i * 0.4; // a bit wonky, like a baby stacked them
    blocks.add(block);
  }
  blocks.position.set(1.5, 0, -DEEP / 2 - 0.6);
  return blocks;
}

// this makes the daycare building: a soft floor, walls with a doorway and windows, and the baby blocks
function makeBuilding(): Group {
  const building = new Group();
  const floor = new Mesh(new PlaneGeometry(WIDE, DEEP), paint("lavenderblush"));
  floor.rotation.x = FLAT;
  floor.position.y = 0.02;
  floor.receiveShadow = true;
  const side = WIDE / 2 - DOOR_HALF; // how long the front wall is on each side of the doorway
  building.add(
    floor,
    makePart(new BoxGeometry(WIDE, WALL_HEIGHT, 0.2), DAYCARE_COLOUR, 0, WALL_HEIGHT / 2, DEEP / 2),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, DEEP), DAYCARE_COLOUR, -WIDE / 2, WALL_HEIGHT / 2, 0),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, DEEP), DAYCARE_COLOUR, WIDE / 2, WALL_HEIGHT / 2, 0),
    makePart(new BoxGeometry(side, WALL_HEIGHT, 0.2), DAYCARE_COLOUR, -(DOOR_HALF + side / 2), WALL_HEIGHT / 2, -DEEP / 2),
    makePart(new BoxGeometry(side, WALL_HEIGHT, 0.2), DAYCARE_COLOUR, DOOR_HALF + side / 2, WALL_HEIGHT / 2, -DEEP / 2),
    makePart(new BoxGeometry(DOOR_HALF * 2, 0.6, 0.2), DAYCARE_COLOUR, 0, WALL_HEIGHT - 0.3, -DEEP / 2),
    makePart(new BoxGeometry(0.8, 0.8, 0.22), "lightyellow", -2.2, 1.5, -DEEP / 2),
    makePart(new BoxGeometry(0.8, 0.8, 0.22), "lightyellow", 2.2, 1.5, -DEEP / 2),
    makeBlocks(),
    makeDaycareTables(),
  );
  building.position.copy(DAYCARE_SPOT);
  return building;
}

// this makes one child at the daycare: all different sizes, hair, skin and shirts
function makeChild(which: number): Person3D {
  const look: PersonLook = {
    hair: FRIEND_HAIR_COLOURS[which % FRIEND_HAIR_COLOURS.length],
    skin: FRIEND_SKIN_COLOURS[(which * 3) % FRIEND_SKIN_COLOURS.length],
    shirt: DAYCARE_SHIRT_COLOURS[which % DAYCARE_SHIRT_COLOURS.length],
    pants: "navy",
    size: 0.4 + (which % 3) * 0.1, // babies, toddlers, and bigger children
    ponytail: which % 2 === 0,
    blanket: "white",
  };
  const child = new Person3D(look);
  child.model.position.copy(somewhereInside());
  return child;
}

// this makes the daycare's pointy roof, stretched to fit on top of the walls
function makeRoof(): Group {
  const roof = new Group();
  const pyramid = makePart(new ConeGeometry(WIDE * 0.75, 1.5, 4), DAYCARE_ROOF_COLOUR, 0, 0, 0);
  pyramid.rotation.y = Math.PI / 4; // turns the pyramid so it lines up with the walls
  roof.add(pyramid);
  roof.scale.set(1, 1, DEEP / WIDE);
  roof.position.set(DAYCARE_SPOT.x, ROOF_DOWN, DAYCARE_SPOT.z);
  return roof;
}

// Daycare is the daycare building, its roof, and the children playing inside
export class Daycare {
  building: Group;
  roof: Group;
  children: Person3D[];
  goingTo: Vector3[]; // where each child is toddling to
  waitLeft: number[]; // how much longer each child stays where they are

  constructor() {
    this.building = makeBuilding();
    this.roof = makeRoof();
    this.children = [];
    this.goingTo = [];
    this.waitLeft = [];
    for (let i = 0; i < DAYCARE_CHILDREN; i++) {
      this.children.push(makeChild(i));
      this.goingTo.push(somewhereInside());
      this.waitLeft.push(Math.random() * 3);
    }
  }

  // the building, its roof, and the children, to go in the home
  models(): Object3D[] {
    return [this.building, this.roof, ...this.children.map(modelOf)];
  }

  // this says where the children are, so you bump into them
  spots(): Vector3[] {
    return this.children.map(whereTheyAre);
  }

  // this lifts the roof off while you're inside, and moves the children about
  update(you: Person3D, now: number, seconds: number): void {
    const goal = insideDaycare(you.model.position) ? ROOF_UP : ROOF_DOWN;
    this.roof.position.y = this.roof.position.y + (goal - this.roof.position.y) * Math.min(1, ROOF_SPEED * seconds);
    for (let i = 0; i < this.children.length; i++) this.play(i, you, now, seconds);
  }

  // this makes one child play: stand and watch you for a bit, then toddle somewhere else
  play(which: number, you: Person3D, now: number, seconds: number): void {
    const child = this.children[which];
    if (this.waitLeft[which] > 0) {
      this.waitLeft[which] = this.waitLeft[which] - seconds;
      child.standStill();
      if (insideDaycare(you.model.position)) child.faceTowards(you.model.position);
      return;
    }
    stepTowards(child, this.goingTo[which], CHILD_SPEED, 0, now, seconds);
    const spot = child.model.position;
    bumpOffBlocks(spot, CHILD_SIZE, TABLE_BLOCKS); // they toddle round the tables, not through them
    this.waitLeft[which] = this.waitLeft[which] - seconds; // below 0, it counts how long they've been toddling
    const there = Math.hypot(spot.x - this.goingTo[which].x, spot.z - this.goingTo[which].z) < ARRIVED;
    if (!there && this.waitLeft[which] > -GIVE_UP_SECONDS) return; // (if a table's in the way, they give up)
    this.goingTo[which] = somewhereInside();
    this.waitLeft[which] = 1 + Math.random() * 3;
  }
}

// this says someone's 3D model
function modelOf(person: Person3D): Object3D {
  return person.model;
}

// this says where someone is
function whereTheyAre(person: Person3D): Vector3 {
  return person.model.position;
}
