// TVRemote.ts – the On and Off buttons for a TV, and whether it's on. Mia designed this game.
import type { Camera, Scene, Vector3 } from "three";
import { Clicking } from "./Clicking";
import type { Ask, Game } from "./Game";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";

const BUTTON_HEIGHT: number = 2.3; // the buttons float just above the TV

// a TVRemote has an On button and an Off button that pop up when you walk up to the TV
export class TVRemote {
  on: boolean; // is the TV on
  onButton: PopUpButton3D;
  offButton: PopUpButton3D;
  clicking: Clicking;

  constructor(tvSpot: Vector3) {
    this.on = false;
    this.onButton = new PopUpButton3D("📺 On", "tvOn", tvSpot, BUTTON_HEIGHT, "middle");
    this.offButton = new PopUpButton3D("📺 Off", "tvOff", tvSpot, BUTTON_HEIGHT, "middle");
    this.clicking = new Clicking();
  }

  // this says both buttons
  buttons(): PopUpButton3D[] {
    return [this.onButton, this.offButton];
  }

  // this puts the buttons by the TV, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    for (const button of this.buttons()) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this pops up On when the TV is off, and Off when it's on, when you're near the TV
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    this.onButton.pop(!this.on && this.onButton.isNear(you.model.position), seconds);
    this.offButton.pop(this.on && this.offButton.isNear(you.model.position), seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons());
    if (clicked != null) game.doJob(clicked.job);
  }

  // this turns the TV on or off, if you asked
  press(asked: Ask | null): void {
    if (asked === "tvOn") this.on = true;
    if (asked === "tvOff") this.on = false;
  }

  // this throws the buttons away when the game closes
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons()) button.throwAway();
  }
}
