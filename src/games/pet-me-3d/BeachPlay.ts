// BeachPlay.ts – playing at the beach: relaxing on your own towel, building a sandcastle with your brother,
// and swimming in the sea together. Mia designed this game.
import type { Camera, Scene, Vector3 } from "three";
import type { Keys } from "../../game-kit/useKeys";
import { YOUR_TOWEL_FEET, YOUR_TOWEL_SPOT } from "./beachFamily";
import type { BeachFamily } from "./beachFamily";
import { followYouOutside } from "./brotherOutside";
import { Clicking } from "./Clicking";
import type { Ask, Game } from "./Game";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";
import type { PlayPlace, Ride } from "./ride";
import { Sandcastle3D, SANDCASTLE_SPOT } from "./Sandcastle3D";
import { SandcastleRide } from "./SandcastleRide";
import { SeaSwim } from "./SeaSwim";
import { TowelRide } from "./TowelRide";

const BUTTON_HEIGHT: number = 1.5; // how high the buttons float over your towel and the sandcastle spot
const STEP_ON: number = 0.6; // walk this close to the middle of the castle, and you've stepped on it

// BeachPlay has the Relax button on your towel and the Build button on the sand, and does what they're for
export class BeachPlay implements PlayPlace {
  family: BeachFamily; // your mum, dad and brother on the beach
  brotherFollowsYou: boolean; // is your brother following you round the beach
  towel: TowelRide;
  castle: Sandcastle3D;
  building: SandcastleRide;
  swimming: SeaSwim; // you and your brother in the sea
  riding: Ride | null; // what you are doing right now
  relaxButton: PopUpButton3D;
  buildButton: PopUpButton3D;
  clicking: Clicking;

  constructor(family: BeachFamily) {
    this.family = family;
    this.brotherFollowsYou = false;
    this.towel = new TowelRide(YOUR_TOWEL_FEET);
    this.castle = new Sandcastle3D();
    this.building = new SandcastleRide(this.castle, family);
    this.swimming = new SeaSwim(family);
    this.riding = null;
    this.relaxButton = new PopUpButton3D("🏖️ Relax", "relax", YOUR_TOWEL_SPOT, BUTTON_HEIGHT, "middle");
    this.buildButton = new PopUpButton3D("🏰 Build", "build", SANDCASTLE_SPOT, BUTTON_HEIGHT, "middle");
    this.clicking = new Clicking();
  }

  // this says both buttons
  buttons(): PopUpButton3D[] {
    return [this.relaxButton, this.buildButton];
  }

  // this puts the sandcastle and the buttons on the beach, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    scene.add(this.castle.model);
    for (const button of this.buttons()) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // your brother, so you bump into him (Mum and Dad stay on their towels, so they're bumped into like umbrellas).
  // The castle isn't in the way: you can step on it!
  inTheWay(): Vector3[] {
    return [this.family.brother.model.position];
  }

  // this squashes the castle if you step on it, and keeps it squashing until it's a pile of sand
  stepOnCastle(you: Person3D, seconds: number): void {
    const spot = you.model.position;
    if (Math.hypot(spot.x - SANDCASTLE_SPOT.x, spot.z - SANDCASTLE_SPOT.z) < STEP_ON) this.castle.knockDown();
    this.castle.crumble(seconds);
  }

  // this pops up each button when you're near it and it can be used, and asks for it if you click it
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    const free = this.riding == null;
    this.relaxButton.pop(free && this.relaxButton.isNear(you.model.position), seconds);
    this.buildButton.pop(free && this.castle.canBuild() && this.buildButton.isNear(you.model.position), seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons());
    if (clicked != null) game.doJob(clicked.job);
  }

  // this lies you down on your towel, or starts the sandcastle, if you asked
  startPlaying(asked: Ask | null, you: Person3D): void {
    if (this.riding != null) return;
    if (asked === "relax") this.riding = this.towel;
    else if (asked === "build" && this.castle.canBuild()) this.riding = this.building;
    else return;
    this.riding.begin(you);
  }

  // this keeps you relaxing or building. When you're not, it squashes the castle if you step on it,
  // and floats you in the sea if you walk in. It says if you're relaxing or building
  play(you: Person3D, now: number, seconds: number, keys: Keys): boolean {
    if (this.riding == null) {
      this.stepOnCastle(you, seconds);
      this.swimming.update(you, now, seconds, this.brotherFollowsYou);
      if (this.brotherFollowsYou && !this.swimming.brotherSwimming) this.brotherFollows(you, now, seconds);
      return false;
    }
    if (!this.riding.move(you, now, seconds, keys)) this.riding = null;
    return true;
  }

  // this gets your brother up (from his towel, or the sandcastle) and walks him after you round the beach
  brotherFollows(you: Person3D, now: number, seconds: number): void {
    const brother = this.family.brother;
    if (brother.isDown()) brother.standUp();
    followYouOutside(brother, you, now, seconds, this.family.spots());
    brother.model.position.y = 0; // feet on the sand (not sunk in the water after a swim)
  }

  // this says if you're in the middle of relaxing or building
  busy(): boolean {
    return this.riding != null;
  }

  // this tells your brother if he should follow you round the beach
  letBrotherFollow(follows: boolean): void {
    this.brotherFollowsYou = follows;
  }

  // this throws the buttons away when you go home
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons()) button.throwAway();
  }
}
