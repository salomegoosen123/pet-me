// OffLeash.ts – Saydee off her leash at the park: she zooms from tree to flower and stops to sniff. Mia designed this game.
import type { Camera, Scene, Vector3 } from "three";
import { Clicking } from "./Clicking";
import type { Dog3D } from "./Dog3D";
import type { Game } from "./Game";
import { ON_FLOOR } from "./homeSpots";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";
import { SNIFF_SECONDS, ZOOM_SPEED } from "./settings";

const BUTTON_HEIGHT: number = 1.3; // how high the buttons float over Saydee
const GIVE_UP_SECONDS: number = 5; // if something is in her way, she gives up and zooms somewhere else

// OffLeash has the Unleash and Leash on buttons over Saydee, and makes her run free while her leash is off
export class OffLeash {
  buttons: PopUpButton3D[];
  clicking: Clicking;
  sniffSpots: Vector3[]; // the trees and flowers she zooms to
  goingTo: Vector3 | null; // where she is zooming to, or null while she sniffs
  timeLeft: number; // how much longer she sniffs, or keeps trying to get there

  constructor() {
    this.buttons = [];
    this.clicking = new Clicking();
    this.sniffSpots = [];
    this.goingTo = null;
    this.timeLeft = 0;
  }

  // this puts the buttons over Saydee, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement, dog: Dog3D, sniffSpots: Vector3[]): void {
    this.buttons = [
      new PopUpButton3D("🐾 Unleash", "unleash", dog.model.position, BUTTON_HEIGHT, "middle"),
      new PopUpButton3D("🔗 Leash on", "leashOn", dog.model.position, BUTTON_HEIGHT, "middle"),
    ];
    for (const button of this.buttons) scene.add(button.model);
    this.clicking.listen(canvas);
    this.sniffSpots = sniffSpots;
  }

  // this pops up Unleash while she's on her leash, and Leash on when she's free and you're close to her
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    for (const button of this.buttons) {
      const up = button.job === "unleash" ? game.leashOn : !game.leashOn && button.isNear(you.model.position);
      button.pop(up, seconds);
    }
    const clicked = this.clicking.clickedButton(camera, this.buttons);
    if (clicked != null) game.doJob(clicked.job);
  }

  // this makes her zoom to a tree or a flower, sniff it, then zoom off to the next one
  runFree(dog: Dog3D, now: number, seconds: number): void {
    this.timeLeft = this.timeLeft - seconds;
    if (this.goingTo == null) {
      dog.nom(now);
      dog.wag(now);
      if (this.timeLeft <= 0) this.pickNextSpot();
      return;
    }
    const there = dog.walkTowards(this.goingTo, ZOOM_SPEED, seconds);
    dog.wag(now, true);
    dog.hop(now * 2);
    if (there) {
      this.goingTo = null;
      this.timeLeft = SNIFF_SECONDS;
    } else if (this.timeLeft <= 0) {
      this.pickNextSpot();
    }
  }

  // this picks a tree or a flower for her to zoom to
  pickNextSpot(): void {
    if (this.sniffSpots.length === 0) return;
    const spot = this.sniffSpots[Math.floor(Math.random() * this.sniffSpots.length)];
    this.goingTo = spot.clone().setY(ON_FLOOR);
    this.timeLeft = GIVE_UP_SECONDS;
  }

  // this throws the buttons away when you go home
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons) button.throwAway();
  }
}
