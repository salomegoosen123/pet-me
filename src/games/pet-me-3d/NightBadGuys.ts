// NightBadGuys.ts – the bad guys sneaking into your home at night: when you've been asleep a little while, they
// creep in the front door, lift you out of bed, and carry you down the trapdoor to their hideout. Then the police
// come to save you (that's Police.ts). Mia designed this game.
import { Vector3 } from "three";
import type { Scene } from "three";
import { holdInArms, makeBadGuy } from "./BadGuys";
import type { Game } from "./Game";
import { TRAPDOOR, YOUR_BED_MIDDLE } from "./homeSpots";
import { FRONT } from "./house";
import type { Person3D } from "./Person3D";
import { routeBetween } from "./routes";
import { NIGHT_BAD_GUYS_SECONDS } from "./settings";
import { stepTowards, walkAlong } from "./walking";

const CREEP_FROM: Vector3 = new Vector3(-2, 0, FRONT + 8); // they creep in from the end of the front garden
const OUTSIDE_THE_DOOR: Vector3 = new Vector3(0, 0, FRONT + 1);
const INSIDE_THE_DOOR: Vector3 = new Vector3(0, 0, FRONT - 1);
const BY_YOUR_BED: Vector3 = YOUR_BED_MIDDLE.clone().add(new Vector3(1.6, 0, 0.9)); // they creep up beside your bed
const CREEP_SPEED: number = 2.5; // how fast they creep, on tiptoe
const CARRY_SPEED: number = 2.5; // how fast they carry you to the trapdoor
const BEHIND: number = 1.2; // the second bad guy follows this far behind the first

// what the bad guys are doing at night: waiting till you're asleep, creeping in, or carrying you off
type NightPart = "waiting" | "creepingIn" | "carrying";

// NightBadGuys are the two bad guys who come at night
export class NightBadGuys {
  badGuys: Person3D[]; // the first one carries you, the second one follows him
  part: NightPart;
  asleepFor: number; // how long you've been asleep
  stops: Vector3[]; // where the first bad guy walks next

  constructor() {
    this.badGuys = [makeBadGuy(CREEP_FROM), makeBadGuy(CREEP_FROM)];
    for (const badGuy of this.badGuys) badGuy.model.visible = false;
    this.part = "waiting";
    this.asleepFor = 0;
    this.stops = [];
  }

  // this puts the bad guys in the home (hidden until you fall asleep)
  start(scene: Scene): void {
    for (const badGuy of this.badGuys) scene.add(badGuy.model);
  }

  // this says where the bad guys are while they're in your home, so the doors open for them
  spots(): Vector3[] {
    const spots: Vector3[] = [];
    for (const badGuy of this.badGuys) {
      if (badGuy.model.visible) spots.push(badGuy.model.position);
    }
    return spots;
  }

  // this moves the bad guys at night. It says if they're coming for you (so you can't move)
  update(game: Game, you: Person3D, now: number, seconds: number): boolean {
    if (this.part === "creepingIn") this.creepIn(you, now, seconds);
    else if (this.part === "carrying") this.carryYouDown(game, you, now, seconds);
    else this.waitTillYouSleep(game, you, seconds);
    return this.part !== "waiting" || game.underHome;
  }

  // this waits until you've been asleep in bed for a while, then the bad guys start creeping in
  // (unless the police have taken them to jail)
  waitTillYouSleep(game: Game, you: Person3D, seconds: number): void {
    this.asleepFor = you.lying && !game.badGuysInJail ? this.asleepFor + seconds : 0;
    if (this.asleepFor < NIGHT_BAD_GUYS_SECONDS) return;
    for (const badGuy of this.badGuys) {
      badGuy.model.position.copy(CREEP_FROM);
      badGuy.model.visible = true;
    }
    this.stops = [OUTSIDE_THE_DOOR, INSIDE_THE_DOOR, ...routeBetween(INSIDE_THE_DOOR, BY_YOUR_BED)];
    this.part = "creepingIn";
  }

  // the bad guys creep in the front door and up to your bed, and lift you out of it
  creepIn(you: Person3D, now: number, seconds: number): void {
    const there = walkAlong(this.badGuys[0], this.stops, CREEP_SPEED, now, seconds);
    stepTowards(this.badGuys[1], this.badGuys[0].model.position, CREEP_SPEED, BEHIND, now, seconds);
    if (!there) return;
    you.standUp();
    this.stops = routeBetween(BY_YOUR_BED, TRAPDOOR);
    this.part = "carrying";
  }

  // the bad guys carry you to the trapdoor in the middle room, and climb down it with you
  carryYouDown(game: Game, you: Person3D, now: number, seconds: number): void {
    const there = walkAlong(this.badGuys[0], this.stops, CARRY_SPEED, now, seconds);
    stepTowards(this.badGuys[1], this.badGuys[0].model.position, CARRY_SPEED, BEHIND, now, seconds);
    holdInArms(you, this.badGuys[0]);
    if (!there) return;
    for (const badGuy of this.badGuys) badGuy.model.visible = false;
    this.part = "waiting";
    this.asleepFor = 0;
    game.takenAtNight();
  }
}
