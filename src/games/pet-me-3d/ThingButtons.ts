// ThingButtons.ts – the buttons that pop up on things at home: Saydee's things, the fridge, the front door, the seats,
// your bed, and your wardrobe. Mia designed this game.
import { Vector3 } from "three";
import type { Camera, Scene } from "three";
import { WARDROBE_SPOT } from "./bedroom";
import { Clicking } from "./Clicking";
import type { Game } from "./Game";
import { CAR_SPOT } from "./grandparents";
import { BATH_SPOT, DOG_BED_MIDDLE, FOOD_BOWL_SPOT, WATER_BOWL_SPOT, YOUR_BED_MIDDLE } from "./homeSpots";
import { FRONT } from "./house";
import { FRIDGE_SPOT, TABLE_SPOT } from "./kitchen";
import { SOFA_SPOT } from "./livingRoom";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";

const FRONT_DOOR: Vector3 = new Vector3(0, 0, FRONT);

// this makes the buttons, each floating just above its thing
function makeButtons(): PopUpButton3D[] {
  return [
    new PopUpButton3D("🦴 Feed", "food", FOOD_BOWL_SPOT, 1.1, "middle"),
    new PopUpButton3D("💧 Water", "water", WATER_BOWL_SPOT, 1.1, "middle"),
    new PopUpButton3D("🛁 Bath", "bath", BATH_SPOT, 1.6, "middle"),
    new PopUpButton3D("💤 Sleep", "sleep", DOG_BED_MIDDLE, 1.1, "middle"),
    new PopUpButton3D("🍎 Apple", "apple", FRIDGE_SPOT, 2.7, "left"),
    new PopUpButton3D("🍖 Treat", "treat", FRIDGE_SPOT, 2.7, "right"),
    new PopUpButton3D("🌳 Park", "park", FRONT_DOOR, 2.8, "left"),
    new PopUpButton3D("🏖️ Beach", "beach", FRONT_DOOR, 2.8, "right"),
    new PopUpButton3D("🚗 Ouma & Oupa", "grandparents", CAR_SPOT, 2.4, "middle"),
    new PopUpButton3D("🪑 Sit", "sit", TABLE_SPOT, 1.6, "middle"),
    new PopUpButton3D("🪑 Sit", "sit", SOFA_SPOT, 1.6, "middle"),
    new PopUpButton3D("🛏️ Go to bed", "bed", YOUR_BED_MIDDLE, 1.6, "middle"),
    new PopUpButton3D("👙 Costume", "wearCostume", WARDROBE_SPOT, 2.8, "right"),
    new PopUpButton3D("🌙 PJs", "wearPJs", WARDROBE_SPOT, 3.95, "right"),
    new PopUpButton3D("👕 Clothes", "wearClothes", WARDROBE_SPOT, 3.95, "left"),
  ];
}

// ThingButtons pops up a button on a thing when you walk up to it, and does its job when you click it
export class ThingButtons {
  buttons: PopUpButton3D[];
  clicking: Clicking;

  constructor() {
    this.buttons = makeButtons();
    this.clicking = new Clicking();
  }

  // this puts the buttons in the home, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    for (const button of this.buttons) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this says if a button should be up: the fridge ones when you stand at the fridge with empty hands,
  // Sit and Go to bed only while you are standing, at the wardrobe only the one for what you're not wearing,
  // and the rest when you are close
  shouldPop(button: PopUpButton3D, game: Game, you: Person3D): boolean {
    const near = button.isNear(you.model.position);
    if (button.job === "apple" || button.job === "treat") return game.atFridge;
    if (button.job === "sit" || button.job === "bed") return near && !you.isDown();
    if (button.job === "wearCostume") return near && game.outfit !== "costume";
    if (button.job === "wearClothes") return near && game.outfit !== "clothes";
    if (button.job === "wearPJs") return near && game.outfit !== "pjs";
    return near;
  }

  // this pops up the buttons near you, and does a button's job if you clicked it
  update(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    for (const button of this.buttons) button.pop(this.shouldPop(button, game, you), seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons);
    if (clicked != null) game.doJob(clicked.job);
  }

  // this throws the buttons away when the game closes
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons) button.throwAway();
  }
}
