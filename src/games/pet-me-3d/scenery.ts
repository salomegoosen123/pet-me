// scenery.ts – what an outside place has in it, like the park or the beach. Mia designed this game.
import type { Scene, Vector3 } from "three";
import type { PlayPlace } from "./ride";

// a Scenery knows its sky, how far you can walk, what's in it, and how its things move
export interface Scenery {
  skyColour: string;
  edge: number; // you can't walk farther than this from the middle
  swimEdge: number; // or this far, in your swimming costume (at the beach, that's out into the sea)
  saydeeComes: boolean; // does Saydee come here with you (she stays home when Ouma and Oupa fetch you)
  canDig: boolean; // can Saydee dig holes here
  canUnleash: boolean; // can you take Saydee's leash off here
  hasBone: boolean; // is Saydee's squeaky bone here
  hasBadGuys: boolean; // do bad guys sneak up on you here when Saydee isn't by your side
  playPlace: PlayPlace; // the things to play on here, like the playground or your beach towel
  build(scene: Scene): void; // puts everything in the place
  sniffSpots(): Vector3[]; // the places she zooms to and sniffs when she's off her leash
  move(now: number, seconds: number): void; // moves the things that move, like waves or people
  otherDogs(): Vector3[]; // where the other dogs are, so Saydee can want to go to them
  otherPeople(): Vector3[]; // where the other people are, so Saydee bumps into them
  fixedThings(): Vector3[]; // tree trunks and poles that nobody can walk through
}
