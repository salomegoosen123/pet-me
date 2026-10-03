// Hideout.ts – the bad guys' secret hideout under your home. They keep you down there while Saydee sniffs all
// around the house looking for you. When she sniffs the trapdoor she finds you: she barks, and they run away
// down their tunnel. Mia designed this game.
import { BoxGeometry, Group, Material, Mesh, PlaneGeometry, Vector3 } from "three";
import type { Scene } from "three";
import { makeBadGuy } from "./BadGuys";
import type { Dog3D } from "./Dog3D";
import type { Game } from "./Game";
import type { HomeDog } from "./HomeDog";
import { BED_SPOT, ERRAND_SPOTS, ON_FLOOR, ROOM_WALL, TRAPDOOR } from "./homeSpots";
import { makePart, paint } from "./paint";
import type { Person3D } from "./Person3D";
import { Police } from "./Police";
import { SNIFF_SECONDS } from "./settings";
import { SpeechBubble3D } from "./SpeechBubble3D";
import { stepTowards } from "./walking";

export const DEEP: number = 3; // how far under the floor the hideout is
export const WIDE: number = 6; // how wide it is, from side to side
export const LONG: number = 5; // and from front to back
const MIDDLE: Vector3 = new Vector3(0, -DEEP, 0); // the middle of the hideout's floor, under the middle room
const YOU_HERE: Vector3 = new Vector3(-0.6, -DEEP, 0.6); // where they keep you
const BAD_GUY_SPOTS: Vector3[] = [new Vector3(-1.8, -DEEP, 0.2), new Vector3(0.6, -DEEP, 0.9)]; // where they stand guard
export const TUNNEL: Vector3 = new Vector3(2, -DEEP, -LONG / 2 + 0.3); // their secret tunnel out to the back yard
const AT_THE_TRAPDOOR: Vector3 = TRAPDOOR.clone().add(new Vector3(1, 0, 0)).setY(ON_FLOOR); // where Saydee sniffs it
const OUT_OF_THE_TRAPDOOR: Vector3 = TRAPDOOR.clone().add(new Vector3(0, 0, 1.4)); // where you climb out
const SEE_THROUGH: number = 0.35; // how see-through the floor is while you're in the hideout (1 is not at all)
const RUN_SPEED: number = 4; // how fast the bad guys run off down their tunnel
const GONE: number = 0.3; // this close to the tunnel, they're gone
const CLIMB_OUT_SECONDS: number = 2; // how long after Saydee barks you climb out
const SNIFF_WALK_SPEED: number = 2.5; // how fast Saydee walks from spot to spot while she sniffs for you
const RUN_TO_YOU_SPEED: number = 6; // how fast Saydee runs to the trapdoor when she hears you shout HELP
const ABOVE_SAYDEE: number = 1.3; // her bubble floats this far above her

// where Saydee sniffs for you, one after the other: her bed, the bathroom, her food bowl in the kitchen,
// and last of all the trapdoor
const SNIFF_SPOTS: Vector3[] = [BED_SPOT, new Vector3(-ROOM_WALL - 1.2, ON_FLOOR, 0), ERRAND_SPOTS.food, AT_THE_TRAPDOOR];

