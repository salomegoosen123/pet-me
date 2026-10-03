// FamilyWalker.ts – someone in your family walking round the house: to a room, a little wait, then off somewhere else. Mia designed this game.
import { Vector3 } from "three";
import { bumpOff, bumpOffBlocks, bumpOffWalls, insideBlock } from "./bumping";
import type { Block } from "./bumping";
import type { Dog3D } from "./Dog3D";
import type { Hobby } from "./hobby";
import type { Chair } from "./kitchen";
import { BLOCKS_EVERYONE, BLOCKS_ONLY_YOU } from "./obstacles";
import { PERSON_SIZE } from "./Person3D";
import type { Person3D, PersonLook } from "./Person3D";
import { routeBetween } from "./routes";
import { FAMILY_WAIT_SECONDS, FAMILY_WALK_SPEED } from "./settings";
import { HOME_WALLS } from "./walls";

const FAR_AWAY: number = 100; // walking never stops them by itself: the walls and furniture do
const ARRIVED: number = 0.15; // this close to a stop counts as being there
const GIVE_UP_SECONDS: number = 6; // if something is in the way, they give up on that stop and go on to the next
const SINK_IN: number = -0.15; // how far down into the balls they sink
const BOUNCE_HIGH: number = 0.35; // how high they bounce in the ball pit
const BOUNCE_SPEED: number = 6; // how fast they bounce
const AT_HOBBY: number = 1; // this close to their hobby spot, they start doing their hobby
const BEHIND_CHAIR: number = 0.7; // they walk to just behind their chair, then sit down

// this says how long to wait somewhere: sometimes a bit less, sometimes a bit more
function aWhile(): number {
  return FAMILY_WAIT_SECONDS * (0.5 + Math.random());
}

// someone's bed: where they stand next to it, and where they lie in it
export interface Bed {
  side: Vector3;
  lying: Vector3;
}

// something that takes someone away from their day for a while, like your brother swimming with you
export interface Away {
  begin(person: Person3D, you: Person3D): void; // gets them ready, like putting on a costume
  move(person: Person3D, you: Person3D, now: number, seconds: number): void; // moves them while they're away
  end(person: Person3D): void; // gets them back to normal, like putting their clothes back on
}

// what someone in your family does all day
export interface DayPlan {
  places: Vector3[]; // the places in the house they like to go
  bed: Bed; // their bed, for bedtime
  jumpIn: Block | null; // somewhere they can jump into and bounce about, like the ball pit (only your brother)
  hobby: Hobby | null; // something they love doing in one spot, like Mum cooking
  clothes: PersonLook; // what they wear in the day
  pjs: PersonLook; // what they wear when you've got your PJs on
}

// this says where someone stands to sit down on a chair: just behind it
function behindChair(chair: Chair): Vector3 {
  const facing = new Vector3(Math.sin(chair.facing), 0, Math.cos(chair.facing));
  return chair.spot.clone().addScaledVector(facing, -BEHIND_CHAIR);
}

// a FamilyWalker walks one person in your family from place to place, through the doors, and to bed at bedtime
export class FamilyWalker {
  person: Person3D;
  plan: DayPlan;
  bedtime: boolean; // is it bedtime, because you've gone to bed
  dinnerChair: Chair | null; // their chair at the kitchen table, while it's dinner time
  away: Away | null; // something they've gone off to do with you, like swimming (or null)
  stops: Vector3[]; // the doors on the way, then the place they're going to
  waitLeft: number; // how much longer they stay where they are
  stuckLeft: number; // how much longer they keep trying to get to the next stop

  constructor(person: Person3D, plan: DayPlan) {
    this.person = person;
    this.plan = plan;
    this.bedtime = false;
    this.dinnerChair = null;
    this.away = null;
    this.stops = [];
    this.waitLeft = aWhile();
    this.stuckLeft = GIVE_UP_SECONDS;
  }

  // this sends them off to do something with you, like swimming
  goAway(away: Away, you: Person3D): void {
    if (this.person.isDown()) this.person.standUp();
    this.away = away;
    away.begin(this.person, you);
  }

  // this brings them back from what they went off to do, ready to walk about again
  // (if they've just been called to dinner or to bed, they keep going there)
  comeBack(): void {
    if (this.away != null) this.away.end(this.person);
    this.away = null;
    if (this.bedtime || this.dinnerChair != null) return;
    this.stops = [];
    this.waitLeft = aWhile();
  }

  // this calls them to dinner: they walk to their chair at the kitchen table and sit down
  comeToDinner(chair: Chair): void {
    this.dinnerChair = chair;
    if (this.person.sitting) this.person.standUp(); // like Dad getting up from the sofa
    this.goTo(behindChair(chair));
  }

  // this says if they're sitting at the table, ready to eat
  atDinner(): boolean {
    return this.dinnerChair != null && this.person.sitting;
  }

  // this gets them up from the table after dinner, ready to walk about again
  dinnerIsOver(): void {
    if (this.dinnerChair != null && this.person.sitting) {
      this.person.standUp();
      this.person.model.position.copy(behindChair(this.dinnerChair));
    }
    this.dinnerChair = null;
    this.stops = [];
    this.waitLeft = aWhile();
  }

