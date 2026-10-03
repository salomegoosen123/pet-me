// bedroom.ts – your bedroom in the 3D home: your big bed, your brother's bed, a wardrobe and a lamp. Mia designed this game.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, SphereGeometry, Vector3 } from "three";
import { makeTiles, makeWallWithDoor } from "./furniture";
import { ROOM_WALL, spread, spreadSpot, YOUR_BED_MIDDLE } from "./homeSpots";
import { makePart } from "./paint";
import {
  BEDCOVER_COLOUR, BEDROOM_WALL_COLOUR, BROTHER_BEDCOVER_COLOUR, CARPET_COLOUR, LAMP_COLOUR, WARDROBE_COLOUR,
} from "./settings";

const QUARTER_TURN: number = Math.PI / 2; // turns a side wall round to make a back wall
const MATTRESS_TOP: number = 0.55; // how high the top of your bed is
export const BED_WIDTH: number = 2.2;
export const BED_LENGTH: number = 3;
const NEAR_BED: number = 0.5; // walk up this close to your bed, and you lie down
export const WARDROBE_SPOT: Vector3 = spreadSpot(-3, -9.5);
export const LAMP_SPOT: Vector3 = YOUR_BED_MIDDLE.clone().add(new Vector3(1.7, 0, -1.2)); // right by your pillow
export const BROTHER_BED_MIDDLE: Vector3 = YOUR_BED_MIDDLE.clone().setX(spread(-3.1)); // next to yours, leaving room to get to the back door

// where you lie in bed: your feet at the bottom of the bed, your head on the pillow
export const LYING_SPOT: Vector3 = new Vector3(YOUR_BED_MIDDLE.x, MATTRESS_TOP + 0.3, YOUR_BED_MIDDLE.z + 1.1);

// this says if you have walked right up to your bed
export function onBigBed(spot: Vector3): boolean {
  const acrossReach = BED_WIDTH / 2 + NEAR_BED;
  const alongReach = BED_LENGTH / 2 + NEAR_BED;
  return Math.abs(spot.x - YOUR_BED_MIDDLE.x) < acrossReach && Math.abs(spot.z - YOUR_BED_MIDDLE.z) < alongReach;
}

// this makes the back wall with a door, and the carpet behind it
function makeBackWallAndCarpet(): Group {
  const wall = new Group();
  wall.add(...makeWallWithDoor(0, BEDROOM_WALL_COLOUR), makeTiles(0, 1, CARPET_COLOUR));
  wall.rotation.y = QUARTER_TURN;
  wall.position.z = -ROOM_WALL;
  return wall;
}

// this makes a big bed: a frame, a mattress, a blanket and a pillow
function makeBigBed(middle: Vector3, blanketColour: string): Group {
  const bed = new Group();
  bed.add(
    makePart(new BoxGeometry(BED_WIDTH + 0.2, 0.35, BED_LENGTH + 0.2), WARDROBE_COLOUR, 0, 0.18, 0),
    makePart(new BoxGeometry(BED_WIDTH, 0.2, BED_LENGTH), "white", 0, 0.45, 0),
    makePart(new BoxGeometry(BED_WIDTH + 0.04, 0.06, 1.8), blanketColour, 0, MATTRESS_TOP, 0.55),
    makePart(new BoxGeometry(1.2, 0.18, 0.5), "white", 0, MATTRESS_TOP + 0.08, -1.15),
  );
  bed.position.copy(middle);
  return bed;
}

// this makes the wardrobe, with two round knobs
function makeWardrobe(): Group {
  const wardrobe = new Group();
  wardrobe.add(
    makePart(new BoxGeometry(1.4, 2.4, 0.7), WARDROBE_COLOUR, 0, 1.2, 0),
    makePart(new SphereGeometry(0.05, 8, 6), "gold", -0.12, 1.2, 0.37),
    makePart(new SphereGeometry(0.05, 8, 6), "gold", 0.12, 1.2, 0.37),
  );
  wardrobe.position.copy(WARDROBE_SPOT);
  return wardrobe;
}

// this makes the little table by your bed, with a lamp on it
function makeLamp(): Group {
  const lamp = new Group();
  lamp.add(
    makePart(new BoxGeometry(0.6, 0.6, 0.6), WARDROBE_COLOUR, 0, 0.3, 0),
    makePart(new CylinderGeometry(0.04, 0.08, 0.5, 10), "white", 0, 0.85, 0),
    makePart(new ConeGeometry(0.28, 0.3, 20, 1, true), LAMP_COLOUR, 0, 1.2, 0),
  );
  lamp.position.copy(LAMP_SPOT);
  return lamp;
}

// this makes the whole bedroom
export function makeBedroom(): Group {
  const bedroom = new Group();
  bedroom.add(makeBackWallAndCarpet(), makeWardrobe(), makeLamp());
  bedroom.add(makeBigBed(YOUR_BED_MIDDLE, BEDCOVER_COLOUR), makeBigBed(BROTHER_BED_MIDDLE, BROTHER_BEDCOVER_COLOUR));
  return bedroom;
}
