// Game.ts – the whole Pet Me 3D game. Mia designed this game.
import type { Keys } from "../../game-kit/useKeys";
import { Pet } from "./Pet";
import type { Errand } from "./Pet";
import { followOrStay, whoYouMean } from "./chatReplies";
import { BROTHER_FOLLOWS_YOU, PET_NAME, TICK_MS } from "./settings";

const MS_IN_A_SECOND: number = 1000;

// the places Saydee can be
export type Place = "home" | "park" | "beach" | "grandparents";

// the places you can take her out to, on her leash (Ouma and Oupa take you to theirs in their car)
export type Outing = "park" | "beach" | "grandparents";

// the playground things you can have a go on
export type PlayThing = "slide" | "swing" | "seesaw" | "climb";

// what you can ask for with a button, for the 3D home or the park to do
export type Ask = "sit" | "bed" | "apple" | "treat" | "throw" | "bone" | "ballPit" | "teddy" | "relax" | "build" | "dinner" | "giveApple" | "giveTeddy" | "takeTeddy" | "takePresent" | "givePresent" | "tvOn" | "tvOff" | "rideSaydee" | "getOffSaydee" | "goInTunnel" | "goOutTunnel" | "goDownTrapdoor" | "goUpTrapdoor" | "addBlock" | "knockDown" | "fountain" | PlayThing;

// what the buttons over Saydee at the park do: take her leash off, or clip it back on
export type LeashJob = "unleash" | "leashOn";

// what the buttons at your wardrobe do: put on your swimming costume, or your clothes
export type DressJob = "wearCostume" | "wearClothes" | "wearPJs";

// what you can be wearing: your everyday clothes, your swimming costume, or your PJs
export type Outfit = "clothes" | "costume" | "pjs" | "uniform";

// who comes to save you from the bad guys' hideout: Saydee (when they took you from the park), or the police (at night)
export type Rescuer = "saydee" | "police";

// what a button on a thing does: sends Saydee on an errand, asks for something, goes out, does her leash, or dresses you
export type Job = Errand | Ask | Outing | LeashJob | DressJob;

// the Game holds Saydee, knows her name and where she is, and makes time pass
export class Game {
  petName: string;
  pet: Pet;
  place: Place;
  started: boolean;
  keys: Keys; // the arrow keys, for walking
  asked: Ask | null; // the button you just pressed, until the 3D home has done it
  atFridge: boolean; // are you standing at the fridge with empty hands
  leashOn: boolean; // is Saydee on her leash
  outfit: Outfit; // what you're wearing (you can only swim in your costume)
  said: string | null; // what you just typed in the chat, until your family hears it
  chat: string[]; // the chat with your family, written under the game
  brotherFollows: boolean; // is your brother following you (say "follow me" or "stay" in the chat)
  underHome: boolean; // have the bad guys got you, in their hideout under your home
  rescuer: Rescuer; // who's coming to save you from the hideout
  inTheBase: boolean; // did you crawl into the bad guys' base, through their tunnel in the back yard
  badGuysInJail: boolean; // did the police take the bad guys to jail (then they never come again)
  stars: number; // how many gold stars Mum has put on your shirt, for tidying up the play room

  constructor(keys: Keys) {
    this.keys = keys;
    this.stars = 0;
    this.badGuysInJail = false;
    this.underHome = false;
    this.rescuer = "saydee";
    this.inTheBase = false;
    this.asked = null;
    this.atFridge = false;
    this.leashOn = true;
    this.outfit = "clothes";
    this.said = null;
    this.chat = [];
    this.brotherFollows = BROTHER_FOLLOWS_YOU;
    this.petName = PET_NAME;
    this.pet = new Pet();
    this.place = "home";
    this.started = false;
  }

  // this starts the game when you press Play
  start(): void {
    this.started = true;
  }

  // this sends her off on an errand, if she is at home
  sendTo(errand: Errand): void {
    if (this.place !== "home" || this.underHome) return; // she's too busy looking for you
    this.pet.goTo(errand);
  }

  // this sends her to her food bowl
  feed(): void {
    this.sendTo("food");
  }