  // this sends them off to bed
  goToBed(): void {
    this.dinnerIsOver();
    this.bedtime = true;
    this.stops = routeBetween(this.person.model.position, this.plan.bed.side);
    this.stuckLeft = GIVE_UP_SECONDS;
  }

  // this gets them up, standing next to their bed, ready to walk about again
  wakeUp(): void {
    this.bedtime = false;
    if (this.person.lying) {
      this.person.standUp();
      this.person.model.position.copy(this.plan.bed.side);
    }
    this.stops = [];
    this.waitLeft = aWhile();
  }

  // this walks them to where they're going, or waits (doing their hobby, or looking at you), then picks somewhere new.
  // At bedtime, they walk to their bed and lie down in it
  move(you: Person3D, dog: Dog3D, now: number, seconds: number): void {
    const atHobby = this.atHobby();
    if (this.plan.hobby != null) this.plan.hobby.update(this.person, atHobby, now, seconds);
    if (this.away != null) {
      this.away.move(this.person, you, now, seconds);
      return;
    }
    if (this.bedtime && this.person.lying) return;
    if (this.bedtime && this.stops.length === 0) {
      this.person.lieDown(this.plan.bed.lying);
      return;
    }
    if (this.dinnerChair != null && this.person.sitting) return; // eating their dinner
    if (this.dinnerChair != null && this.stops.length === 0) {
      this.person.sitDown(this.dinnerChair.spot, this.dinnerChair.facing);
      return;
    }
    if (this.stops.length === 0) {
      this.waitAround(you, seconds, atHobby);
    } else {
      this.walkToNextStop(now, seconds);
      this.bump(you, dog);
    }
    this.bounce(now);
  }

  // this says if they are standing at their hobby spot, so they can do their hobby
  atHobby(): boolean {
    const hobby = this.plan.hobby;
    if (hobby == null || this.bedtime || this.dinnerChair != null || this.stops.length > 0) return false;
    const spot = this.person.model.position;
    return Math.hypot(spot.x - hobby.spot.x, spot.z - hobby.spot.z) < AT_HOBBY;
  }

  // this makes them stand still for a while, looking at you (unless they're busy with their hobby).
  // If their hobby needs them somewhere, like Mum taking a plate to the table, they go straight there
  waitAround(you: Person3D, seconds: number, atHobby: boolean): void {
    this.person.standStill();
    if (!atHobby) this.person.faceTowards(you.model.position);
    const hobby = this.plan.hobby;
    const errand = hobby == null ? null : hobby.errand();
    if (errand != null) {
      this.goTo(errand);
      return;
    }
    if (atHobby && hobby != null && hobby.keepsThemBusy()) return; // they stay until it's finished
    this.waitLeft = this.waitLeft - seconds;
    if (this.waitLeft <= 0) this.pickSomewhereNew();
  }

  // this picks a new place to go
  pickSomewhereNew(): void {
    const places = this.plan.places;
    this.goTo(places[Math.floor(Math.random() * places.length)]);
  }

  // this works out the doors on the way to a place, and sets off
  goTo(place: Vector3): void {
    this.stops = routeBetween(this.person.model.position, place);
    this.stuckLeft = GIVE_UP_SECONDS;
  }

  // this walks them a step towards the next stop, and on to the stop after when they get there
  walkToNextStop(now: number, seconds: number): void {
    const spot = this.person.model.position;
    const way = new Vector3(this.stops[0].x - spot.x, 0, this.stops[0].z - spot.z);
    this.stuckLeft = this.stuckLeft - seconds;
    if (way.length() < ARRIVED || this.stuckLeft <= 0) {
      this.stops.shift();
      this.stuckLeft = GIVE_UP_SECONDS;
      if (this.stops.length === 0) this.waitLeft = aWhile();
      return;
    }
    const step = Math.min(way.length(), FAMILY_WALK_SPEED * seconds);
    this.person.stepAlong(way.normalize(), step, FAR_AWAY, now);
  }

  // this bounces them up and down while they're in the ball pit, and keeps their feet on the floor everywhere else
  bounce(now: number): void {
    if (this.person.isDown()) return; // sitting on the sofa, so leave them be
    const spot = this.person.model.position;
    const jumpIn = this.plan.jumpIn;
    const bouncing = jumpIn != null && insideBlock(spot, jumpIn);
    spot.y = bouncing ? SINK_IN + Math.abs(Math.sin(now * BOUNCE_SPEED)) * BOUNCE_HIGH : 0;
  }

  // this stops them walking through walls, furniture, you or Saydee (but not into the ball pit, if they can jump in)
  bump(you: Person3D, dog: Dog3D): void {
    const spot = this.person.model.position;
    const jumpIn = this.plan.jumpIn;

    // this says if a block is in their way
    function inTheWay(block: Block): boolean {
      return block !== jumpIn;
    }

    bumpOffWalls(spot, PERSON_SIZE, HOME_WALLS);
    bumpOffBlocks(spot, PERSON_SIZE, BLOCKS_EVERYONE.filter(inTheWay));
    bumpOffBlocks(spot, PERSON_SIZE, BLOCKS_ONLY_YOU);
    bumpOff(spot, PERSON_SIZE, you.model.position, PERSON_SIZE);
    bumpOff(spot, PERSON_SIZE, dog.model.position, dog.bumpSize());
  }
}
