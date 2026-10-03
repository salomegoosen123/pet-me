// Cooking3D.ts – Mum cooking at the stove: a pot of soup with steam puffing up. Each time the food is ready
// she carries a plate to the kitchen table, until there's a plate at all four places. Mia designed this game.
import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from "three";
import type { Object3D } from "three";
import type { Hobby } from "./hobby";
import { COUNTER_SPOT, TABLE_SPOT } from "./kitchen";
import { makePart } from "./paint";
import type { Person3D } from "./Person3D";
import { Plates3D } from "./Plates3D";
import { COOKING_SECONDS, SOUP_COLOUR } from "./settings";

const BURNER: Vector3 = COUNTER_SPOT.clone().add(new Vector3(1.1, 1, 0)); // the stove on the counter
export const STOVE_SPOT: Vector3 = new Vector3(BURNER.x, 0, COUNTER_SPOT.z + 1.05); // where Mum stands to cook
const BY_THE_TABLE: Vector3 = TABLE_SPOT.clone().add(new Vector3(-1.2, 0, 0)); // where Mum stands to put a plate down
const REACH_THE_TABLE: number = 1.6; // this close to the table, Mum can put a plate down
const PUFF_COUNT: number = 6; // how many puffs of steam there are
const PUFF_SPEED: number = 0.6; // how fast the steam floats up
const PUFF_RISE: number = 1.2; // how high the steam floats before it's gone

// Cooking3D is the pot on the stove, the steam while Mum cooks, and the plates of food she makes
export class Cooking3D implements Hobby {
  spot: Vector3;
  model: Group;
  puffs: Mesh[];
  plates: Plates3D;
  carrying: boolean; // is Mum carrying a plate to the table
  atStove: boolean; // is Mum at the stove right now
  cookTime: number; // how long Mum has been cooking the next plate of food

  constructor() {
    this.spot = STOVE_SPOT;
    this.model = new Group();
    this.puffs = [];
    this.plates = new Plates3D();
    this.carrying = false;
    this.atStove = false;
    this.cookTime = 0;
    this.build();
  }

  // this makes the pot, full of soup, and the puffs of steam above it
  build(): void {
    this.model.add(
      makePart(new CylinderGeometry(0.22, 0.2, 0.25, 20), "dimgray", 0, 0.13, 0),
      makePart(new CylinderGeometry(0.2, 0.2, 0.02, 20), SOUP_COLOUR, 0, 0.24, 0),
    );
    for (let i = 0; i < PUFF_COUNT; i++) {
      const puff = new Mesh(new SphereGeometry(0.08, 10, 8), new MeshStandardMaterial({ color: "white", transparent: true }));
      this.puffs.push(puff);
      this.model.add(puff);
    }
    this.model.position.copy(BURNER);
  }

  // this says the things to put in the kitchen: the pot and steam, and the plates
  models(): Object3D[] {
    return [this.model, ...this.plates.plates];
  }

  // this cooks while Mum is at the stove, then has her carry each plate to the table
  update(person: Person3D, doingIt: boolean, now: number, seconds: number): void {
    this.atStove = doingIt;
    this.puffSteam(doingIt, now);
    if (doingIt) person.faceTowards(BURNER);
    if (doingIt && !this.carrying && !this.plates.tableIsFull()) this.cook(seconds);
    if (this.carrying) this.carry(person);
  }

  // this cooks a bit more, and when the food is ready, Mum picks up the next plate
  cook(seconds: number): void {
    this.cookTime = this.cookTime + seconds;
    if (this.cookTime < COOKING_SECONDS) return;
    this.cookTime = 0;
    this.carrying = true;
  }

  // this keeps the plate in Mum's hands, and puts it in the next empty place when she gets to the table
  carry(person: Person3D): void {
    const spot = person.model.position;
    if (Math.hypot(spot.x - TABLE_SPOT.x, spot.z - TABLE_SPOT.z) < REACH_THE_TABLE) {
      this.plates.putDown();
      this.carrying = false;
      return;
    }
    this.plates.serveUp(person.handSpot());
  }

  // this keeps Mum at the stove until the food is ready, while there are still empty places at the table
  keepsThemBusy(): boolean {
    return !this.carrying && !this.plates.tableIsFull();
  }

  // this sends Mum to the table with a plate, and back to the stove to cook the next one, until the table is full
  errand(): Vector3 | null {
    if (this.carrying) return BY_THE_TABLE;
    if (!this.atStove && !this.plates.tableIsFull()) return STOVE_SPOT;
    return null;
  }

  // this puffs steam up out of the pot while Mum cooks
  puffSteam(cooking: boolean, now: number): void {
    for (let i = 0; i < this.puffs.length; i++) {
      const puff = this.puffs[i];
      const up = (now * PUFF_SPEED + i / PUFF_COUNT) % 1; // 0 just out of the pot, 1 all the way up
      puff.visible = cooking;
      puff.position.set(Math.sin(now + i) * 0.08, 0.3 + up * PUFF_RISE, 0);
      puff.scale.setScalar(0.6 + up * 1.5);
      if (puff.material instanceof MeshStandardMaterial) puff.material.opacity = 1 - up;
    }
  }
}
