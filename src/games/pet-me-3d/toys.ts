// toys.ts – the play room toys that can fly about: balls from the ball pit, and blocks, balls and little cars
// from the toy box. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, SphereGeometry } from "three";
import type { Object3D } from "three";
import { makePart } from "./paint";
import { BALL_PIT_COLOURS, TOY_COLOURS } from "./settings";

const BALL_SIZE: number = 0.12; // the same as the balls in the ball pit
const BLOCK_SIZE: number = 0.2;
const WHEEL_SIZE: number = 0.04;
const KINDS_OF_TOY: number = 3; // blocks, balls and cars

// this picks one colour from a list
function anyOf(colours: string[]): string {
  return colours[Math.floor(Math.random() * colours.length)];
}

// this makes one ball from the ball pit
export function makeBall(): Object3D {
  return makePart(new SphereGeometry(BALL_SIZE, 10, 8), anyOf(BALL_PIT_COLOURS), 0, 0, 0);
}

// this makes a little car, with four black wheels
function makeCar(): Object3D {
  const car = new Group();
  car.add(makePart(new BoxGeometry(0.3, 0.1, 0.16), anyOf(TOY_COLOURS), 0, 0, 0));
  for (const x of [-0.09, 0.09]) {
    for (const z of [-0.09, 0.09]) {
      const wheel = makePart(new CylinderGeometry(WHEEL_SIZE, WHEEL_SIZE, 0.03, 10), "black", x, -0.05, z);
      wheel.rotation.x = Math.PI / 2;
      car.add(wheel);
    }
  }
  return car;
}

// this makes a toy from the toy box: a block, a ball or a little car, in any colour
export function makeToy(): Object3D {
  const kind = Math.floor(Math.random() * KINDS_OF_TOY);
  if (kind === 0) return makePart(new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), anyOf(TOY_COLOURS), 0, 0, 0);
  if (kind === 1) return makePart(new SphereGeometry(BALL_SIZE, 10, 8), anyOf(TOY_COLOURS), 0, 0, 0);
  return makeCar();
}
