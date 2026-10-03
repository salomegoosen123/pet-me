// ToyFountain.ts – press ⛲ Fountain at the toy box, and toys shoot up out of it and land all over the play room
// floor. What a mess! Mia designed this game.
import { FlyingToys } from "./FlyingToys";
import type { Ask } from "./Game";
import type { Person3D } from "./Person3D";
import { TOY_BOX_SPOT } from "./playRoom";
import { PopUpButton3D } from "./PopUpButton3D";
import { FOUNTAIN_SECONDS, MOST_TOYS_OUT } from "./settings";
import { makeToy } from "./toys";

const TOY_BOX_SIZE: number = 0.8; // how wide the toy box's open top is
const ONE_EVERY: number = 0.12; // how often a toy shoots out while the fountain's going
const BUTTON_HEIGHT: number = 2.3; // the Fountain button floats over the Teddy button

// ToyFountain is the Fountain button, and the toys it throws out of the toy box
export class ToyFountain {
  toys: FlyingToys;
  button: PopUpButton3D;
  timeLeft: number; // how much longer the fountain goes

  constructor() {
    this.toys = new FlyingToys(TOY_BOX_SPOT, TOY_BOX_SIZE, makeToy, ONE_EVERY, MOST_TOYS_OUT);
    this.button = new PopUpButton3D("⛲ Fountain", "fountain", TOY_BOX_SPOT, BUTTON_HEIGHT, "middle");
    this.timeLeft = 0;
  }

  // this pops up the Fountain button when you're near the toy box (and the fountain isn't going already)
  popButton(you: Person3D, free: boolean, seconds: number): void {
    this.button.pop(free && this.timeLeft <= 0 && this.button.isNear(you.model.position), seconds);
  }

  // this starts the fountain, if you pressed the button
  press(asked: Ask | null): void {
    if (asked === "fountain" && this.timeLeft <= 0) this.timeLeft = FOUNTAIN_SECONDS;
  }

  // this shoots toys out while the fountain's going, and moves the ones that are out
  update(you: Person3D, seconds: number): void {
    this.timeLeft = Math.max(0, this.timeLeft - seconds);
    this.toys.update(you, this.timeLeft > 0, seconds);
  }

  // this says if there are toys out of the toy box
  messy(): boolean {
    return this.toys.toys.length > 0;
  }
}