  // this sends her to her water bowl
  giveWater(): void {
    this.sendTo("water");
  }

  // this puts her to sleep on her bed
  putToBed(): void {
    this.sendTo("sleep");
  }

  // this sends her to have a bath
  bathe(): void {
    this.sendTo("bath");
  }

  // this asks for something: to sit down, or an apple or a treat from the fridge
  ask(what: Ask): void {
    this.asked = what;
  }

  // Mum gives you a gold star for tidying up
  getAStar(): void {
    this.stars = this.stars + 1;
  }

  // it's morning: you put your school uniform on
  putOnUniform(): void {
    this.outfit = "uniform";
  }

  // this says if you're in your swimming costume, so you can swim
  inCostume(): boolean {
    return this.outfit === "costume";
  }

  // this does the job of a button on a thing
  doJob(job: Job): void {
    if (job === "unleash") this.unleash();
    else if (job === "leashOn") this.clipLeashOn();
    else if (job === "wearCostume") this.outfit = "costume";
    else if (job === "wearClothes") this.outfit = "clothes";
    else if (job === "wearPJs") this.outfit = "pjs";
    else if (job === "park" || job === "beach" || job === "grandparents") this.goOut(job);
    else if (job === "food" || job === "water" || job === "bath" || job === "sleep") this.sendTo(job);
    else this.ask(job); // everything else is something you ask the 3D home or the park to do
  }

  // this remembers what you typed in the chat, so your family can hear it (at home).
  // If you told your brother to follow you, or to stay (or didn't say who to), he does
  say(words: string): void {
    if (this.place !== "home" || words.trim() === "") return;
    this.said = words.trim();
    const talkingTo = whoYouMean(this.said);
    const follow = followOrStay(this.said);
    if (follow != null && (talkingTo == null || talkingTo === "brother")) this.brotherFollows = follow;
  }

  // this says what you typed in the chat, and forgets it once your family has heard it
  takeWhatYouSaid(): string | null {
    const words = this.said;
    this.said = null;
    return words;
  }

  // this says what you asked for, and forgets it once it has been done
  takeRequest(): Ask | null {
    const what = this.asked;
    this.asked = null;
    return what;
  }

  // this remembers if you are at the fridge, so the Apple and Treat buttons can show
  standAtFridge(there: boolean): void {
    this.atFridge = there;
  }

  // this gives Saydee the treat you brought her
  giveTreat(): void {
    this.pet.eatTreat();
  }

  // this takes her out to the park or the beach on her leash, if she is resting on her bed
  goOut(outing: Outing): void {
    if (this.pet.doing !== "resting" || this.underHome || this.inTheBase) return;
    this.place = outing;
    this.leashOn = true;
  }

  // this is the bad guys carrying you off from the park, to their hideout under your home.
  // Saydee runs home to look for you
  takenUnderHome(): void {
    this.place = "home";
    this.leashOn = true;
    this.underHome = true;
    this.rescuer = "saydee";
  }

  // this is the bad guys carrying you from your bed down to their hideout, at night. The police come to save you
  takenAtNight(): void {
    this.underHome = true;
    this.rescuer = "police";
  }

  // Saydee found you, and the bad guys ran away: you're free
  saved(): void {
    this.underHome = false;
  }

  // the police arrested the bad guys and took them to jail, so they can't come and take you any more
  lockUpBadGuys(): void {
    this.badGuysInJail = true;
  }

  // this is you crawling into the bad guys' base, through the end of their tunnel in the back yard
  goIntoTheBase(): void {
    this.inTheBase = true;
  }

  // this is you crawling back out
  comeOutOfTheBase(): void {
    this.inTheBase = false;
  }

  // this brings her back home
  goHome(): void {
    this.place = "home";
    this.leashOn = true;
  }

  // this takes Saydee's leash off, so she can run free
  unleash(): void {
    this.leashOn = false;
  }

  // this clips her leash back on
  clipLeashOn(): void {
    this.leashOn = true;
  }

  // this happens every TICK_MS
  tick(): void {
    if (!this.started) return;
    this.pet.live(TICK_MS / MS_IN_A_SECOND);
  }
}
