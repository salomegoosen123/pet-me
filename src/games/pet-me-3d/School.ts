// School.ts – going to school, across the road. In the morning your brother puts his school bag on (and you get one
// too), and walks there. He waits for you at the door for a bit, then goes in and sits at his desk. When school's
// out, he walks home. Mia designed this game.
import { BoxGeometry, Vector3 } from "three";
import type { Mesh, Object3D } from "three";
import type { Away } from "./FamilyWalker";
import { FRONT } from "./house";
import { inUniform } from "./outfits";
import { makePart } from "./paint";
import type { Person3D, PersonLook } from "./Person3D";
import { routeBetween } from "./routes";
import {
  BROTHER_SEAT, IN_THE_DOORWAY, insideSchool, SCHOOL_DOOR, SCHOOL_SEAT_TOP, SCHOOL_SEATS, WAY_TO_BROTHERS_DESK,
} from "./schoolBuilding";
import { SCHOOL_BAG_COLOUR, SCHOOL_SECONDS, YOUR_SCHOOL_BAG_COLOUR } from "./settings";
import { SpeechBubble3D } from "./SpeechBubble3D";
import { walkAlong } from "./walking";

const OUTSIDE_THE_DOOR: Vector3 = new Vector3(0, 0, FRONT + 1); // your front door, outside...
const INSIDE_THE_DOOR: Vector3 = new Vector3(0, 0, FRONT - 1); // ...and inside
const WALK_SPEED: number = 2.2; // how fast he walks to school and back
const WAIT_FOR_YOU: number = 15; // how long he waits for you at the school door
const ABOVE_HIM: number = 2.1; // his speech bubble floats this far above his feet

// where your brother is with school: on his way there, waiting for you at the door, walking in to his desk,
// at school, on his way home, or home
type SchoolPart = "goingThere" | "waitingForYou" | "goingIn" | "atSchool" | "comingHome" | "home";

// this makes a school bag, for someone's back
function makeBag(colour: string): Mesh {
  return makePart(new BoxGeometry(0.5, 0.6, 0.25), colour, 0, 1.35, -0.38);
}

// SchoolRun is your brother (and you) going to school in the morning, and him coming home after
export class SchoolRun implements Away {
  clothes: PersonLook; // your brother's everyday clothes
  uniform: PersonLook; // and his school uniform
  bag: Mesh; // his school bag, on his back while he's out
  yourBag: Mesh; // your school bag
  bubble: SpeechBubble3D; // "Let's go to school!"
  part: SchoolPart;
  stops: Vector3[]; // where he walks next
  timeLeft: number; // how much longer he waits for you, or school goes on

  constructor(clothes: PersonLook) {
    this.clothes = clothes;
    this.uniform = inUniform(clothes);
    this.bag = makeBag(SCHOOL_BAG_COLOUR);
    this.yourBag = makeBag(YOUR_SCHOOL_BAG_COLOUR);
    this.bubble = new SpeechBubble3D();
    this.part = "home";
    this.stops = [];
    this.timeLeft = 0;
  }

  // his speech bubble, to go in the home
  models(): Object3D[] {
    return [this.bubble.model];
  }

  // it's morning: time for school! You get your school bag on too
  newDay(you: Person3D): void {
    this.part = "goingThere";
    you.model.add(this.yourBag);
  }

  // this says if your brother should be at school (or on his way there, or on his way home)
  schoolTime(): boolean {
    return this.part !== "home";
  }

  // this keeps his speech bubble over his head
  followHim(brother: Person3D, seconds: number): void {
    this.bubble.follow(brother.model, ABOVE_HIM, seconds);
  }

  // on a school day, he wears his school uniform (even when everyone else changes)
  keepUniformOn(person: Person3D): void {
    if (this.schoolTime()) person.dress(this.uniform);
  }

