// Plates3D.ts – the plates of food Mum puts on the kitchen table, one at each place, that get eaten at dinner. Mia designed this game.
import { CylinderGeometry, Group, SphereGeometry, Vector3 } from "three";
import { PLATE_SPOTS } from "./kitchen";
import { makePart } from "./paint";
import { DINNER_SECONDS, SOUP_COLOUR } from "./settings";

const IN_HER_HANDS: Vector3 = new Vector3(0, -0.1, 0); // a plate sits just under Mum's hand while she carries it

// this makes a plate of food: a white plate, a pile of food, and some green peas
function makePlate(): Group {
  const plate = new Group();
  const food = makePart(new SphereGeometry(0.14, 16, 10), SOUP_COLOUR, 0, 0.04, 0);
  food.scale.set(1, 0.5, 1);
  plate.add(makePart(new CylinderGeometry(0.22, 0.2, 0.03, 24), "white", 0, 0, 0), food);
  for (const [x, z] of [[0.12, 0.05], [-0.1, 0.1], [0.05, -0.13]]) {
    plate.add(makePart(new SphereGeometry(0.03, 8, 6), "limegreen", x, 0.04, z));
  }
  plate.visible = false;
  return plate;
}

// this says a plate is full of food
function full(): number {
  return 1;
}

// Plates3D is the four plates: how many are on the table, and how much food is left on each
export class Plates3D {
  plates: Group[]; // one plate for each place at the table
  foodLeft: number[]; // how much food is left on each plate: 1 is full, 0 is all eaten
  onTable: number; // how many plates Mum has put on the table so far

  constructor() {
    this.plates = PLATE_SPOTS.map(makePlate);
    this.foodLeft = PLATE_SPOTS.map(full);
    this.onTable = 0;
  }

  // this says if every place at the table has its plate
  tableIsFull(): boolean {
    return this.onTable >= this.plates.length;
  }

  // this puts the next plate of food in Mum's hands
  serveUp(hand: Vector3): void {
    const plate = this.plates[this.onTable];
    plate.visible = true;
    plate.position.copy(hand).add(IN_HER_HANDS);
  }

  // this puts the plate Mum is carrying in the next empty place at the table
  putDown(): void {
    this.plates[this.onTable].position.copy(PLATE_SPOTS[this.onTable]);
    this.onTable = this.onTable + 1;
  }

  // this eats a bit of the food on one plate, and says if that plate is empty
  eatFrom(place: number, seconds: number): boolean {
    this.foodLeft[place] = Math.max(0, this.foodLeft[place] - seconds / DINNER_SECONDS);
    const plate = this.plates[place];
    for (let i = 1; i < plate.children.length; i++) plate.children[i].scale.setScalar(Math.max(0.01, this.foodLeft[place]));
    return this.foodLeft[place] <= 0;
  }

  // this says if a plate is empty
  isEaten(place: number): boolean {
    return this.foodLeft[place] <= 0;
  }

  // this clears the table after dinner, so Mum can start cooking again
  clear(): void {
    for (let place = 0; place < this.plates.length; place++) {
      this.plates[place].visible = false;
      this.foodLeft[place] = 1;
      for (let i = 1; i < this.plates[place].children.length; i++) this.plates[place].children[i].scale.setScalar(1);
    }
    this.onTable = 0;
  }
}
