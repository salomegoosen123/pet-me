// FrisbeeFetch.ts – throwing a frisbee for Saydee at the park: she runs, catches it, and brings it back. Mia designed this game.
import { CylinderGeometry, Mesh, Vector3 } from "three";
import type { Camera, Scene } from "three";
import { Clicking } from "./Clicking";
import type { Dog3D } from "./Dog3D";
import type { Game } from "./Game";
import { ON_FLOOR } from "./homeSpots";
import { paint } from "./paint";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";
import { FRISBEE_COLOUR, FRISBEE_DISTANCE, ZOOM_SPEED } from "./settings";

const FLIGHT_SECONDS: number = 1.4; // how long the frisbee flies for
const FLY_HIGH: number = 1.8; // how high it goes in the middle of its flight
const SPIN_SPEED: number = 15; // how fast it spins as it flies
const CATCH_DISTANCE: number = 1.2; // if she's this close when it comes down, she catches it
const BRING_TO: number = 1.2; // she drops it when she gets this close to you
const THERE: number = 0.3; // this close to a spot counts as being there
const BUTTON_HEIGHT: number = 2.4; // how high the Throw button floats over you
const IN_HER_MOUTH: number = 0.3; // how far in front of her collar she holds it
const ON_THE_GRASS: number = 0.03;

// the parts of a game of fetch
type FetchPart = "ready" | "flying" | "onGrass" | "bringingBack";

// this says how far apart two spots are along the ground
function groundDistance(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

// FrisbeeFetch has the frisbee and the Throw button, and makes Saydee fetch it while she's off her leash
export class FrisbeeFetch {
  frisbee: Mesh;
  part: FetchPart; // which part of the game of fetch you are on
  from: Vector3; // where the frisbee was thrown from
  to: Vector3; // where it comes down
  flightTime: number; // how long it has been flying
  edge: number; // it never lands farther from the middle of the park than this
  buttons: PopUpButton3D[];
  clicking: Clicking;

  constructor() {
    this.frisbee = new Mesh(new CylinderGeometry(0.22, 0.22, 0.04, 24), paint(FRISBEE_COLOUR));
    this.frisbee.castShadow = true;
    this.part = "ready";
    this.from = new Vector3();
    this.to = new Vector3();
    this.flightTime = 0;
    this.edge = 0;
    this.buttons = [];
    this.clicking = new Clicking();
  }

  // this puts the frisbee and the Throw button in the park, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement, you: Person3D, edge: number): void {
    this.buttons = [new PopUpButton3D("🥏 Throw", "throw", you.model.position, BUTTON_HEIGHT, "middle")];
    scene.add(this.frisbee);
    for (const button of this.buttons) scene.add(button.model);
    this.clicking.listen(canvas);
    this.edge = edge;
  }

  // this pops up the Throw button while Saydee is off her leash and the frisbee is in your hand
  updateButtons(game: Game, camera: Camera, playing: boolean, seconds: number): void {
    for (const button of this.buttons) button.pop(!game.leashOn && this.part === "ready" && !playing, seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons);
    if (clicked != null) game.doJob(clicked.job);
  }

  // this throws the frisbee the way you are facing
  throwFrom(you: Person3D): void {
    if (this.part !== "ready") return;
    this.from = you.handSpot();
    this.to = you.model.position.clone().addScaledVector(you.facing(), FRISBEE_DISTANCE).setY(0);
    if (this.to.length() > this.edge) this.to.setLength(this.edge);
    this.to.y = ON_THE_GRASS;
    this.part = "flying";
    this.flightTime = 0;
  }

  // this moves the frisbee, and Saydee while she fetches it. It says if she's fetching
  play(dog: Dog3D, you: Person3D, leashOn: boolean, now: number, seconds: number): boolean {
    if (leashOn) this.part = "ready"; // back on her leash, the game of fetch stops
    this.frisbee.visible = !leashOn;
    if (this.part === "ready") this.frisbee.position.copy(you.handSpot());
    else if (this.part === "flying") this.fly(dog, now, seconds);
    else if (this.part === "onGrass") this.fetchIt(dog, now, seconds);
    else this.bringItBack(dog, you, now, seconds);
    return this.part !== "ready";
  }

  // this flies the frisbee in a big spinning arc, while Saydee races to where it will come down
  fly(dog: Dog3D, now: number, seconds: number): void {
    this.flightTime = this.flightTime + seconds;
    const along = Math.min(1, this.flightTime / FLIGHT_SECONDS);
    this.frisbee.position.lerpVectors(this.from, this.to, along);
    this.frisbee.position.y = this.frisbee.position.y + Math.sin(along * Math.PI) * FLY_HIGH;
    this.frisbee.rotation.y = this.frisbee.rotation.y + SPIN_SPEED * seconds;
    this.runTo(dog, this.to, now, seconds);
    if (along < 1) return;
    const caught = groundDistance(dog.model.position, this.to) < CATCH_DISTANCE;
    this.part = caught ? "bringingBack" : "onGrass";
  }

  // this runs Saydee to the frisbee on the grass, and she picks it up
  fetchIt(dog: Dog3D, now: number, seconds: number): void {
    if (this.runTo(dog, this.to, now, seconds)) this.part = "bringingBack";
  }

  // this runs her back to you with the frisbee in her mouth, and she drops it in your hand
  bringItBack(dog: Dog3D, you: Person3D, now: number, seconds: number): void {
    this.runTo(dog, you.model.position, now, seconds);
    const ahead = new Vector3(Math.sin(dog.model.rotation.y), 0, Math.cos(dog.model.rotation.y));
    this.frisbee.position.copy(dog.collarSpot()).addScaledVector(ahead, IN_HER_MOUTH);
    if (groundDistance(dog.model.position, you.model.position) < BRING_TO) this.part = "ready";
  }

  // this says if Saydee is busy with the frisbee (so you can't ride her until she's brought it back)
  isFetching(): boolean {
    return this.part !== "ready";
  }

  // this runs Saydee towards a spot, wagging like mad. It says if she's there
  runTo(dog: Dog3D, spot: Vector3, now: number, seconds: number): boolean {
    dog.walkTowards(spot.clone().setY(ON_FLOOR), ZOOM_SPEED, seconds);
    dog.wag(now, true);
    dog.hop(now * 2);
    return groundDistance(dog.model.position, spot) < THERE;
  }

  // this throws the button away when you go home
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons) button.throwAway();
  }
}