  // he puts his school uniform and bag on, and works out the way: out the front door and across the road
  begin(person: Person3D): void {
    person.dress(this.uniform);
    person.model.add(this.bag);
    this.bubble.say("Let's go to school! 🎒");
    this.stops = [...routeBetween(person.model.position, INSIDE_THE_DOOR), OUTSIDE_THE_DOOR, SCHOOL_DOOR];
  }

  // this walks him to school, waits for you, sits him at his desk a while, and walks him home
  move(person: Person3D, you: Person3D, now: number, seconds: number): void {
    if (this.part === "goingThere") this.walkToSchool(person, you, now, seconds);
    else if (this.part === "waitingForYou") this.waitForYou(person, you, seconds);
    else if (this.part === "goingIn") this.walkToHisDesk(person, now, seconds);
    else if (this.part === "atSchool") this.learn(person, seconds);
    else if (this.part === "comingHome") this.walkHome(person, now, seconds);
  }

  // he walks to school. If you're already inside, he goes straight in too
  walkToSchool(person: Person3D, you: Person3D, now: number, seconds: number): void {
    if (!walkAlong(person, this.stops, WALK_SPEED, now, seconds)) return;
    if (insideSchool(you.model.position)) {
      this.goIn();
      return;
    }
    this.timeLeft = WAIT_FOR_YOU;
    this.part = "waitingForYou";
  }

  // he waits for you at the school door, watching for you. When you go in (or he can't wait any longer), he goes in
  waitForYou(person: Person3D, you: Person3D, seconds: number): void {
    person.standStill();
    person.faceTowards(you.model.position);
    this.timeLeft = this.timeLeft - seconds;
    if (insideSchool(you.model.position) || this.timeLeft <= 0) this.goIn();
  }

  // he goes in, to his desk
  goIn(): void {
    this.stops = [...WAY_TO_BROTHERS_DESK, SCHOOL_SEATS[BROTHER_SEAT].spot];
    this.part = "goingIn";
  }

  // he walks to his desk, and sits down for school
  walkToHisDesk(person: Person3D, now: number, seconds: number): void {
    if (!walkAlong(person, this.stops, WALK_SPEED, now, seconds)) return;
    const seat = SCHOOL_SEATS[BROTHER_SEAT];
    person.sitDown(seat.spot, seat.facing, SCHOOL_SEAT_TOP);
    this.timeLeft = SCHOOL_SECONDS;
    this.part = "atSchool";
  }

  // he sits at his desk, learning things. When school's over, he gets up and heads home
  learn(person: Person3D, seconds: number): void {
    this.timeLeft = this.timeLeft - seconds;
    if (this.timeLeft > 0) return;
    person.standUp();
    person.model.position.copy(SCHOOL_SEATS[BROTHER_SEAT].spot);
    this.bubble.say("School's out! Let's go home! 🏠");
    this.stops = [WAY_TO_BROTHERS_DESK[1], IN_THE_DOORWAY, SCHOOL_DOOR, OUTSIDE_THE_DOOR, INSIDE_THE_DOOR];
    this.part = "comingHome";
  }

  // he walks home, and he's back. You take your school bag off too
  walkHome(person: Person3D, now: number, seconds: number): void {
    if (!walkAlong(person, this.stops, WALK_SPEED, now, seconds)) return;
    this.bubble.say("I'm home! 🏠");
    this.yourBag.removeFromParent();
    this.part = "home";
  }

  // he takes his school bag off and changes back into his clothes. If he had to stop before school was over
  // (like for dinner or bed), he's home now
  end(person: Person3D): void {
    person.model.remove(this.bag);
    person.dress(this.clothes);
    if (this.part === "home") return;
    if (person.isDown()) person.standUp();
    person.model.position.copy(INSIDE_THE_DOOR);
    this.yourBag.removeFromParent();
    this.part = "home";
  }

  // this throws his speech bubble away when the game closes
  stop(): void {
    this.bubble.throwAway();
  }
}
