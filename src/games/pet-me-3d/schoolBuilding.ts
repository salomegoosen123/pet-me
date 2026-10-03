// schoolBuilding.ts – the road past your home, and your brother's school across it: a brick classroom with a
// doorway, desks and a board inside, and a roof with a bell tower that lifts off when you walk in. Mia designed this game.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { blockAround } from "./bumping";
import type { Block } from "./bumping";
import { FRONT } from "./house";
import type { Chair } from "./kitchen";
import { makePart, paint } from "./paint";
import { SCHOOL_CHILDREN, SCHOOL_COLOUR, SCHOOL_DESK_COLOUR } from "./settings";

const FLAT: number = -Math.PI / 2; // turns a flat thing so it lies on the ground
const ROAD_Z: number = FRONT + 12.5; // the road runs past the end of your front garden
const SCHOOL_SPOT: Vector3 = new Vector3(-7, 0, ROAD_Z + 7); // the middle of the school, across the road
const WIDE: number = 10; // how wide the school is
const DEEP: number = 6; // and from front to back
const WALL_HEIGHT: number = 3.5;
const DOOR_HALF: number = 0.8; // the doorway is this wide on each side of its middle
const DOOR_HEIGHT: number = 2.2;
const DESK_TOP: number = 0.55;
export const SCHOOL_SEAT_TOP: number = 0.35; // how high the school chairs are
const BEHIND_THE_DESK: number = 0.5; // the chairs are this far behind their desks
const FACING_THE_BOARD: number = 0; // everyone sitting at a desk faces the board at the back

// this says a spot in the school, this far across and back from its middle
function at(x: number, z: number): Vector3 {
  return SCHOOL_SPOT.clone().add(new Vector3(x, 0, z));
}

export const SCHOOL_DOOR: Vector3 = at(0, -DEEP / 2 - 0.6); // just outside the doorway
export const IN_THE_DOORWAY: Vector3 = at(0, -DEEP / 2 + 0.6); // just inside it
export const TEACHER_SPOT: Vector3 = at(0, DEEP / 2 - 0.8); // in front of the board
const TEACHERS_DESK: Vector3 = at(3.2, DEEP / 2 - 0.9);
const GRASS_MIDDLE: Vector3 = new Vector3(0, 0, SCHOOL_SPOT.z); // the grass under the school and the daycare

// the desks: three rows of four, with the way up the middle to the board
const DESKS: Vector3[] = [];
for (const z of [-1.6, -0.3, 1]) {
  for (const x of [-3.8, -2.3, 2.3, 3.8]) DESKS.push(at(x, z));
}

// this says the chair behind a desk
function chairAt(desk: Vector3): Chair {
  return { spot: desk.clone().add(new Vector3(0, 0, -BEHIND_THE_DESK)), facing: FACING_THE_BOARD, seatTop: SCHOOL_SEAT_TOP };
}

// the chairs at the desks. Your brother sits at the second one in the front row
export const SCHOOL_SEATS: Chair[] = DESKS.map(chairAt);
export const BROTHER_SEAT: number = 1;

// which chairs the other children sit on: every chair but your brother's, as many as there are children
export const CHILDRENS_SEATS: number[] = [];
for (let i = 0; i < SCHOOL_SEATS.length && CHILDRENS_SEATS.length < SCHOOL_CHILDREN; i++) {
  if (i !== BROTHER_SEAT) CHILDRENS_SEATS.push(i);
}

// this says if nobody sits on a chair, so you can
function isFree(chair: Chair, which: number): boolean {
  return which !== BROTHER_SEAT && !CHILDRENS_SEATS.includes(which);
}

// the chairs nobody sits on: you can sit on them
export const FREE_SCHOOL_SEATS: Chair[] = SCHOOL_SEATS.filter(isFree);
export const WAY_TO_BROTHERS_DESK: Vector3[] = [IN_THE_DOORWAY, at(-0.9, -1.6 - BEHIND_THE_DESK)];

// this says the room a desk and its chair take up
function deskBlock(desk: Vector3): Block {
  return blockAround(desk.clone().add(new Vector3(0, 0, -0.2)), 0.9, 1.1);
}

// the school walls (with a gap for the doorway), the desks and the teacher's desk, so nobody walks through them
export const SCHOOL_BLOCKS: Block[] = [
  blockAround(at(0, DEEP / 2), WIDE, 0.3),
  blockAround(at(-WIDE / 2, 0), 0.3, DEEP),
  blockAround(at(WIDE / 2, 0), 0.3, DEEP),
  blockAround(at(-(WIDE / 4 + DOOR_HALF / 2), -DEEP / 2), WIDE / 2 - DOOR_HALF, 0.3),
  blockAround(at(WIDE / 4 + DOOR_HALF / 2, -DEEP / 2), WIDE / 2 - DOOR_HALF, 0.3),
  ...DESKS.map(deskBlock),
  blockAround(TEACHERS_DESK, 1.6, 0.8),
];

// this says if a spot is inside the school
export function insideSchool(spot: Vector3): boolean {
  return Math.abs(spot.x - SCHOOL_SPOT.x) < WIDE / 2 && Math.abs(spot.z - SCHOOL_SPOT.z) < DEEP / 2;
}

