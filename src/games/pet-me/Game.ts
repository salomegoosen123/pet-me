// Game.ts – the whole Pet Me game. Mia designed this game.
import { Pet } from "./Pet";
import { PET_NAME, RUN_SPEED, SWIM_SPEED, TICK_MS } from "./settings";

const MS_IN_A_SECOND: number = 1000;

// the places Saydee can be
export type Place = "home" | "park" | "pool";

// the Game holds the pet and makes time pass
export class Game {
  pet: Pet;
  started: boolean;
  place: Place;

  constructor() {
    this.pet = new Pet(PET_NAME);
    this.started = false;
    this.place = "home";
  }

  // this starts the game when you press Play
  start(): void {
    this.started = true;
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

  // this brings her back home
  goHome(): void {
    this.place = "home";
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
    if (atPark) this.pet.move(RUN_SPEED);
    if (this.place === "pool") this.pet.move(SWIM_SPEED);
  }
}
