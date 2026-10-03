// grandparents.ts – Ouma and Oupa: how they look, and their car, parked in your front garden when they come
// to fetch you and your brother. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, Vector3 } from "three";
import type { Object3D } from "three";
import { blockAround } from "./bumping";
import type { Block } from "./bumping";
import { makePart } from "./paint";
import { Person3D } from "./Person3D";
import type { PersonLook } from "./Person3D";
import {
  CAR_COLOUR, OUMA_HAIR_COLOUR, OUMA_SHIRT_COLOUR, OUPA_HAIR_COLOUR, OUPA_SHIRT_COLOUR, SKIN_COLOUR,
} from "./settings";

const SIDEWAYS: number = Math.PI / 2; // turns a wheel to stand up on its edge
const FACING_THE_HOUSE: number = Math.PI;

// Ouma, with her hair up in a bun, and Oupa, with short hair
export const OUMA_LOOK: PersonLook = {
  hair: OUMA_HAIR_COLOUR, skin: SKIN_COLOUR, shirt: OUMA_SHIRT_COLOUR, pants: "dimgray", size: 1, ponytail: true,
  blanket: "white",
};
export const OUPA_LOOK: PersonLook = {
  hair: OUPA_HAIR_COLOUR, skin: SKIN_COLOUR, shirt: OUPA_SHIRT_COLOUR, pants: "saddlebrown", size: 1, ponytail: false,
  blanket: "white",
};

// where their car is parked, and where they wait next to it, in your front garden
export const CAR_SPOT: Vector3 = new Vector3(5, 0, 12);
const OUMA_SPOT: Vector3 = new Vector3(3, 0, 10.4);
const OUPA_SPOT: Vector3 = new Vector3(4.2, 0, 10.4);

// the car, Ouma and Oupa: nobody can walk through them
export const GRANDPARENTS_BLOCKS: Block[] = [
  blockAround(CAR_SPOT, 2.4, 1.3),
  blockAround(OUMA_SPOT, 0.6, 0.6),
  blockAround(OUPA_SPOT, 0.6, 0.6),
];

// this makes Ouma and Oupa's car: a body, a cabin with windows, and four wheels
export function makeCar(): Group {
  const car = new Group();
  car.add(
    makePart(new BoxGeometry(2.4, 0.6, 1.2), CAR_COLOUR, 0, 0.55, 0),
    makePart(new BoxGeometry(1.3, 0.5, 1.1), CAR_COLOUR, -0.1, 1.1, 0),
    makePart(new BoxGeometry(1.2, 0.35, 1.12), "lightblue", -0.1, 1.12, 0),
  );
  for (const x of [-0.8, 0.8]) {
    for (const z of [-0.6, 0.6]) {
      const wheel = makePart(new CylinderGeometry(0.3, 0.3, 0.2, 16), "black", x, 0.3, z);
      wheel.rotation.x = SIDEWAYS;
      car.add(wheel);
    }
  }
  car.position.copy(CAR_SPOT);
  return car;
}

// this makes someone standing in a spot, facing a way
function standing(look: PersonLook, spot: Vector3, facing: number): Object3D {
  const person = new Person3D(look);
  person.model.position.copy(spot);
  person.model.rotation.y = facing;
  return person.model;
}

// this makes Ouma and Oupa waiting by their car in your front garden, ready to fetch you
export function makeGrandparentsVisit(): Object3D[] {
  return [makeCar(), standing(OUMA_LOOK, OUMA_SPOT, FACING_THE_HOUSE), standing(OUPA_LOOK, OUPA_SPOT, FACING_THE_HOUSE)];
}
