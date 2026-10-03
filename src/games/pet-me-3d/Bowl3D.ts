// Bowl3D.ts – Saydee's bowls in 3D: one with food, one with water. Mia designed this game.
import { CylinderGeometry, Group, Mesh, SphereGeometry, TorusGeometry } from "three";
import { paint } from "./paint";
import { FOOD_BITS, FOOD_COLOUR, WATER_COLOUR } from "./settings";

const BOWL_TOP: number = 0.55; // how wide the bowl is at the top
const BOWL_BOTTOM: number = 0.42; // and at the bottom
const BOWL_HEIGHT: number = 0.3;
const FOOD_SPREAD: number = 0.38; // how far from the middle the food can be
const FOOD_TOP: number = 0.33; // how high the food sits in the bowl
const WATER_TOP: number = 0.27; // how high the water comes up in the bowl
const FLAT: number = -Math.PI / 2;

// what is in a bowl
export type Filling = "food" | "water";

// this makes one bit of food, somewhere in the bowl
function makeFoodBit(): Mesh {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * FOOD_SPREAD;
  const bit = new Mesh(new SphereGeometry(0.07, 8, 6), paint(FOOD_COLOUR));
  bit.position.set(Math.cos(angle) * distance, FOOD_TOP + Math.random() * 0.05, Math.sin(angle) * distance);
  bit.castShadow = true;
  return bit;
}

// this makes the water: a flat, round pool inside the bowl
function makeWater(): Mesh {
  const water = new Mesh(new CylinderGeometry(BOWL_TOP - 0.05, BOWL_TOP - 0.05, 0.02, 32), paint(WATER_COLOUR));
  water.position.y = WATER_TOP;
  return water;
}

// a Bowl3D is one of her bowls, full of food or water
export class Bowl3D {
  model: Group;

  constructor(bowlColour: string, filling: Filling) {
    this.model = new Group();
    this.build(bowlColour, filling);
  }

  // this makes the bowl, its round edge, and what's inside
  build(bowlColour: string, filling: Filling): void {
    const bowl = new Mesh(new CylinderGeometry(BOWL_TOP, BOWL_BOTTOM, BOWL_HEIGHT, 32), paint(bowlColour));
    bowl.position.y = BOWL_HEIGHT / 2;
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    const edge = new Mesh(new TorusGeometry(BOWL_TOP, 0.05, 12, 48), paint(bowlColour));
    edge.rotation.x = FLAT;
    edge.position.y = BOWL_HEIGHT;
    this.model.add(bowl, edge);
    if (filling === "water") {
      this.model.add(makeWater());
      return;
    }
    for (let i = 0; i < FOOD_BITS; i++) this.model.add(makeFoodBit());
  }
}
