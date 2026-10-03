// Snack3D.ts – an apple from the fridge, for you to eat at the table. Mia designed this game.
import { CylinderGeometry, Group, SphereGeometry } from "three";
import { makePart } from "./paint";
import { SNACK_BITES, SNACK_COLOUR, SNACK_EAT_SECONDS } from "./settings";

const LEAF_SHAPE: [number, number, number] = [1.4, 0.4, 0.8]; // a flat little leaf

// a Snack3D is an apple you can hold, and eat bite by bite
export class Snack3D {
  model: Group;
  eaten: number; // how much has been eaten, from 0 (none) to 1 (all gone)

  constructor() {
    this.model = new Group();
    this.eaten = 0;
    this.build();
  }

  // this makes the apple, with a stem and a leaf
  build(): void {
    const apple = makePart(new SphereGeometry(0.14, 20, 14), SNACK_COLOUR, 0, 0, 0);
    const stem = makePart(new CylinderGeometry(0.012, 0.012, 0.08, 6), "saddlebrown", 0, 0.16, 0);
    const leaf = makePart(new SphereGeometry(0.04, 8, 6), "green", 0.04, 0.17, 0);
    leaf.scale.set(...LEAF_SHAPE);
    this.model.add(apple, stem, leaf);
  }

  // this eats a little more of it, one bite at a time, and says if it's all gone
  nibble(seconds: number): boolean {
    this.eaten = Math.min(1, this.eaten + seconds / SNACK_EAT_SECONDS);
    const bitesTaken = Math.floor(this.eaten * SNACK_BITES) / SNACK_BITES;
    this.model.scale.setScalar(Math.max(0.05, 1 - bitesTaken));
    return this.eaten >= 1;
  }
}
