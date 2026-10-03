// Pet.ts – a pet with a name and her bars, who can run and fetch. Mia designed this game.
import {
  DRINK_AMOUNT, FEED_AMOUNT, FETCH_JOY, GROW_SPEED, GROWN_UP, HAPPY_DROP, HAPPY_START,
  HUNGER_DROP, HUNGER_START, HUNGRY_SADNESS, LOW_AT, PARK_HUNGER_DROP, PARK_JOY,
  PARK_WATER_DROP, PET_AMOUNT, PUPPY_SIZE, SLEEP_AMOUNT, SLEEP_DROP, SLEEP_START,
  WATER_DROP, WATER_START,
} from "./settings";

const SECONDS_IN_A_MINUTE: number = 60;
const MIDDLE: number = 40; // where she stands at the start
const LEFT_EDGE: number = 12; // she turns around here, next to you
const RIGHT_EDGE: number = 85; // and here

// this works out how much a bar goes down in a few seconds
function dropIn(perMinute: number, seconds: number): number {
  return (perMinute * seconds) / SECONDS_IN_A_MINUTE;
}

// a Pet has a name, a happiness bar, a hunger bar, a water bar and a sleep bar
export class Pet {
  name: string;
  happiness: number;
  hunger: number;
  water: number;
  rest: number; // her sleep bar
  growth: number; // how much she has grown, from 0 (tiny puppy) to GROWN_UP
  x: number; // where she is, from the left side (0) to the right side (100)
  direction: 1 | -1; // 1 is running right, -1 is running left

  constructor(name: string) {
    this.name = name;
    this.happiness = HAPPY_START;
    this.hunger = HUNGER_START;
    this.water = WATER_START;
    this.rest = SLEEP_START;
    this.growth = 0;
    this.x = MIDDLE;
    this.direction = 1;
  }

  // this makes her a little bit hungrier, and a lot when she is running at the park
  getHungrier(seconds: number, running: boolean): void {
    const perMinute = running ? PARK_HUNGER_DROP : HUNGER_DROP;
    this.hunger = Math.max(0, this.hunger - dropIn(perMinute, seconds));
  }

  // this makes her a little bit thirstier, and a lot when she is running at the park
  getThirstier(seconds: number, running: boolean): void {
    const perMinute = running ? PARK_WATER_DROP : WATER_DROP;
    this.water = Math.max(0, this.water - dropIn(perMinute, seconds));
  }

  // this makes her a little bit sleepier
  getSleepier(seconds: number): void {
    this.rest = Math.max(0, this.rest - dropIn(SLEEP_DROP, seconds));
  }

  // this makes her a bit less happy, and even less when she is hungry
  getSadder(seconds: number): void {
    let sadness = HAPPY_DROP;
    if (this.hunger < LOW_AT) sadness = sadness + HUNGRY_SADNESS;
    this.happiness = Math.max(0, this.happiness - dropIn(sadness, seconds));
  }

  // this makes her happier while she plays at the park
  haveFun(seconds: number): void {
    this.happiness = Math.min(HAPPY_START, this.happiness + dropIn(PARK_JOY, seconds));
  }

  // this makes her happier when you pet her
  getPetted(): void {
    this.happiness = Math.min(HAPPY_START, this.happiness + PET_AMOUNT);
  }

  // this says if you are looking after her well: all her bars are green
  isLookedAfter(): boolean {
    return this.happiness > LOW_AT && this.hunger > LOW_AT && this.water > LOW_AT && this.rest > LOW_AT;
  }

  // this makes her grow a little, but only when you look after her well
  grow(seconds: number): void {
    if (!this.isLookedAfter()) return;
    this.growth = Math.min(GROWN_UP, this.growth + dropIn(GROW_SPEED, seconds));
  }

  // this sets how grown up she is, from what was saved last time
  rememberGrowth(saved: number): void {
    this.growth = Math.min(GROWN_UP, Math.max(0, saved));
  }

  // this says how big she looks, from PUPPY_SIZE up to 100
  size(): number {
    return PUPPY_SIZE + ((100 - PUPPY_SIZE) * this.growth) / GROWN_UP;
  }

  // this makes her happier when she catches a toy
  catchToy(): void {
    this.happiness = Math.min(HAPPY_START, this.happiness + FETCH_JOY);
  }

  // this fills her tummy back up
  eat(): void {
    this.hunger = Math.min(HUNGER_START, this.hunger + FEED_AMOUNT);
  }

  // this gives her a drink
  drink(): void {
    this.water = Math.min(WATER_START, this.water + DRINK_AMOUNT);
  }

  // this gives her a nap
  sleep(): void {
    this.rest = Math.min(SLEEP_START, this.rest + SLEEP_AMOUNT);
  }

  // this makes her run or swim a bit, and turn around at the edge
  move(speed: number): void {
    this.x = this.x + speed * this.direction;
    if (this.x >= RIGHT_EDGE) {
      this.x = RIGHT_EDGE;
      this.direction = -1;
    }
    if (this.x <= LEFT_EDGE) {
      this.x = LEFT_EDGE;
      this.direction = 1;
    }
  }

  // this makes her run towards a spot, and says if she got there
  runTo(spot: number, speed: number): boolean {
    if (Math.abs(spot - this.x) <= speed) {
      this.x = spot;
      return true;
    }
    this.direction = spot > this.x ? 1 : -1;
    this.x = this.x + speed * this.direction;
    return false;
  }
}
