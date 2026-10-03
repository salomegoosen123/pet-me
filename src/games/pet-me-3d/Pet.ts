// Pet.ts – Saydee's bars, and what she is doing: resting, going somewhere, eating, drinking, bathing or sleeping. Mia designed this game.
import {
  BATH_SECONDS, DRINK_AMOUNT, EAT_SECONDS, FEED_AMOUNT, HUNGER_DROP, HUNGER_START, SLEEP_AMOUNT, SLEEP_DROP,
  SLEEP_SECONDS, SLEEP_START, TREAT_AMOUNT, WALK_SECONDS, WATER_DROP, WATER_START,
} from "./settings";

const SECONDS_IN_A_MINUTE: number = 60;

// the things she can be sent to do: eat, drink, have a bath, or have a sleep on her bed
export type Errand = "food" | "water" | "bath" | "sleep";

// what she is doing right now
export type Doing = "resting" | "walkingThere" | "busy" | "walkingBack";

// how long she takes to walk there (her bed is where she already is, so no walking for a sleep)
const WALK_TIME: Record<Errand, number> = { food: WALK_SECONDS, water: WALK_SECONDS, bath: WALK_SECONDS, sleep: 0 };

// how long each errand takes, once she gets there
const BUSY_TIME: Record<Errand, number> = { food: EAT_SECONDS, water: EAT_SECONDS, bath: BATH_SECONDS, sleep: SLEEP_SECONDS };

// this takes a bar down a little, as time passes
function drop(bar: number, perMinute: number, seconds: number): number {
  return Math.max(0, bar - (perMinute * seconds) / SECONDS_IN_A_MINUTE);
}

// a Pet has a hunger bar, a water bar and a sleep bar, and is always doing one thing
export class Pet {
  hunger: number;
  water: number;
  rest: number; // her sleep bar
  doing: Doing;
  errand: Errand; // what she is going to do, or just did
  timeLeft: number; // seconds until she moves on to the next thing

  constructor() {
    this.hunger = HUNGER_START;
    this.water = WATER_START;
    this.rest = SLEEP_START;
    this.doing = "resting";
    this.errand = "food";
    this.timeLeft = 0;
  }

  // this sends her off to do something, but only if she is resting
  goTo(errand: Errand): void {
    if (this.doing !== "resting") return;
    this.errand = errand;
    this.doing = "walkingThere";
    this.timeLeft = WALK_TIME[errand];
  }

  // this makes a bit of time pass: her bars go down, and she moves on when it's time
  live(seconds: number): void {
    this.hunger = drop(this.hunger, HUNGER_DROP, seconds);
    this.water = drop(this.water, WATER_DROP, seconds);
    if (!(this.doing === "busy" && this.errand === "sleep")) this.rest = drop(this.rest, SLEEP_DROP, seconds);
    if (this.doing === "resting") return;
    this.timeLeft = this.timeLeft - seconds;
    if (this.timeLeft > 0) return;
    this.nextThing();
  }

  // this moves her on: walk there, then do it, then walk back, then rest
  nextThing(): void {
    if (this.doing === "walkingThere") {
      this.doing = "busy";
      this.timeLeft = BUSY_TIME[this.errand];
      return;
    }
    if (this.doing === "busy") {
      this.finishErrand();
      this.doing = "walkingBack";
      this.timeLeft = WALK_TIME[this.errand];
      return;
    }
    this.doing = "resting";
  }

  // this is her gobbling up a treat from the fridge
  eatTreat(): void {
    this.hunger = Math.min(HUNGER_START, this.hunger + TREAT_AMOUNT);
  }

  // this is her finishing: food fills her tummy, water her water bar, and a sleep her sleep bar
  finishErrand(): void {
    if (this.errand === "food") this.hunger = Math.min(HUNGER_START, this.hunger + FEED_AMOUNT);
    if (this.errand === "water") this.water = Math.min(WATER_START, this.water + DRINK_AMOUNT);
    if (this.errand === "sleep") this.rest = Math.min(SLEEP_START, this.rest + SLEEP_AMOUNT);
  }
}