// this makes the hideout: a dark earth floor, three rock walls (the front is open so you can see in),
// the tunnel out to the back yard, and a ladder up to the trapdoor
function makeHideout(): Group {
  const hideout = new Group();
  const earth = new Mesh(new PlaneGeometry(WIDE, LONG), paint("#3b2a1a"));
  earth.rotation.x = -Math.PI / 2;
  earth.receiveShadow = true;
  const wallHeight = DEEP - 0.05; // just under the house floor
  hideout.add(
    earth,
    makePart(new BoxGeometry(WIDE, wallHeight, 0.2), "dimgray", 0, wallHeight / 2, -LONG / 2),
    makePart(new BoxGeometry(0.2, wallHeight, LONG), "dimgray", -WIDE / 2, wallHeight / 2, 0),
    makePart(new BoxGeometry(0.2, wallHeight, LONG), "dimgray", WIDE / 2, wallHeight / 2, 0),
    makePart(new BoxGeometry(1.4, 2.4, 0.25), "black", TUNNEL.x, 1.2, -LONG / 2),
  );
  const ladderZ = TRAPDOOR.z - MIDDLE.z;
  hideout.add(makePart(new BoxGeometry(0.08, wallHeight, 0.08), "saddlebrown", -0.35, wallHeight / 2, ladderZ));
  hideout.add(makePart(new BoxGeometry(0.08, wallHeight, 0.08), "saddlebrown", 0.35, wallHeight / 2, ladderZ));
  for (let rung = 1; rung < 6; rung++) {
    hideout.add(makePart(new BoxGeometry(0.7, 0.06, 0.06), "saddlebrown", 0, rung * 0.5, ladderZ));
  }
  hideout.position.copy(MIDDLE);
  return hideout;
}

// Hideout is the hideout under your home, the bad guys in it, and Saydee or the police coming to save you
export class Hideout {
  model: Group;
  trapdoor: Mesh;
  badGuys: Person3D[];
  bubble: SpeechBubble3D; // Saydee's "Sniff sniff" and "WOOF! WOOF!"
  police: Police; // the police car and the police, who come at night
  floor: Mesh | null; // the house floor, which goes see-through while you're in the hideout
  holdingYou: boolean; // have the bad guys got you down here right now
  nextSniff: number; // which spot Saydee sniffs next
  sniffing: boolean; // is she sniffing a spot right now (or walking to it)
  found: boolean; // has she found you
  heardYou: boolean; // did she hear you shout HELP
  timeLeft: number; // how much longer she sniffs here, or until you climb out

  constructor() {
    this.model = makeHideout();
    this.trapdoor = makePart(new BoxGeometry(1.3, 0.03, 1.3), "sienna", TRAPDOOR.x, 0.015, TRAPDOOR.z);
    this.badGuys = BAD_GUY_SPOTS.map(makeBadGuy);
    this.bubble = new SpeechBubble3D();
    this.police = new Police();
    this.floor = null;
    this.holdingYou = false;
    this.nextSniff = 0;
    this.sniffing = false;
    this.found = false;
    this.heardYou = false;
    this.timeLeft = 0;
  }

  // this puts the hideout under the house, and the trapdoor in the floor
  start(scene: Scene, floor: Mesh): void {
    scene.add(this.model, this.trapdoor, this.bubble.model);
    for (const badGuy of this.badGuys) scene.add(badGuy.model);
    this.police.start(scene);
    this.floor = floor;
  }

  // this runs the hideout while the bad guys have got you. It says if they have.
  // The police keep going after you're out, until they've driven the bad guys away
  update(game: Game, you: Person3D, dog: Dog3D, homeDog: HomeDog, now: number, seconds: number): boolean {
    this.bubble.follow(dog.model, ABOVE_SAYDEE, seconds);
    this.police.update(now, seconds);
    this.seeThrough(game.underHome || game.inTheBase);
    if (game.inTheBase) this.badGuysAreOut();
    if (!game.underHome) {
      this.holdingYou = false;
      return false;
    }
    if (!this.holdingYou) this.begin();
    if (game.rescuer === "police") this.waitForThePolice(game, you);
    else if (this.found) this.badGuysRunAway(game, you, dog, now, seconds);
    else this.lookForYou(you, dog, homeDog, now, seconds);
    return true;
  }

  // this gets the hideout ready when the bad guys bring you down: they stand guard, and nobody's found you yet
  begin(): void {
    this.holdingYou = true;
    this.nextSniff = 0;
    this.sniffing = false;
    this.found = false;
    this.heardYou = false;
    for (let i = 0; i < this.badGuys.length; i++) {
      this.badGuys[i].model.position.copy(BAD_GUY_SPOTS[i]);
      this.badGuys[i].model.visible = true;
    }
  }

  // the bad guys aren't home when you sneak into their base (but their wolf is)
  badGuysAreOut(): void {
    for (const badGuy of this.badGuys) badGuy.model.visible = false;
  }

