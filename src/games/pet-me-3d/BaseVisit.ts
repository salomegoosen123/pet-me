// BaseVisit.ts – sneaking into the bad guys' base, through the end of their secret tunnel, hidden behind the big
// tree in the back yard. There's a wolf down there, and it scratches you! Shout HELP in the chat and Saydee comes
// running: she barks, and the wolf runs away. Mia designed this game.
import { CylinderGeometry, Group, SphereGeometry, Vector3 } from "three";
import type { Camera, Scene } from "three";
import { bumpOff } from "./bumping";
import { Clicking } from "./Clicking";
import { Dog3D } from "./Dog3D";
import type { Game } from "./Game";
import { DEEP, LONG, TUNNEL, WIDE } from "./Hideout";
import type { HomeDog } from "./HomeDog";
import { TRAPDOOR } from "./homeSpots";
import { makePart } from "./paint";
import { PERSON_SIZE } from "./Person3D";
import type { Person3D } from "./Person3D";
import { PopUpButton3D } from "./PopUpButton3D";
import { WOLF_COLOUR } from "./settings";
import { SpeechBubble3D } from "./SpeechBubble3D";
import type { Stage3D } from "./stage";
import { spotBehind, walkWithKeys } from "./walking";
import { YARD_TREE_SPOT } from "./yard";

const HOLE: Vector3 = YARD_TREE_SPOT.clone().add(new Vector3(0, 0, -1.8)); // the end of the tunnel, hidden behind the big tree
const OUT_OF_THE_HOLE: Vector3 = HOLE.clone().add(new Vector3(1.3, 0, 0)); // where you climb out
const BY_THE_HOLE: Vector3 = HOLE.clone().add(new Vector3(-1.1, 0, 0)); // where Saydee dives into the tunnel
const IN_FROM_THE_TUNNEL: Vector3 = TUNNEL.clone().add(new Vector3(0, 0, 0.6)); // where you come out, in the base
const AT_THE_LADDER: Vector3 = TRAPDOOR.clone().add(new Vector3(0, -DEEP, 0.7)); // the bottom of the ladder, in the base
const BY_THE_TRAPDOOR: Vector3 = TRAPDOOR.clone().add(new Vector3(0, 0, 1.4)); // where you climb out, in the middle room
const SAYDEE_BESIDE_YOU: Vector3 = new Vector3(1, 0, 0); // where Saydee comes out, next to you
const WOLF_SPOT: Vector3 = new Vector3(-1.8, -DEEP, 1.2); // where the wolf waits, in the base
const WOLF_SIZE: number = 0.7; // how big the wolf is (Saydee is smaller)
const WOLF_SPEED: number = 1.8; // how fast the wolf comes at you
const SCRATCH_REACH: number = 1; // this close, the wolf can scratch you
const SCRATCH_SECONDS: number = 1.5; // how often it scratches
const RUN_SPEED: number = 6; // how fast Saydee runs to save you, and the wolf runs away
const SAVE_REACH: number = 1.3; // this close to you, Saydee barks and the wolf runs off
const ROOM: number = 0.35; // you stay this far from the base walls
const GO_IN_HEIGHT: number = 1.6; // how high the Go in button floats over the hole
const GO_OUT_HEIGHT: number = -DEEP + 2; // and the Go out button, in the base
const ABOVE_YOU: number = 1.2; // your "Ouch!" floats this far above your feet
const ABOVE_A_DOG: number = 1.4; // the wolf's "GRRR!" and Saydee's "WOOF!" float this far above them

// what the wolf is doing, and what Saydee is doing
type WolfPart = "attacking" | "runningAway" | "gone";
type SaydeePart = "notCalled" | "runningToTheTunnel" | "comingIn" | "withYou";

