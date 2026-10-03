// SlideRide.ts – a go on the slide: you climb the ladder, step across the top, and whoosh down,
// and your brother runs over and has a go right after you. Mia designed this game.
import { Vector3 } from "three";
import type { Person3D } from "./Person3D";
import { CHUTE_REACH, SLIDE_SPOT } from "./playground";
import type { Ride } from "./ride";
import { CLIMB_SPEED, SLIDE_HEIGHT, SLIDE_SECONDS } from "./settings";

const LADDER_FOOT: Vector3 = SLIDE_SPOT.clone().add(new Vector3(0, 0, -0.65)); // where you stand to climb the ladder
const LADDER_TOP: Vector3 = LADDER_FOOT.clone().setY(SLIDE_HEIGHT);
const CHUTE_TOP: Vector3 = SLIDE_SPOT.clone().add(new Vector3(0, SLIDE_HEIGHT, 0.45)); // where you sit down at the top
const RUN_SECONDS: number = 1.2; // how long your brother takes to run over to the ladder (so he's just behind you)
const CROSS_SECONDS: number = 0.5; // how long it takes to step from the ladder to the top of the slide
const ON_THE_SLIDE: number = 0.05; // how far above the slide you sit
const HOP_OFF: number = 0.5; // how far past the end of the slide you land
const LAND_ASIDE: number = 0.8; // your brother lands this far to the side of you, so he doesn't land on you
const FACING_DOWN_THE_SLIDE: number = 0;

// the parts of a go on the slide
type SlidePart = "runningOver" | "climbing" | "crossing" | "sliding" | "done";

// a Goer is one person having a go on the slide
interface Goer {
  person: Person3D;
  part: SlidePart; // which part of their go they are on
  partTime: number; // how many seconds into that part they are
  runFrom: Vector3; // where they ran over to the ladder from
  landAside: number; // how far to the side they land
}

// a SlideRide takes you up the ladder and down the slide, with your brother just behind you
export class SlideRide implements Ride {
  brother: Person3D;
  goers: Goer[];

  constructor(brother: Person3D) {
    this.brother = brother;
    this.goers = [];
  }

  // this starts you at the bottom of the ladder, and your brother running over to it
  begin(you: Person3D): void {
    this.goers = [
      { person: you, part: "climbing", partTime: 0, runFrom: LADDER_FOOT, landAside: 0 },
      { person: this.brother, part: "runningOver", partTime: 0, runFrom: this.brother.model.position.clone(), landAside: LAND_ASIDE },
    ];
  }

  // this moves you both along your goes. It says if anyone is still on the slide
  move(_you: Person3D, now: number, seconds: number): boolean {
    let anyoneOn = false;
    for (const goer of this.goers) {
      if (this.moveGoer(goer, now, seconds)) anyoneOn = true;
    }
    return anyoneOn;
  }

  // this moves one person a bit further along their go. It says if they're still on
  moveGoer(goer: Goer, now: number, seconds: number): boolean {
    if (goer.part === "done") return false;
    goer.partTime = goer.partTime + seconds;
    if (goer.part === "runningOver") this.runOver(goer, now);
    else if (goer.part === "climbing") this.climb(goer, now);
    else if (goer.part === "crossing") this.cross(goer, now);
    else this.whoosh(goer);
    return true;
  }

  // this moves someone on to the next part of their go
  nextPart(goer: Goer, part: SlidePart): void {
    goer.part = part;
    goer.partTime = 0;
  }

  // this runs your brother over to the bottom of the ladder
  runOver(goer: Goer, now: number): void {
    const along = Math.min(1, goer.partTime / RUN_SECONDS);
    goer.person.model.position.lerpVectors(goer.runFrom, LADDER_FOOT, along);
    goer.person.faceTowards(LADDER_FOOT);
    goer.person.marchOnTheSpot(now);
    if (along >= 1) this.nextPart(goer, "climbing");
  }

  // this climbs someone up the ladder, one rung at a time
  climb(goer: Goer, now: number): void {
    const up = Math.min(1, goer.partTime * CLIMB_SPEED / SLIDE_HEIGHT);
    goer.person.model.position.lerpVectors(LADDER_FOOT, LADDER_TOP, up);
    goer.person.model.rotation.y = FACING_DOWN_THE_SLIDE;
    goer.person.marchOnTheSpot(now);
    if (up >= 1) this.nextPart(goer, "crossing");
  }

  // this steps someone across the top, from the ladder to the slide
  cross(goer: Goer, now: number): void {
    const along = Math.min(1, goer.partTime / CROSS_SECONDS);
    goer.person.model.position.lerpVectors(LADDER_TOP, CHUTE_TOP, along);
    goer.person.marchOnTheSpot(now);
    if (along >= 1) this.nextPart(goer, "sliding");
  }

  // this whooshes someone down, slow at the top and fast at the bottom, then hops them off
  whoosh(goer: Goer): void {
    const along = Math.min(1, goer.partTime / SLIDE_SECONDS);
    const down = along * along;
    const spot = CHUTE_TOP.clone().add(new Vector3(0, -SLIDE_HEIGHT * down, CHUTE_REACH * down));
    goer.person.sitDown(spot, FACING_DOWN_THE_SLIDE, spot.y + ON_THE_SLIDE);
    if (along < 1) return;
    goer.person.standUp();
    goer.person.model.position.set(spot.x + goer.landAside, 0, spot.z + HOP_OFF);
    this.nextPart(goer, "done");
  }
}
