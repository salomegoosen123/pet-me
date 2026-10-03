// TidyUpCall.ts – when you and your brother make a mess in the play room, Mum comes to the play room door
// and says "Clean up your room!". She waits there until it's tidy, then says "Well done!" and gives you a gold
// star for your shirt. Mia designed this game.
import { Vector3 } from "three";
import type { Away } from "./FamilyWalker";
import { ROOM_WALL } from "./homeSpots";
import type { Person3D } from "./Person3D";
import { PLAYROOM_DOOR_Z } from "./playRoom";
import { routeBetween } from "./routes";
import { FAMILY_WALK_SPEED } from "./settings";
import { SpeechBubble3D } from "./SpeechBubble3D";
import { walkAlong } from "./walking";

const AT_THE_DOOR: Vector3 = new Vector3(-ROOM_WALL + 1, 0, PLAYROOM_DOOR_Z); // in your bedroom, at the play room door
const INTO_THE_PLAY_ROOM: Vector3 = new Vector3(-ROOM_WALL - 3, 0, PLAYROOM_DOOR_Z); // where she looks
const NAG_SECONDS: number = 8; // she says it again if you still haven't tidied up after this long
const ABOVE_HER: number = 2.9; // her speech bubble floats this far above her feet

// TidyUpCall is Mum coming to the play room door to tell you to tidy up
export class TidyUpCall implements Away {
  bubble: SpeechBubble3D; // "Clean up your room!"
  stops: Vector3[]; // the doors on her way to the play room
  nagIn: number; // how long until she says it (again)
  starForYou: boolean; // has she got a star to put on your shirt

  constructor() {
    this.bubble = new SpeechBubble3D();
    this.stops = [];
    this.nagIn = 0;
    this.starForYou = false;
  }

  // she works out the way to the play room door
  begin(person: Person3D): void {
    this.stops = routeBetween(person.model.position, AT_THE_DOOR);
    this.nagIn = 0;
  }

  // she walks to the play room door, looks in, and tells you to clean up your room
  move(person: Person3D, you: Person3D, now: number, seconds: number): void {
    if (!walkAlong(person, this.stops, FAMILY_WALK_SPEED, now, seconds)) return;
    person.model.position.y = 0;
    person.faceTowards(INTO_THE_PLAY_ROOM);
    this.nagIn = this.nagIn - seconds;
    if (this.nagIn > 0) return;
    this.bubble.say("Clean up your room! 🧹");
    this.nagIn = NAG_SECONDS;
  }

  // it's all tidy: she's pleased, and she's got a gold star for you
  wellDone(): void {
    this.bubble.say("Well done! Here's a star! ⭐");
    this.starForYou = true;
  }

  // this says if she's just given you a star (and then it's yours, so she doesn't give it twice)
  takeTheStar(): boolean {
    const star = this.starForYou;
    this.starForYou = false;
    return star;
  }

  // this keeps her speech bubble over her head
  followHer(mum: Person3D, seconds: number): void {
    this.bubble.follow(mum.model, ABOVE_HER, seconds);
  }

  // she goes back to what she was doing
  end(): void {
    this.stops = [];
  }

  // this throws her speech bubble away when the game closes
  stop(): void {
    this.bubble.throwAway();
  }
}
