// BrotherGifts.ts – giving things to your brother: an apple (he eats it), and a present from your wardrobe
// (he opens it and finds a toy car). The teddy is in HomePlay.ts, with the toy box. Mia designed this game.
import { Vector3 } from "three";
import type { Camera, Group, Scene } from "three";
import { WARDROBE_SPOT } from "./bedroom";
import { Clicking } from "./Clicking";
import type { Ask, Game } from "./Game";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";
import { makePresent, makeToyCar } from "./present";
import type { Snack3D } from "./Snack3D";
import { throwAwayAll } from "./stage";

const APPLE_BUTTON_HEIGHT: number = 2.2; // the apple Give button floats over your brother's head
const PRESENT_BUTTON_HEIGHT: number = 3.4; // the present Give button floats higher, above the teddy ones
const WARDROBE_BUTTON_HEIGHT: number = 2.8; // the Present button floats over the wardrobe, next to the Costume one
const IN_HANDS: Vector3 = new Vector3(0, -0.15, 0.05); // the present sits just under a hand
const OPEN_AFTER: number = 2; // your brother opens his present this many seconds after you give it to him
const POP_SECONDS: number = 0.4; // how long the present takes to shrink away, and the car to pop up

// where the present is: in the wardrobe, in your hands, in your brother's hands, or opened (and he has the car)
type PresentWith = "closet" | "you" | "brother" | "opened";

// BrotherGifts has the Give buttons over your brother and the Present button on the wardrobe, and the gifts themselves
export class BrotherGifts {
  brother: Person3D;
  snack: Snack3D | null; // the apple he's eating (or null)
  present: Group;
  car: Group; // the toy car inside the present
  presentWith: PresentWith;
  openTime: number; // how long your brother has had his present (he opens it after a moment)
  giveAppleButton: PopUpButton3D;
  takePresentButton: PopUpButton3D;
  givePresentButton: PopUpButton3D;
  clicking: Clicking;

  constructor(brother: Person3D) {
    this.brother = brother;
    this.snack = null;
    this.present = makePresent();
    this.car = makeToyCar();
    this.presentWith = "closet";
    this.openTime = 0;
    this.giveAppleButton = new PopUpButton3D("🍎 Give", "giveApple", brother.model.position, APPLE_BUTTON_HEIGHT, "middle");
    this.takePresentButton = new PopUpButton3D("🎁 Present", "takePresent", WARDROBE_SPOT, WARDROBE_BUTTON_HEIGHT, "left");
    this.givePresentButton = new PopUpButton3D("🎁 Give", "givePresent", brother.model.position, PRESENT_BUTTON_HEIGHT, "middle");
    this.clicking = new Clicking();
  }

  // this says all the buttons
  buttons(): PopUpButton3D[] {
    return [this.giveAppleButton, this.takePresentButton, this.givePresentButton];
  }

  // this puts the present and the buttons in the home, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    scene.add(this.present, this.car);
    for (const button of this.buttons()) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this pops up each button when you're near it and it can be used, and asks for it if you click it
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number, youHaveApple: boolean): void {
    const spot = you.model.position;
    this.giveAppleButton.pop(youHaveApple && this.snack == null && this.giveAppleButton.isNear(spot), seconds);
    this.takePresentButton.pop(this.presentWith === "closet" && this.takePresentButton.isNear(spot), seconds);
    this.givePresentButton.pop(this.presentWith === "you" && this.givePresentButton.isNear(spot), seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons());
    if (clicked != null) game.doJob(clicked.job);
  }

  // this takes the present out of the wardrobe, or gives it to your brother, if you asked
  movePresent(asked: Ask | null): void {
    if (asked === "takePresent" && this.presentWith === "closet") {
      this.presentWith = "you";
      this.present.visible = true;
    }
    if (asked === "givePresent" && this.presentWith === "you") {
      this.presentWith = "brother";
      this.openTime = 0;
    }
  }

  // this puts the apple in your brother's hand
  takeApple(apple: Snack3D): void {
    this.brother.hold(apple.model);
    this.snack = apple;
  }

  // this keeps the present in whoever's hands it's in (your brother opens his), and has him eat his apple bite by bite
  update(you: Person3D, seconds: number): void {
    if (this.presentWith === "you") this.holdPresent(you);
    if (this.presentWith === "brother" || this.presentWith === "opened") this.openIt(seconds);
    if (this.snack == null || !this.snack.nibble(seconds)) return;
    this.brother.letGo(this.snack.model);
    throwAwayAll(this.snack.model);
    this.snack = null;
  }

  // this keeps the present in someone's hands
  holdPresent(person: Person3D): void {
    this.present.position.copy(person.handSpot()).add(IN_HANDS);
    this.present.rotation.y = person.model.rotation.y;
  }

  // this has your brother hold his present for a moment, then open it: it shrinks away and the toy car pops up
  openIt(seconds: number): void {
    this.openTime = this.openTime + seconds;
    this.holdPresent(this.brother);
    this.car.position.copy(this.present.position);
    this.car.rotation.y = this.present.rotation.y;
    if (this.openTime < OPEN_AFTER) return;
    this.presentWith = "opened";
    const popped = Math.min(1, (this.openTime - OPEN_AFTER) / POP_SECONDS); // 0 just opened, 1 all done
    this.present.scale.setScalar(Math.max(0.01, 1 - popped));
    this.present.visible = popped < 1;
    this.car.visible = true;
    this.car.scale.setScalar(Math.max(0.01, popped));
  }

  // this throws the buttons away when the game closes
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons()) button.throwAway();
  }
}
