// grandparentsPlace.ts – Ouma and Oupa's place: their cottage in a garden full of flowers.
// Inside, Ouma cooks in the kitchen and Oupa sits in his rocking chair by the fire. Mia designed this game.
import type { Mesh, Scene, Vector3 } from "three";
import { cottagePosts, insideCottage, makeCottage } from "./cottage";
import { AT_THE_STOVE, furniturePosts, makeCottageFurniture, ROCKING_CHAIR } from "./cottageFurniture";
import { GrandparentsPlay } from "./GrandparentsPlay";
import { OUMA_LOOK, OUPA_LOOK } from "./grandparents";
import { makeFlowers, makeGrass } from "./parkThings";
import { Person3D } from "./Person3D";
import type { PlayPlace } from "./ride";
import type { Scenery } from "./scenery";
import { SKY_COLOUR } from "./settings";

const GARDEN_EDGE: number = 16; // you can't walk farther than this from the middle of the garden
const FACING_THE_STOVE: number = Math.PI;

// this says if a flower is out in the garden (not inside the cottage)
function inTheGarden(flower: Mesh): boolean {
  return !insideCottage(flower.position);
}

// this says where someone is
function whereTheyAre(person: Person3D): Vector3 {
  return person.model.position;
}

// this makes Ouma, standing at the stove
function makeOuma(): Person3D {
  const ouma = new Person3D(OUMA_LOOK);
  ouma.model.position.copy(AT_THE_STOVE);
  ouma.model.rotation.y = FACING_THE_STOVE;
  return ouma;
}

// this makes Oupa, sitting in his rocking chair
function makeOupa(): Person3D {
  const oupa = new Person3D(OUPA_LOOK);
  oupa.sitDown(ROCKING_CHAIR.spot, ROCKING_CHAIR.facing);
  return oupa;
}

// Ouma and Oupa's place: grass, flowers, and their cottage with everything inside
export class GrandparentsScenery implements Scenery {
  skyColour: string = SKY_COLOUR;
  edge: number = GARDEN_EDGE;
  swimEdge: number = GARDEN_EDGE; // there's no sea here
  saydeeComes: boolean = false; // Saydee stays at home when Ouma and Oupa fetch you
  canDig: boolean = false;
  canUnleash: boolean = false;
  hasBone: boolean = false;
  hasBadGuys: boolean = false;
  playPlace: PlayPlace = new GrandparentsPlay(); // your brother following you, and the roof that lifts off
  grandparents: Person3D[] = [makeOuma(), makeOupa()];

  // this puts the grass, the flowers, the cottage and everything in it, and Ouma and Oupa in the garden
  build(scene: Scene): void {
    scene.add(makeGrass(), ...makeFlowers().filter(inTheGarden), makeCottage(), makeCottageFurniture());
    for (const person of this.grandparents) scene.add(person.model);
  }

  // Saydee isn't here, so there's nothing for her to sniff
  sniffSpots(): Vector3[] {
    return [];
  }

  // nothing moves by itself here yet
  move(): void {
    return;
  }

  // there are no other dogs here
  otherDogs(): Vector3[] {
    return [];
  }

  // Ouma and Oupa, so you bump into them
  otherPeople(): Vector3[] {
    return this.grandparents.map(whereTheyAre);
  }

  // the cottage walls and all the furniture
  fixedThings(): Vector3[] {
    return [...cottagePosts(), ...furniturePosts()];
  }
}
