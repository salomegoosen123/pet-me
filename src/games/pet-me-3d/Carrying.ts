// Carrying.ts – what you carry from the fridge: an apple for you (or your brother), or a treat for Saydee. Mia designed this game.
import type { Group } from "three";
import type { Dog3D } from "./Dog3D";
import type { Person3D } from "./Person3D";
import { Snack3D } from "./Snack3D";
import { throwAwayAll } from "./stage";
import { makeTreat } from "./Treat3D";

const TREAT_REACH: number = 1.3; // walk this close to Saydee with a treat, and she takes it

// Carrying keeps track of what is in your hand
export class Carrying {
  apple: Snack3D | null;
  treat: Group | null;

  constructor() {
    this.apple = null;
    this.treat = null;
  }

  // this says if your hands are empty
  handsEmpty(): boolean {
    return this.apple == null && this.treat == null;
  }

  // this puts an apple in your hand
  takeApple(you: Person3D): void {
    if (!this.handsEmpty()) return;
    this.apple = new Snack3D();
    you.hold(this.apple.model);
  }

  // this puts a treat in your hand
  takeTreat(you: Person3D): void {
    if (!this.handsEmpty()) return;
    this.treat = makeTreat();
    you.hold(this.treat);
  }

  // this eats your apple bite by bite, while you sit at the table
  eatAtTable(you: Person3D, seconds: number): void {
    if (this.apple == null || !you.sitting) return;
    if (!this.apple.nibble(seconds)) return;
    you.letGo(this.apple.model);
    throwAwayAll(this.apple.model);
    this.apple = null;
  }

  // this takes the apple out of your hand, to give to someone else (or says null if you haven't got one)
  giveAwayApple(you: Person3D): Snack3D | null {
    const apple = this.apple;
    if (apple == null) return null;
    you.letGo(apple.model);
    this.apple = null;
    return apple;
  }

  // this gives Saydee your treat when you walk up to her, and says if she got it
  handOver(you: Person3D, dog: Dog3D): boolean {
    if (this.treat == null) return false;
    if (you.model.position.distanceTo(dog.model.position) > TREAT_REACH) return false;
    you.letGo(this.treat);
    throwAwayAll(this.treat);
    this.treat = null;
    return true;
  }
}
