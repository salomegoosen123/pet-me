// SaydeeRide.ts – riding on Saydee's back, at home, at the park and at the beach: she carries you wherever
// you steer her with the arrow keys. Mia designed this game.
import { Vector3 } from "three";
import type { Camera, Scene } from "three";
import type { Keys } from "../../game-kit/useKeys";
import { Clicking } from "./Clicking";
import type { Dog3D } from "./Dog3D";
import type { Ask, Game } from "./Game";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";
import { SAYDEE_RIDE_SPEED } from "./settings";
import type { Stage3D } from "./stage";

// something that pushes Saydee back out of walls and things, wherever you are
export interface Bumper {
  (spot: Vector3, size: number): void;
}

const ON_HER_BACK: number = 0.5; // how high Saydee's back is
const BUTTON_OVER_SAYDEE: number = 1.3; // the Ride button floats over Saydee
const BUTTON_OVER_YOU: number = 1.6; // the Get off button floats over you
const HOP_OFF: Vector3 = new Vector3(0.7, 0, 0); // you hop off to the side of her

// SaydeeRide has the Ride and Get off buttons, and moves Saydee (with you on her back) with the arrow keys
export class SaydeeRide {
  riding: boolean; // are you on Saydee's back
  rideButton: PopUpButton3D | null;
  getOffButton: PopUpButton3D | null;
  clicking: Clicking;

  constructor() {
    this.riding = false;
    this.rideButton = null;
    this.getOffButton = null;
    this.clicking = new Clicking();
  }

  // this puts the buttons over Saydee and over you, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement, dog: Dog3D, you: Person3D): void {
    this.rideButton = new PopUpButton3D("🐶 Ride", "rideSaydee", dog.model.position, BUTTON_OVER_SAYDEE, "middle");
    this.getOffButton = new PopUpButton3D("👋 Get off", "getOffSaydee", you.model.position, BUTTON_OVER_YOU, "middle");
    scene.add(this.rideButton.model, this.getOffButton.model);
    this.clicking.listen(canvas);
  }

  // this pops up Ride when you're near Saydee (and she's not busy), and Get off while you're riding
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number, saydeeFree: boolean): void {
    if (this.rideButton == null || this.getOffButton == null) return;
    const canGetOn = !this.riding && saydeeFree && !you.isDown() && this.rideButton.isNear(you.model.position);
    this.rideButton.pop(canGetOn, seconds);
    this.getOffButton.pop(this.riding, seconds);
    const clicked = this.clicking.clickedButton(camera, [this.rideButton, this.getOffButton]);
    if (clicked != null) game.doJob(clicked.job);
  }

  // this gets you on or off, if you pressed a button
  press(asked: Ask | null, you: Person3D, dog: Dog3D): void {
    if (asked === "rideSaydee" && !this.riding) this.riding = true;
    if (asked !== "getOffSaydee" || !this.riding) return;
    this.riding = false;
    you.standUp();
    you.model.position.copy(dog.model.position).setY(0).add(HOP_OFF);
  }

  // this walks Saydee the way the arrow keys point (bumping into things, and never past the edge),
  // with you sitting on her back. It says if you're riding
  move(dog: Dog3D, you: Person3D, keys: Keys, stage: Stage3D, now: number, seconds: number, edge: number, bump: Bumper): boolean {
    if (!this.riding) return false;
    const forward = stage.groundForward();
    const right = new Vector3(-forward.z, 0, forward.x);
    const way = new Vector3();
    if (keys.isDown("ArrowUp")) way.add(forward);
    if (keys.isDown("ArrowDown")) way.sub(forward);
    if (keys.isDown("ArrowRight")) way.add(right);
    if (keys.isDown("ArrowLeft")) way.sub(right);
    if (way.lengthSq() > 0) {
      dog.model.position.addScaledVector(way.normalize(), SAYDEE_RIDE_SPEED * seconds);
      dog.model.rotation.y = Math.atan2(way.x, way.z);
      dog.hop(now);
      bump(dog.model.position, dog.bumpSize());
      const ground = new Vector3(dog.model.position.x, 0, dog.model.position.z);
      if (ground.length() > edge) {
        ground.setLength(edge);
        dog.model.position.x = ground.x;
        dog.model.position.z = ground.z;
      }
    }
    dog.wag(now, true);
    const back = dog.model.position.clone().setY(0);
    you.sitDown(back, dog.model.rotation.y, ON_HER_BACK);
    return true;
  }

  // this throws the buttons away when the game closes
  stop(): void {
    this.clicking.stop();
    if (this.rideButton != null) this.rideButton.throwAway();
    if (this.getOffButton != null) this.getOffButton.throwAway();
  }
}
