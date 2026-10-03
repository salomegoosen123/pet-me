// JungleGymRide.ts – a go on the jungle gym: you climb up the front, stand on top, and jump down,
// and your brother climbs up after you and jumps down after you. Mia designed this game.
import { Vector3 } from "three";
import type { Keys } from "../../game-kit/useKeys";
import { JUNGLE_GYM_FRONT, JUNGLE_GYM_SPOT, JUNGLE_GYM_TOP } from "./jungleGym";
import type { Person3D } from "./Person3D";
import type { Ride } from "./ride";
import { CLIMB_SPEED } from "./settings";
import { anyArrowDown } from "./walking";

const FRONT: Vector3 = JUNGLE_GYM_SPOT.clone().add(new Vector3(0, 0, JUNGLE_GYM_FRONT + 0.25)); // the front of the bars
const RUN_SECONDS: number = 1; // how long your brother takes to run over (so he's just behind you)
const CROSS_SECONDS: number = 0.6; // how long it takes to step from the front onto the top
const JUMP_SECONDS: number = 0.6; // how long a jump down takes
const JUMP_HIGH: number = 0.6; // how high you jump up before you come down
const JUMP_AFTER_YOU: number = 0.3; // your brother jumps this long after you
const FACING_THE_BARS: number = Math.PI;
const FACING_OUT: number = 0;

// the parts of a go on the jungle gym
type ClimbPart = "runningOver" | "climbing" | "crossing" | "onTop" | "jumping" | "done";

// a Climber is one person having a go on the jungle gym, with their own spots so you don't bump into each other
interface Climber {
  person: Person3D;
  part: ClimbPart; // which part of their go they are on
  partTime: number; // how many seconds into that part they are
  runFrom: Vector3; // where they ran over from
  foot: Vector3; // where they start climbing
  top: Vector3; // where they stand on top
  landing: Vector3; // where they land when they jump down
}

// this makes one climber's spots, a little way along the jungle gym from the middle
function makeClimber(person: Person3D, along: number, part: ClimbPart): Climber {
  const aside = new Vector3(along, 0, 0);
  return {
    person,
    part,
    partTime: 0,
    runFrom: person.model.position.clone(),
    foot: FRONT.clone().add(aside),
    top: JUNGLE_GYM_SPOT.clone().add(aside).setY(JUNGLE_GYM_TOP),
    landing: FRONT.clone().add(aside).add(new Vector3(0, 0, 0.65)),
  };
}

// a JungleGymRide climbs you both up to the top, and jumps you both down when you press an arrow key
export class JungleGymRide implements Ride {
  brother: Person3D;
  you: Climber | null;
  him: Climber | null;

  constructor(brother: Person3D) {
    this.brother = brother;
    this.you = null;
    this.him = null;
  }

  // this starts you at the front of the jungle gym, and your brother running over
  begin(you: Person3D): void {
    this.you = makeClimber(you, -0.35, "climbing");
    this.him = makeClimber(this.brother, 0.45, "runningOver");
  }

  // this moves you both along your goes. It says if anyone is still on the jungle gym
  move(_you: Person3D, now: number, seconds: number, keys: Keys): boolean {
    if (this.you == null || this.him == null) return false;
    const youOn = this.moveClimber(this.you, now, seconds, anyArrowDown(keys));
    const heJumps = this.you.part === "done" || (this.you.part === "jumping" && this.you.partTime > JUMP_AFTER_YOU);
    const heOn = this.moveClimber(this.him, now, seconds, heJumps);
    return youOn || heOn;
  }

  // this moves one climber a bit further along. They jump down from the top when it's time. It says if they're still on
  moveClimber(climber: Climber, now: number, seconds: number, timeToJump: boolean): boolean {
    if (climber.part === "done") return false;
    climber.partTime = climber.partTime + seconds;
    if (climber.part === "runningOver") this.runOver(climber, now);
    else if (climber.part === "climbing") this.climb(climber, now);
    else if (climber.part === "crossing") this.cross(climber, now);
    else if (climber.part === "onTop") this.standOnTop(climber, timeToJump);
    else this.jumpDown(climber);
    return true;
  }

  // this moves someone on to the next part of their go
  nextPart(climber: Climber, part: ClimbPart): void {
    climber.part = part;
    climber.partTime = 0;
  }

  // this runs your brother over to the front of the bars
  runOver(climber: Climber, now: number): void {
    const along = Math.min(1, climber.partTime / RUN_SECONDS);
    climber.person.model.position.lerpVectors(climber.runFrom, climber.foot, along);
    climber.person.faceTowards(climber.foot);
    climber.person.marchOnTheSpot(now);
    if (along >= 1) this.nextPart(climber, "climbing");
  }

  // this climbs someone up the front bars
  climb(climber: Climber, now: number): void {
    const up = Math.min(1, climber.partTime * CLIMB_SPEED / JUNGLE_GYM_TOP);
    climber.person.model.position.copy(climber.foot).setY(JUNGLE_GYM_TOP * up);
    climber.person.model.rotation.y = FACING_THE_BARS;
    climber.person.marchOnTheSpot(now);
    if (up >= 1) this.nextPart(climber, "crossing");
  }

  // this steps someone across the top bars, from the front to their spot
  cross(climber: Climber, now: number): void {
    const along = Math.min(1, climber.partTime / CROSS_SECONDS);
    climber.person.model.position.lerpVectors(climber.foot.clone().setY(JUNGLE_GYM_TOP), climber.top, along);
    climber.person.marchOnTheSpot(now);
    if (along >= 1) this.nextPart(climber, "onTop");
  }

  // this stands someone on top, looking out, until it's time to jump down
  standOnTop(climber: Climber, timeToJump: boolean): void {
    climber.person.model.rotation.y = FACING_OUT;
    climber.person.standStill();
    if (timeToJump) this.nextPart(climber, "jumping");
  }

  // this jumps someone down in a big arc, onto the grass in front
  jumpDown(climber: Climber): void {
    const along = Math.min(1, climber.partTime / JUMP_SECONDS);
    climber.person.model.position.lerpVectors(climber.top, climber.landing, along);
    climber.person.model.position.y = JUNGLE_GYM_TOP * (1 - along) + Math.sin(along * Math.PI) * JUMP_HIGH;
    if (along >= 1) this.nextPart(climber, "done");
  }
}
