// SqueakyBone.ts – Saydee's squeaky bone at the park: she carries it proudly in her mouth, and it squeaks. Mia designed this game.
import { CylinderGeometry, Group, SphereGeometry, Vector3 } from "three";
import type { Camera, Scene } from "three";
import { beep } from "../../game-kit/beep";
import { Clicking } from "./Clicking";
import type { Dog3D } from "./Dog3D";
import type { Game } from "./Game";
import { makePart } from "./paint";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";
import { BONE_COLOUR, BONE_SQUEAKS, SQUEAK_PITCH, SQUEAK_SECONDS } from "./settings";

const BUTTON_HEIGHT: number = 2.6; // the Bone button floats high over Saydee, above the Unleash button
const IN_HER_MOUTH: number = 0.3; // how far in front of her collar she holds it
const TINY_BEEPS: number = 10; // how many tiny beeps slide together into one squeak
const TINY_BEEP_GAP_MS: number = 15; // each tiny beep comes this many thousandths of a second after the last
const TINY_BEEP_LENGTH: number = 0.02; // and lasts this long, in seconds
const SLIDE_UP: number = 1.8; // a squeak slides up to this many times higher than where it starts
const SQUEEZE_GAP_MS: number = 220; // she squeezes the bone twice, this far apart: squee-squoo!
const HIGH_SQUEAK: number = 1.3; // the first squeak is this many times higher than SQUEAK_PITCH: squee!
const LOW_SQUEAK: number = 0.7; // and the second one is lower: squoo!
const SIDEWAYS: number = Math.PI / 2;

// this plays one squeak: lots of tiny beeps, each a bit higher than the one before, so it slides up like a squeaky toy
function squeak(pitch: number): void {
  for (let i = 0; i < TINY_BEEPS; i++) {
    const tinyPitch = pitch * (1 + (SLIDE_UP - 1) * (i / (TINY_BEEPS - 1)));
    window.setTimeout(function tinyBeep(): void {
      beep(tinyPitch, TINY_BEEP_LENGTH);
    }, i * TINY_BEEP_GAP_MS);
  }
}

// this squeaks the bone twice, like when a dog chomps on it: a high squee, then a low squoo
function squeeSquoo(): void {
  squeak(SQUEAK_PITCH * HIGH_SQUEAK);
  window.setTimeout(function lowSqueak(): void {
    squeak(SQUEAK_PITCH * LOW_SQUEAK);
  }, SQUEEZE_GAP_MS);
}

// this makes the bone: a stick with two round knobs at each end
function makeBone(): Group {
  const bone = new Group();
  const stick = makePart(new CylinderGeometry(0.04, 0.04, 0.35, 8), BONE_COLOUR, 0, 0, 0);
  stick.rotation.z = SIDEWAYS;
  bone.add(stick);
  for (const x of [-0.18, 0.18]) {
    for (const z of [-0.04, 0.04]) bone.add(makePart(new SphereGeometry(0.06, 10, 8), BONE_COLOUR, x, 0, z));
  }
  return bone;
}

// SqueakyBone has the Bone button over Saydee, and the bone she carries once you give it to her
export class SqueakyBone {
  bone: Group;
  carrying: boolean; // does Saydee have her bone
  squeakLeft: number; // how long until the next squeak
  buttons: PopUpButton3D[];
  clicking: Clicking;

  constructor() {
    this.bone = makeBone();
    this.bone.visible = false;
    this.carrying = false;
    this.squeakLeft = SQUEAK_SECONDS;
    this.buttons = [];
    this.clicking = new Clicking();
  }

  // this puts the bone and the Bone button in the park, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement, dog: Dog3D): void {
    this.buttons = [new PopUpButton3D("🦴 Bone", "bone", dog.model.position, BUTTON_HEIGHT, "middle")];
    scene.add(this.bone);
    for (const button of this.buttons) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this pops up the Bone button when you're near Saydee and she hasn't got it yet
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    for (const button of this.buttons) button.pop(!this.carrying && button.isNear(you.model.position), seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons);
    if (clicked != null) game.doJob(clicked.job);
  }

  // this gives Saydee her bone
  giveIt(): void {
    this.carrying = true;
    this.squeakLeft = SQUEAK_SECONDS;
  }

  // this keeps the bone in her mouth (unless she's got the frisbee), and squeaks it every few seconds
  carry(dog: Dog3D, fetching: boolean, seconds: number): void {
    this.bone.visible = this.carrying && !fetching;
    if (!this.bone.visible) return;
    const ahead = new Vector3(Math.sin(dog.model.rotation.y), 0, Math.cos(dog.model.rotation.y));
    this.bone.position.copy(dog.collarSpot()).addScaledVector(ahead, IN_HER_MOUTH);
    this.bone.rotation.y = dog.model.rotation.y;
    if (!BONE_SQUEAKS) return; // Mia turned the squeak off
    this.squeakLeft = this.squeakLeft - seconds;
    if (this.squeakLeft > 0) return;
    squeeSquoo();
    this.squeakLeft = SQUEAK_SECONDS;
  }

  // this throws the button away when you go home
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons) button.throwAway();
  }
}
