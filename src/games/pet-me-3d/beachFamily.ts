// beachFamily.ts – your family at the beach, relaxing on towels under their own umbrella, with a towel for you too. Mia designed this game.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Vector3 } from "three";
import type { Mesh, Object3D } from "three";
import { BROTHER_COSTUME, DAD_LOOK, MUM_LOOK } from "./family";
import { makePart } from "./paint";
import { Person3D } from "./Person3D";
import { FAMILY_UMBRELLA_COLOUR, TOWEL_COLOURS } from "./settings";

const FAMILY_SPOT: Vector3 = new Vector3(-5, 0, -4); // where your family's umbrella stands
const TOWEL_APART: number = 1.2; // how far apart the towels are
const TOWEL_LENGTH: number = 2.4;
const TOWEL_TOP: number = 0.02; // how thick a towel is
const LYING_DOWN: number = 0.3; // how high someone is from the towel when lying on their back
const FACING_THE_SEA: number = Math.PI;

const TOWEL_COUNT: number = 4; // Mum's, your brother's, Dad's, and yours
const YOURS: number = 3; // your towel is the last one, next to Dad's
const BROTHERS: number = 1; // your brother's towel is in the middle of your family's

// this says where the middle of each towel is: Mum's on the left, then your brother's, then Dad's, then yours
function towelSpot(which: number): Vector3 {
  return FAMILY_SPOT.clone().add(new Vector3((which - 1) * TOWEL_APART, 0, 0));
}

// this says where someone's feet go when they lie on a towel, with their head towards the sea
function feetOnTowel(which: number): Vector3 {
  return towelSpot(which).add(new Vector3(0, TOWEL_TOP + LYING_DOWN, TOWEL_LENGTH / 2 - 0.1));
}

// your own towel: where it is, and where your feet go when you lie on it
export const YOUR_TOWEL_SPOT: Vector3 = towelSpot(YOURS);
export const YOUR_TOWEL_FEET: Vector3 = feetOnTowel(YOURS);

// your brother's towel, where he goes back to after a swim
export const BROTHER_TOWEL_SPOT: Vector3 = towelSpot(BROTHERS);

// this makes one towel, in a colour from the list
function makeTowel(which: number): Mesh {
  const spot = towelSpot(which);
  const colour = TOWEL_COLOURS[which % TOWEL_COLOURS.length];
  return makePart(new BoxGeometry(1, TOWEL_TOP, TOWEL_LENGTH), colour, spot.x, TOWEL_TOP / 2, spot.z);
}

// this makes someone lying on their back on a towel, sunbathing, with their head towards the sea
function lyingOnTowel(person: Person3D, which: number): Person3D {
  person.lieDown(feetOnTowel(which), false);
  return person;
}

// this makes someone sitting on a towel, looking at the sea
function sittingOnTowel(person: Person3D, which: number): Person3D {
  person.sitDown(towelSpot(which), FACING_THE_SEA, TOWEL_TOP);
  return person;
}

// your BeachFamily: Mum and Dad sunbathing, and your brother sitting between them, under a big umbrella
export class BeachFamily {
  brother: Person3D; // he comes to build sandcastles with you
  people: Person3D[];

  constructor() {
    this.brother = sittingOnTowel(new Person3D(BROTHER_COSTUME), BROTHERS); // he always wears his costume at the beach
    this.people = [lyingOnTowel(new Person3D(MUM_LOOK), 0), this.brother, lyingOnTowel(new Person3D(DAD_LOOK), 2)];
  }

  // this sits your brother back down on his towel
  brotherBackToHisTowel(): void {
    sittingOnTowel(this.brother, BROTHERS);
  }

  // this says everything to put on the beach: the umbrella, the towels, and your family
  models(): Object3D[] {
    const things: Object3D[] = [
      makePart(new CylinderGeometry(0.05, 0.05, 2.4, 8), "white", FAMILY_SPOT.x, 1.2, FAMILY_SPOT.z - 1.3),
      makePart(new ConeGeometry(2, 0.7, 24), FAMILY_UMBRELLA_COLOUR, FAMILY_SPOT.x, 2.5, FAMILY_SPOT.z - 1.3),
    ];
    for (let which = 0; which < TOWEL_COUNT; which++) things.push(makeTowel(which));
    for (const person of this.people) things.push(person.model);
    return things;
  }

  // this says where your family and their umbrella are, so you and Saydee bump into them (and don't walk over them).
  // Your own towel is left free, so you can walk up to it
  spots(): Vector3[] {
    const spots: Vector3[] = [FAMILY_SPOT.clone().add(new Vector3(0, 0, -1.3))];
    for (let which = 0; which < YOURS; which++) {
      for (const along of [-0.8, 0, 0.8]) spots.push(towelSpot(which).add(new Vector3(0, 0, along)));
    }
    return spots;
  }
}
