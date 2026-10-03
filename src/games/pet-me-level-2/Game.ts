// Game.ts – the whole Pet Me level 2 game. Mia designed this game.
import { Pet } from "./Pet";
import { loadGrowth, saveGrowth } from "./saving";
import { Toy } from "./Toy";
import {
  FETCH_SPEED, PET_NAME, RUN_SPEED, SWIM_SPEED, TICK_MS, TOYS, TOY_LANDS_FAR, TOY_LANDS_NEAR,
} from "./settings";

const MS_IN_A_SECOND: number = 1000;
const YOUR_SPOT: number = 12; // where Saydee brings the toy back to, next to you

// the places Saydee can be
export type Place = "home" | "park" | "pool";

// the Game holds the pet and the toy, and makes time pass
export class Game {
  pet: Pet;
  started: boolean;
  place: Place;
  toy: Toy | null; // the toy you threw, or null when there isn't one out
  toysThrown: number;

  constructor() {
    this.pet = new Pet(PET_NAME);
    this.started = false;
    this.place = "home";
    this.toy = null;
    this.toysThrown = 0;
  }

  // this starts the game when you press Play, with Saydee as grown up as last time
  start(): void {
    this.started = true;
    this.pet.rememberGrowth(loadGrowth());
  }

  // this gives her some food
  feed(): void {
    this.pet.eat();
  }

  // this gives her some water
  giveWater(): void {
    this.pet.drink();
  }

  // this puts her to bed for a nap
  putToBed(): void {
    this.pet.sleep();
  }

  // this gives her a pet, which makes her happy
  petHer(): void {
    this.pet.getPetted();
  }

  // this takes her to the park
  goToPark(): void {
    this.place = "park";
  }

  // this takes her to the pool
  goToPool(): void {
    this.place = "pool";
  }

  // this brings her back home, and puts the toy away
  goHome(): void {
    this.place = "home";
    this.toy = null;
  }

  // this says which toy you throw next
  nextToy(): string {
    return TOYS[this.toysThrown % TOYS.length];
  }

  // this throws the next toy across the park
  throwToy(): void {
    if (this.place !== "park" || this.toy != null) return;
    const landsAt = TOY_LANDS_NEAR + Math.random() * (TOY_LANDS_FAR - TOY_LANDS_NEAR);
    this.toy = new Toy(this.nextToy(), YOUR_SPOT, landsAt);
    this.toysThrown = this.toysThrown + 1;
  }

  // this makes Saydee fetch the toy: run to it, catch it, and bring it back to you
  fetchToy(toy: Toy): void {
    if (toy.state === "flying") {
      toy.land();
      return;
    }
    if (toy.state === "lying") {
      if (this.pet.runTo(toy.x, FETCH_SPEED)) {
        toy.pickUp();
        this.pet.catchToy();
      }
      return;
    }
    const backWithYou = this.pet.runTo(YOUR_SPOT, FETCH_SPEED);
    toy.carryTo(this.pet.x);
    if (backWithYou) this.toy = null;
  }

  // this happens every TICK_MS
  tick(): void {
    if (!this.started) return;
    const seconds = TICK_MS / MS_IN_A_SECOND;
    const atPark = this.place === "park";
    this.pet.getHungrier(seconds, atPark);
    this.pet.getThirstier(seconds, atPark);
    if (atPark) this.pet.getSleepier(seconds); // at home she rests, so her sleep bar stays still
    if (atPark) this.pet.haveFun(seconds);
    else this.pet.getSadder(seconds);
    this.pet.grow(seconds);
    saveGrowth(this.pet.growth);
    if (atPark && this.toy != null) this.fetchToy(this.toy);
    else if (atPark) this.pet.move(RUN_SPEED);
    if (this.place === "pool") this.pet.move(SWIM_SPEED);
  }
}