  // this keeps you down in the hideout, with the bad guys watching you
  keepYouHere(you: Person3D): void {
    you.model.position.copy(YOU_HERE);
    you.model.rotation.y = 0;
    you.standStill();
    for (const badGuy of this.badGuys) badGuy.faceTowards(you.model.position);
  }

  // the bad guys keep you in the hideout until the police come and find you. Then you climb out
  waitForThePolice(game: Game, you: Person3D): void {
    this.police.call(this.badGuys);
    if (!this.police.foundYou()) {
      this.keepYouHere(you);
      return;
    }
    you.model.position.copy(OUT_OF_THE_TRAPDOOR);
    game.saved();
    game.lockUpBadGuys(); // they're off to jail
  }

  // this makes the floor see-through while you're in the hideout, so you can see down into it
  seeThrough(see: boolean): void {
    if (this.floor == null || !(this.floor.material instanceof Material)) return;
    if (this.floor.material.transparent === see) return;
    this.floor.material.transparent = see;
    this.floor.material.opacity = see ? SEE_THROUGH : 1;
    this.floor.material.needsUpdate = true;
  }

  // the bad guys keep you in the hideout, while Saydee walks round the house and sniffs for you
  lookForYou(you: Person3D, dog: Dog3D, homeDog: HomeDog, now: number, seconds: number): void {
    this.keepYouHere(you);
    const speed = this.heardYou ? RUN_TO_YOU_SPEED : SNIFF_WALK_SPEED; // she runs when she's heard you
    const there = homeDog.walkTo(dog, SNIFF_SPOTS[this.nextSniff], seconds, speed);
    dog.wag(now, true);
    if (!there) {
      dog.hop(this.heardYou ? now * 2 : now);
      return;
    }
    if (!this.sniffing) this.startSniffing();
    dog.nom(now); // her nose goes down to sniff
    this.timeLeft = this.timeLeft - seconds;
    if (this.timeLeft > 0) return;
    this.sniffing = false;
    if (this.nextSniff < SNIFF_SPOTS.length - 1) this.nextSniff = this.nextSniff + 1;
    else this.saydeeFindsYou();
  }

  // this starts Saydee sniffing a spot
  startSniffing(): void {
    this.sniffing = true;
    this.timeLeft = SNIFF_SECONDS;
    const atTheTrapdoor = this.nextSniff === SNIFF_SPOTS.length - 1;
    this.bubble.say(atTheTrapdoor ? "Sniff sniff… I smell you! 🐾" : "Sniff sniff… where are you? 🐾");
  }

  // Saydee hears you shout HELP: she stops sniffing and runs straight to the trapdoor
  hearHelp(): void {
    if (this.found || this.heardYou) return;
    this.heardYou = true;
    this.sniffing = false;
    this.nextSniff = SNIFF_SPOTS.length - 1;
    this.bubble.say("WOOF?! I hear you! 🐾");
  }

  // Saydee's found you! She barks
  saydeeFindsYou(): void {
    this.found = true;
    this.timeLeft = CLIMB_OUT_SECONDS;
    this.bubble.say("WOOF! WOOF! 🐕");
  }

  // the bad guys run away down their tunnel, Saydee bounces for joy, and you climb out of the trapdoor
  badGuysRunAway(game: Game, you: Person3D, dog: Dog3D, now: number, seconds: number): void {
    dog.wag(now, true);
    dog.hop(now * 2);
    for (const badGuy of this.badGuys) {
      stepTowards(badGuy, TUNNEL, RUN_SPEED, 0, now, seconds);
      if (badGuy.model.position.distanceTo(TUNNEL) < GONE) badGuy.model.visible = false;
    }
    this.timeLeft = this.timeLeft - seconds;
    if (this.timeLeft > 0) return;
    you.model.position.copy(OUT_OF_THE_TRAPDOOR);
    game.saved();
  }

  // this throws the speech bubbles away when the game closes
  stop(): void {
    this.bubble.throwAway();
    this.police.stop();
  }
}
