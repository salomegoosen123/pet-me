// playRoom.ts – the play room, next to your bedroom: a toy box with toys, a ball pit, and a play tent. Mia designed this game.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { DOOR_HALF, ROOM_WALL } from "./homeSpots";
import { BACK, HOUSE_LEFT } from "./house";
import { makePart, paint } from "./paint";
import {
  BALL_COUNT, BALL_PIT_COLOURS, PLAYROOM_CARPET_COLOUR, PLAYROOM_WALL_COLOUR, TEDDY_COLOUR, TENT_COLOUR, TOY_BOX_COLOUR,
} from "./settings";

const FLAT: number = -Math.PI / 2; // turns a flat thing so it lies on the floor
const WALL_HEIGHT: number = 1.6; // low walls, like the other rooms, so you can see over them
const ROOM_MIDDLE_X: number = (HOUSE_LEFT - ROOM_WALL) / 2;
const ROOM_WIDE: number = -ROOM_WALL - HOUSE_LEFT; // from the side of the house to your bedroom
const ROOM_DEEP: number = -ROOM_WALL - BACK; // from the bathroom to the back of the house
const PIT_WALL_HEIGHT: number = 0.5;
const BALL_SIZE: number = 0.12;

export const PLAYROOM_DOOR_Z: number = -ROOM_WALL - 2; // the door in from your bedroom
export const TOY_BOX_SPOT: Vector3 = new Vector3(HOUSE_LEFT + 1.5, 0, BACK + 1.2);
export const TEDDY_SPOT: Vector3 = TOY_BOX_SPOT.clone().add(new Vector3(1.1, 0, 0.6)); // where the teddy sits, by the toy box
export const BALL_PIT_SPOT: Vector3 = new Vector3(-ROOM_WALL - 3.5, 0, BACK + 2.5);
export const BALL_PIT_SIZE: number = 2.4;
export const TENT_SPOT: Vector3 = new Vector3(HOUSE_LEFT + 2.5, 0, -ROOM_WALL - 2.5);
export const TENT_SIZE: number = 1.1;

// this makes the carpet on the floor
function makeCarpet(): Mesh {
  const carpet = new Mesh(new PlaneGeometry(ROOM_WIDE, ROOM_DEEP), paint(PLAYROOM_CARPET_COLOUR));
  carpet.rotation.x = FLAT;
  carpet.position.set(ROOM_MIDDLE_X, 0.005, BACK + ROOM_DEEP / 2);
  carpet.receiveShadow = true;
  return carpet;
}

// this makes the walls: one next to the bathroom, and one next to your bedroom with a doorway
function makeWalls(): Mesh[] {
  const backPiece = PLAYROOM_DOOR_Z - DOOR_HALF - BACK;
  const frontPiece = -ROOM_WALL - (PLAYROOM_DOOR_Z + DOOR_HALF);
  return [
    makePart(new BoxGeometry(ROOM_WIDE, WALL_HEIGHT, 0.2), PLAYROOM_WALL_COLOUR, ROOM_MIDDLE_X, WALL_HEIGHT / 2, -ROOM_WALL),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, backPiece), PLAYROOM_WALL_COLOUR, -ROOM_WALL, WALL_HEIGHT / 2, BACK + backPiece / 2),
    makePart(new BoxGeometry(0.2, WALL_HEIGHT, frontPiece), PLAYROOM_WALL_COLOUR, -ROOM_WALL, WALL_HEIGHT / 2, -ROOM_WALL - frontPiece / 2),
  ];
}

// this makes the teddy: a body, a head and two ears (it's by itself, because you can carry it)
export function makeTeddy(): Group {
  const teddy = new Group();
  teddy.add(
    makePart(new SphereGeometry(0.22, 16, 12), TEDDY_COLOUR, 0, 0.22, 0),
    makePart(new SphereGeometry(0.15, 16, 12), TEDDY_COLOUR, 0, 0.55, 0),
    makePart(new SphereGeometry(0.06, 8, 6), TEDDY_COLOUR, -0.1, 0.68, 0),
    makePart(new SphereGeometry(0.06, 8, 6), TEDDY_COLOUR, 0.1, 0.68, 0),
  );
  return teddy;
}

// this makes the toy box with its lid open, and toys around it: a ball, and a tower of blocks
function makeToys(): Group {
  const toys = new Group();
  const lid = makePart(new BoxGeometry(1.2, 0.06, 0.7), TOY_BOX_COLOUR, 0, 0.75, -0.45);
  lid.rotation.x = -1.2;
  toys.add(
    makePart(new BoxGeometry(1.2, 0.6, 0.7), TOY_BOX_COLOUR, 0, 0.3, 0),
    lid,
    makePart(new SphereGeometry(0.2, 16, 12), "red", -0.3, 0.2, 1),
    makePart(new BoxGeometry(0.25, 0.25, 0.25), "gold", 0.4, 0.13, 1.1),
    makePart(new BoxGeometry(0.25, 0.25, 0.25), "deepskyblue", 0.4, 0.38, 1.1),
    makePart(new BoxGeometry(0.25, 0.25, 0.25), "limegreen", 0.4, 0.63, 1.1),
  );
  toys.position.copy(TOY_BOX_SPOT);
  return toys;
}

// this makes the ball pit: four low walls, full of balls in lots of colours
function makeBallPit(): Group {
  const pit = new Group();
  const half = BALL_PIT_SIZE / 2;
  pit.add(
    makePart(new BoxGeometry(BALL_PIT_SIZE, PIT_WALL_HEIGHT, 0.1), "white", 0, PIT_WALL_HEIGHT / 2, -half),
    makePart(new BoxGeometry(BALL_PIT_SIZE, PIT_WALL_HEIGHT, 0.1), "white", 0, PIT_WALL_HEIGHT / 2, half),
    makePart(new BoxGeometry(0.1, PIT_WALL_HEIGHT, BALL_PIT_SIZE), "white", -half, PIT_WALL_HEIGHT / 2, 0),
    makePart(new BoxGeometry(0.1, PIT_WALL_HEIGHT, BALL_PIT_SIZE), "white", half, PIT_WALL_HEIGHT / 2, 0),
  );
  const inside = half - BALL_SIZE - 0.05;
  for (let i = 0; i < BALL_COUNT; i++) {
    const x = (Math.random() * 2 - 1) * inside;
    const z = (Math.random() * 2 - 1) * inside;
    const y = BALL_SIZE + Math.random() * (PIT_WALL_HEIGHT - BALL_SIZE * 2);
    pit.add(makePart(new SphereGeometry(BALL_SIZE, 10, 8), BALL_PIT_COLOURS[i % BALL_PIT_COLOURS.length], x, y, z));
  }
  pit.position.copy(BALL_PIT_SPOT);
  return pit;
}

// this makes the play tent: a pointy tent with a little flag on top
function makeTent(): Group {
  const tent = new Group();
  tent.add(
    makePart(new ConeGeometry(TENT_SIZE, 1.8, 6), TENT_COLOUR, 0, 0.9, 0),
    makePart(new CylinderGeometry(0.02, 0.02, 0.5, 6), "white", 0, 2, 0),
    makePart(new BoxGeometry(0.25, 0.15, 0.02), "gold", 0.13, 2.15, 0),
  );
  tent.position.copy(TENT_SPOT);
  return tent;
}

// this makes the whole play room
export function makePlayRoom(): Group {
  const room = new Group();
  room.add(makeCarpet(), ...makeWalls(), makeToys(), makeBallPit(), makeTent());
  return room;
}
