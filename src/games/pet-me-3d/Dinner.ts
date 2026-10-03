// Dinner.ts – dinner time: when the table is full, a Dinner button sits you down, your family comes to the table,
// and everyone eats their plate of food. Mia designed this game.
import type { Camera, Scene } from "three";
import { Clicking } from "./Clicking";
import type { FamilyWalker } from "./FamilyWalker";
import type { Game } from "./Game";
import { CHAIRS, TABLE_SPOT } from "./kitchen";
import type { Person3D } from "./Person3D";
import type { Plates3D } from "./Plates3D";
import { PopUpButton3D } from "./PopUpButton3D";

const BUTTON_HEIGHT: number = 2.6; // the Dinner button floats above the Sit button
const YOUR_PLACE: number = 0; // you sit in the first chair, and eat the first plate
const ON_YOUR_CHAIR: number = 0.2; // this close to your chair counts as sitting on it

// Dinner has the Dinner button, and makes everyone eat until the plates are empty
export class Dinner {
  plates: Plates3D;
  walkers: FamilyWalker[]; // your brother, Mum and Dad: they sit in the other three chairs
  eating: boolean; // is it dinner time right now
  buttons: PopUpButton3D[];
  clicking: Clicking;

  constructor(plates: Plates3D, walkers: FamilyWalker[]) {
    this.plates = plates;
    this.walkers = walkers;
    this.eating = false;
    this.buttons = [new PopUpButton3D("🍽️ Dinner", "dinner", TABLE_SPOT, BUTTON_HEIGHT, "middle")];
    this.clicking = new Clicking();
  }

  // this puts the Dinner button in the kitchen, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    for (const button of this.buttons) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this pops up the Dinner button when the table is full and you're near it
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    for (const button of this.buttons) {
      button.pop(!this.eating && this.plates.tableIsFull() && button.isNear(you.model.position), seconds);
    }
    const clicked = this.clicking.clickedButton(camera, this.buttons);
    if (clicked != null) game.doJob(clicked.job);
  }

  // this starts dinner: you sit in your chair, and everyone else comes to theirs
  begin(you: Person3D): void {
    if (this.eating || !this.plates.tableIsFull()) return;
    this.eating = true;
    you.sitDown(CHAIRS[YOUR_PLACE].spot, CHAIRS[YOUR_PLACE].facing);
    for (let i = 0; i < this.walkers.length; i++) this.walkers[i].comeToDinner(CHAIRS[i + 1]);
  }

  // this eats a bit of everyone's food while they sit at the table. When the plates are empty
  // (or you've got up and everyone else has finished), the table is cleared and everyone gets up
  eat(you: Person3D, seconds: number): void {
    if (!this.eating) return;
    const chair = CHAIRS[YOUR_PLACE].spot;
    const youAtTable = you.sitting && Math.hypot(you.model.position.x - chair.x, you.model.position.z - chair.z) < ON_YOUR_CHAIR;
    if (youAtTable) this.plates.eatFrom(YOUR_PLACE, seconds);
    let familyFinished = true;
    for (let i = 0; i < this.walkers.length; i++) {
      if (this.walkers[i].atDinner()) this.plates.eatFrom(i + 1, seconds);
      if (!this.plates.isEaten(i + 1)) familyFinished = false;
    }
    const youFinished = this.plates.isEaten(YOUR_PLACE) || !youAtTable;
    if (familyFinished && youFinished) this.finish();
  }

  // this clears the table and gets everyone up
  finish(): void {
    this.plates.clear();
    for (const walker of this.walkers) walker.dinnerIsOver();
    this.eating = false;
  }

  // this throws the button away when the game closes
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons) button.throwAway();
  }
}