// this makes one desk with its chair, placed from the middle of the school
function makeDesk(desk: Vector3): Group {
  const whole = new Group();
  whole.add(
    makePart(new BoxGeometry(0.8, 0.05, 0.5), SCHOOL_DESK_COLOUR, 0, DESK_TOP, 0),
    makePart(new BoxGeometry(0.7, DESK_TOP, 0.05), SCHOOL_DESK_COLOUR, 0, DESK_TOP / 2, 0.2),
    makePart(new BoxGeometry(0.4, 0.05, 0.4), SCHOOL_DESK_COLOUR, 0, SCHOOL_SEAT_TOP, -BEHIND_THE_DESK),
    makePart(new BoxGeometry(0.4, 0.4, 0.05), SCHOOL_DESK_COLOUR, 0, SCHOOL_SEAT_TOP + 0.2, -BEHIND_THE_DESK - 0.2),
  );
  whole.position.copy(desk).sub(SCHOOL_SPOT);
  return whole;
}

// this makes the classroom: a floor, brick walls with a doorway and windows, the board, and all the desks
function makeClassroom(): Group {
  const room = new Group();
  const floor = new Mesh(new PlaneGeometry(WIDE, DEEP), paint("wheat"));
  floor.rotation.x = FLAT;
  floor.position.y = 0.02;
  floor.receiveShadow = true;
  const side = WIDE / 2 - DOOR_HALF; // how long the front wall is on each side of the doorway
  const up = WALL_HEIGHT / 2;
  const overDoor = WALL_HEIGHT - DOOR_HEIGHT; // the bit of wall over the doorway
  room.add(
    floor,
    makePart(new BoxGeometry(WIDE, WALL_HEIGHT, 0.2), SCHOOL_COLOUR, 0, up, DEEP / 2),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, DEEP), SCHOOL_COLOUR, -WIDE / 2, up, 0),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, DEEP), SCHOOL_COLOUR, WIDE / 2, up, 0),
    makePart(new BoxGeometry(side, WALL_HEIGHT, 0.2), SCHOOL_COLOUR, -(DOOR_HALF + side / 2), up, -DEEP / 2),
    makePart(new BoxGeometry(side, WALL_HEIGHT, 0.2), SCHOOL_COLOUR, DOOR_HALF + side / 2, up, -DEEP / 2),
    makePart(new BoxGeometry(DOOR_HALF * 2, overDoor, 0.2), SCHOOL_COLOUR, 0, DOOR_HEIGHT + overDoor / 2, -DEEP / 2),
    makePart(new BoxGeometry(3, 1.2, 0.05), "darkgreen", 0, 1.8, DEEP / 2 - 0.13),
  );
  const teachersDesk = makePart(new BoxGeometry(1.6, 0.8, 0.8), SCHOOL_DESK_COLOUR, 0, 0.4, 0);
  teachersDesk.position.add(TEACHERS_DESK).sub(SCHOOL_SPOT);
  room.add(teachersDesk);
  for (const x of [-3.8, -2.3, 2.3, 3.8]) room.add(makePart(new BoxGeometry(0.8, 0.8, 0.22), "lightblue", x, 2.2, -DEEP / 2));
  for (const desk of DESKS) room.add(makeDesk(desk));
  room.position.copy(SCHOOL_SPOT);
  return room;
}

// this makes the school's roof, with its bell tower: it lifts off when you walk in
export function makeSchoolRoof(): Group {
  const roof = new Group();
  const towerRoof = makePart(new ConeGeometry(1.1, 1, 4), "darkslategray", 0, 2.4, 0);
  towerRoof.rotation.y = Math.PI / 4;
  roof.add(
    makePart(new BoxGeometry(WIDE + 0.4, 0.3, DEEP + 0.4), "dimgray", 0, 0.15, 0),
    makePart(new BoxGeometry(1.4, 1.6, 1.4), SCHOOL_COLOUR, 0, 1.1, 0),
    towerRoof,
    makePart(new SphereGeometry(0.3, 16, 8), "gold", 0, 1.1, -0.75),
  );
  roof.position.copy(SCHOOL_SPOT).setY(WALL_HEIGHT);
  return roof;
}

// this makes the road past your home, the grass across it, the flag, and the classroom
// (the roof is separate, so it can lift off, and the daycare is in daycare.ts)
export function makeSchoolGrounds(): Group {
  const grounds = new Group();
  const road = new Mesh(new PlaneGeometry(80, 3), paint("dimgray"));
  road.rotation.x = FLAT;
  road.position.set(0, 0.01, ROAD_Z);
  road.receiveShadow = true;
  const grass = new Mesh(new PlaneGeometry(30, 10), paint("yellowgreen"));
  grass.rotation.x = FLAT;
  grass.position.set(GRASS_MIDDLE.x, 0.005, GRASS_MIDDLE.z);
  grass.receiveShadow = true;
  const flagSpot = at(WIDE / 2 - 0.6, -DEEP / 2 - 1);
  grounds.add(
    road,
    grass,
    makePart(new CylinderGeometry(0.05, 0.05, 4, 8), "silver", flagSpot.x, 2, flagSpot.z),
    makePart(new BoxGeometry(0.9, 0.55, 0.04), "red", flagSpot.x + 0.45, 3.7, flagSpot.z),
    makeClassroom(),
  );
  return grounds;
}
