// SeaSwim.ts – swimming in the sea at the beach: you bob in the waves, and your brother comes swimming with you. Mia designed this game.
import { Vector3 } from "three";
import { BROTHER_TOWEL_SPOT } from "./beachFamily";
import type { BeachFamily } from "./beachFamily";
import type { Person3D } from "./Person3D";
import { swimDepth } from "./pool";
import { FAMILY_WALK_SPEED } from "./settings";

export const SEA_STARTS: number = -15; // the sea starts this far behind the middle of the beach
const BOB_HIGH: number = 0.05; // how far you bob up and down in the waves
const BOB_SPEED: number = 1.5; // how fast you bob (the same as the waves)
const NEXT_TO_YOU: Vector3 = new Vector3(1.2, 0, 0); // where your brother swims, next to you
const CLOSE_ENOUGH: number = 0.3; // this close to where he's going, he stops
const FAR_AWAY: number = 100; // walking never stops him by itself
const BROTHER_SPEED: number = FAMILY_WALK_SPEED * 1.5; // he hurries, because he loves swimming

// this says if a spot is in the sea
function inTheSea(spot: Vector3): boolean {
  return spot.z < SEA_STARTS;
}

// this sinks someone into the water up to their chest, bobbing in the waves, or keeps their feet on the sand
function floatOrStand(person: Person3D, now: number): void {
  const spot = person.model.position;
  spot.y = inTheSea(spot) ? swimDepth(person) + Math.sin(now * BOB_SPEED) * BOB_HIGH : 0;
}

// SeaSwim floats you in the sea, and brings your brother in to swim with you
export class SeaSwim {
  family: BeachFamily;
  brotherSwimming: boolean; // has your brother left his towel to swim with you

  constructor(family: BeachFamily) {
    this.family = family;
    this.brotherSwimming = false;
  }

  // this floats you (and your brother) in the sea, and sends him in. When you get out, he gets out too:
  // he follows you (if you told him to), or goes back to his towel
  update(you: Person3D, now: number, seconds: number, brotherFollows: boolean): void {
    floatOrStand(you, now);
    if (inTheSea(you.model.position)) this.swimWithYou(you, now, seconds);
    else if (this.brotherSwimming && brotherFollows) this.brotherSwimming = false;
    else if (this.brotherSwimming) this.backToHisTowel(now, seconds);
  }

  // this gets your brother up and swimming next to you
  swimWithYou(you: Person3D, now: number, seconds: number): void {
    const brother = this.family.brother;
    if (brother.isDown()) brother.standUp();
    this.brotherSwimming = true;
    const there = this.walkBrotherTo(you.model.position.clone().add(NEXT_TO_YOU), now, seconds);
    if (there) brother.faceTowards(you.model.position);
    floatOrStand(brother, now);
  }

  // this walks your brother back up the beach, and sits him on his towel when he gets there
  backToHisTowel(now: number, seconds: number): void {
    const brother = this.family.brother;
    floatOrStand(brother, now);
    if (!this.walkBrotherTo(BROTHER_TOWEL_SPOT, now, seconds)) return;
    this.family.brotherBackToHisTowel();
    this.brotherSwimming = false;
  }

  // this walks your brother a step towards a spot. It says if he's there
  walkBrotherTo(spot: Vector3, now: number, seconds: number): boolean {
    const brother = this.family.brother;
    const way = new Vector3(spot.x - brother.model.position.x, 0, spot.z - brother.model.position.z);
    if (way.length() < CLOSE_ENOUGH) {
      brother.standStill();
      return true;
    }
    brother.stepAlong(way.clone().normalize(), Math.min(way.length(), BROTHER_SPEED * seconds), FAR_AWAY, now);
    return false;
  }
}