// this says how far apart two spots are along the ground
function groundDistance(a: Vector3, b: Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

// this makes the end of the tunnel in the back yard: a dark hole with a pile of earth behind it
function makeHole(): Group {
  const hole = new Group();
  const earth = makePart(new SphereGeometry(0.8, 16, 8), "saddlebrown", 0, 0, -0.9);
  earth.scale.set(1.2, 0.5, 0.6);
  hole.add(makePart(new CylinderGeometry(0.7, 0.7, 0.02, 24), "black", 0, 0.01, 0), earth);
  hole.position.copy(HOLE);
  return hole;
}

// this makes the wolf: a big grey dog with no collar
function makeWolf(): Dog3D {
  const wolf = new Dog3D({ fur: WOLF_COLOUR, ears: WOLF_COLOUR, spots: false, size: WOLF_SIZE });
  if (wolf.collar != null) wolf.collar.visible = false;
  wolf.model.visible = false;
  return wolf;
}

// BaseVisit is the ways into the bad guys' base, the wolf down there, and Saydee coming to save you
export class BaseVisit {
  hole: Group;
  wolf: Dog3D;
  wolfPart: WolfPart;
  saydee: SaydeePart;
  scratchIn: number; // how long until the wolf scratches you again
  goInButtons: PopUpButton3D[]; // Go in, by the hole, and Go down, at the trapdoor
  goOutButtons: PopUpButton3D[]; // Go out, by the tunnel, and Go up, at the ladder, down in the base
  clicking: Clicking;
  ouch: SpeechBubble3D; // your "Ouch!"
  growl: SpeechBubble3D; // the wolf's "GRRR!"
  bark: SpeechBubble3D; // Saydee's "WOOF!"

  constructor() {
    this.hole = makeHole();
    this.wolf = makeWolf();
    this.wolfPart = "gone";
    this.saydee = "notCalled";
    this.scratchIn = 0;
    this.goInButtons = [
      new PopUpButton3D("🕳️ Go in", "goInTunnel", HOLE, GO_IN_HEIGHT, "middle"),
      new PopUpButton3D("🪜 Go down", "goDownTrapdoor", TRAPDOOR, GO_IN_HEIGHT, "middle"),
    ];
    this.goOutButtons = [
      new PopUpButton3D("🕳️ Go out", "goOutTunnel", IN_FROM_THE_TUNNEL, GO_OUT_HEIGHT, "right"),
      new PopUpButton3D("🪜 Go up", "goUpTrapdoor", AT_THE_LADDER, GO_OUT_HEIGHT, "left"),
    ];
    this.clicking = new Clicking();
    this.ouch = new SpeechBubble3D();
    this.growl = new SpeechBubble3D();
    this.bark = new SpeechBubble3D();
  }

  // this puts the hole in the back yard and the wolf in the base, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    scene.add(this.hole, this.wolf.model, this.ouch.model, this.growl.model, this.bark.model);
    for (const button of [...this.goInButtons, ...this.goOutButtons]) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this takes you into the base, through the tunnel or down the trapdoor ladder. The wolf is waiting!
  goIn(game: Game, you: Person3D, byTrapdoor: boolean): void {
    game.goIntoTheBase();
    you.model.position.copy(byTrapdoor ? AT_THE_LADDER : IN_FROM_THE_TUNNEL);
    this.wolf.model.position.copy(WOLF_SPOT).setY(this.wolf.standingHeight() - DEEP);
    this.wolf.model.visible = true;
    this.wolfPart = "attacking";
    this.scratchIn = SCRATCH_SECONDS;
    this.saydee = "notCalled";
  }

  // this takes you back out, through the tunnel to the back yard or up the ladder to the middle room
  // (and Saydee too, if she came in)
  goOut(game: Game, you: Person3D, dog: Dog3D, homeDog: HomeDog, byTrapdoor: boolean): void {
    game.comeOutOfTheBase();
    you.model.position.copy(byTrapdoor ? BY_THE_TRAPDOOR : OUT_OF_THE_HOLE);
    if (this.saydee === "comingIn" || this.saydee === "withYou") {
      dog.model.position.copy(you.model.position).add(SAYDEE_BESIDE_YOU).setY(dog.standingHeight());
    }
    this.saydee = "notCalled";
    homeDog.forgetTheWay();
  }

  // you shouted HELP: Saydee hears you and comes running
  callSaydee(): void {
    if (this.saydee !== "notCalled") return;
    this.saydee = "runningToTheTunnel";
    this.bark.say("WOOF?! I hear you! 🐾");
  }

  // this is you in the base: you walk about, the wolf comes at you, and Saydee comes if you called her.
  // It says if Saydee is busy coming to you (or is with you)
  play(game: Game, you: Person3D, dog: Dog3D, homeDog: HomeDog, stage: Stage3D, now: number, seconds: number): boolean {
    const asked = game.takeRequest();
    if (asked === "goOutTunnel" || asked === "goUpTrapdoor") {
      this.goOut(game, you, dog, homeDog, asked === "goUpTrapdoor");
      return false;
    }
    walkWithKeys(stage, you, game.keys, Infinity, now, seconds);
    this.keepInTheBase(you);
    if (this.wolfPart === "attacking") this.wolfAttacks(you, now, seconds);
    else if (this.wolfPart === "runningAway") this.wolfRunsAway(now, seconds);
    this.saydeeMoves(you, dog, homeDog, now, seconds);
    return this.saydee !== "notCalled";
  }

  // this keeps you inside the base walls, on the base floor, and out of the wolf
  keepInTheBase(you: Person3D): void {
    const spot = you.model.position;
    spot.x = Math.min(WIDE / 2 - ROOM, Math.max(-WIDE / 2 + ROOM, spot.x));
    spot.z = Math.min(LONG / 2 - ROOM, Math.max(-LONG / 2 + ROOM, spot.z));
    spot.y = -DEEP;
    if (this.wolf.model.visible) bumpOff(spot, PERSON_SIZE, this.wolf.model.position, this.wolf.bumpSize());
  }

  // the wolf comes at you, and when it's close, it scratches you
  wolfAttacks(you: Person3D, now: number, seconds: number): void {
    const yourSpot = you.model.position.clone().setY(this.wolf.standingHeight() - DEEP);
    const close = groundDistance(this.wolf.model.position, yourSpot) < SCRATCH_REACH;
    if (close) this.wolf.faceTowards(yourSpot);
    else this.wolf.walkTowards(yourSpot, WOLF_SPEED, seconds);
    this.wolf.hop(close ? 0 : now);
    this.scratchIn = this.scratchIn - seconds;
    if (!close || this.scratchIn > 0) return;
    this.scratchIn = SCRATCH_SECONDS;
    this.ouch.say("Ouch! 😣");
    this.growl.say("GRRR! 🐺");
  }

  // the wolf runs off down the tunnel, and it's gone
  wolfRunsAway(now: number, seconds: number): void {
    const tunnel = TUNNEL.clone().setY(this.wolf.standingHeight() - DEEP);
    this.wolf.hop(now * 2);
    if (!this.wolf.walkTowards(tunnel, RUN_SPEED, seconds)) return;
    this.wolf.model.visible = false;
    this.wolfPart = "gone";
  }

  // Saydee runs through the house to the tunnel, dives in, runs to you, and then stays by your side
  saydeeMoves(you: Person3D, dog: Dog3D, homeDog: HomeDog, now: number, seconds: number): void {
    if (this.saydee === "notCalled") return;
    dog.wag(now, true);
    if (this.saydee === "runningToTheTunnel") {
      dog.hop(now * 2);
      if (!homeDog.walkTo(dog, BY_THE_HOLE, seconds, RUN_SPEED)) return;
      dog.model.position.copy(TUNNEL).setY(dog.standingHeight() - DEEP);
      this.saydee = "comingIn";
    } else if (this.saydee === "comingIn") {
      dog.hop(now * 2);
      dog.walkTowards(you.model.position.clone().setY(dog.standingHeight() - DEEP), RUN_SPEED, seconds);
      if (groundDistance(dog.model.position, you.model.position) < SAVE_REACH) this.saydeeSavesYou();
    } else {
      const behindYou = spotBehind(you, dog);
      dog.hop(dog.walkTowards(behindYou.setY(behindYou.y - DEEP), RUN_SPEED / 2, seconds) ? 0 : now);
    }
  }

  // Saydee's here! She barks, and the wolf runs away
  saydeeSavesYou(): void {
    this.saydee = "withYou";
    this.bark.say("WOOF! WOOF! 🐕");
    if (this.wolfPart === "attacking") this.wolfPart = "runningAway";
  }

  // this pops up the ways in when you're near them (if you can go in), and the ways out when you're in the base,
  // does the one you click, and keeps the speech bubbles over everyone's heads
  updateButtons(game: Game, you: Person3D, dog: Dog3D, camera: Camera, seconds: number, canGoIn: boolean): void {
    for (const button of this.goInButtons) button.pop(!game.inTheBase && canGoIn && button.isNear(you.model.position), seconds);
    for (const button of this.goOutButtons) button.pop(game.inTheBase && button.isNear(you.model.position), seconds);
    const clicked = this.clicking.clickedButton(camera, [...this.goInButtons, ...this.goOutButtons]);
    if (clicked != null) game.doJob(clicked.job);
    this.ouch.follow(you.model, ABOVE_YOU, seconds);
    this.growl.follow(this.wolf.model, ABOVE_A_DOG, seconds);
    this.bark.follow(dog.model, ABOVE_A_DOG, seconds);
  }

  // this throws the buttons and bubbles away when the game closes
  stop(): void {
    this.clicking.stop();
    for (const button of [...this.goInButtons, ...this.goOutButtons]) button.throwAway();
    this.ouch.throwAway();
    this.growl.throwAway();
    this.bark.throwAway();
  }
}
