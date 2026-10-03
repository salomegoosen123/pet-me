// beachThings.ts – the sand, the sea, umbrellas, and friends walking their dogs at the 3D beach. Mia designed this game.
import { ConeGeometry, CylinderGeometry, Mesh, PlaneGeometry, Vector3 } from "three";
import type { Scene } from "three";
import { BeachFamily } from "./beachFamily";
import { BeachPlay } from "./BeachPlay";
import type { PlayPlace } from "./ride";
import { Friend } from "./Friend";
import { makePart, paint } from "./paint";
import type { Scenery } from "./scenery";
import { SEA_STARTS } from "./SeaSwim";
import {
  BEACH_SKY_COLOUR, FRIEND_COUNT, FRIEND_DOG_COLOURS, FRIEND_DOG_SIZE, FRIEND_HAIR_COLOURS, FRIEND_SHIRT_COLOURS,
  FRIEND_SKIN_COLOURS, SAND_COLOUR, SEA_COLOUR, UMBRELLA_COLOURS,
} from "./settings";

const FLAT: number = -Math.PI / 2; // turns a flat thing so it lies on the ground
const BEACH_EDGE: number = 14; // in your clothes you walk no farther than this, so you stay on the sand (and so do the friends)
const SWIM_EDGE: number = 20; // in your swimming costume you can go farther, out into the sea for a swim
const WAVE_HEIGHT: number = 0.05; // how far the sea bobs up and down
const WAVE_SPEED: number = 1.5; // how fast it bobs
const SHORE: number = -12.5; // the wet sand near the sea, where Saydee likes to sniff

// this makes the sand
function makeSand(): Mesh {
  const sand = new Mesh(new PlaneGeometry(60, 60), paint(SAND_COLOUR));
  sand.rotation.x = FLAT;
  sand.receiveShadow = true;
  return sand;
}

// this makes the sea, stretching away behind the beach
function makeSea(): Mesh {
  const sea = new Mesh(new PlaneGeometry(90, 60), paint(SEA_COLOUR));
  sea.rotation.x = FLAT;
  sea.position.set(0, 0.03, SEA_STARTS - 30);
  return sea;
}

// this says where each beach umbrella stands, in a row near the sea
function umbrellaSpots(): Vector3[] {
  const spots: Vector3[] = [];
  for (let i = 0; i < UMBRELLA_COLOURS.length; i++) spots.push(new Vector3(-8 + i * 6, 0, -11));
  return spots;
}

// this says where Saydee stands to sniff an umbrella: just in front of its pole
function inFrontOfUmbrella(pole: Vector3): Vector3 {
  return pole.clone().add(new Vector3(0, 0, 0.8));
}

// this makes the beach umbrellas
function makeUmbrellas(): Mesh[] {
  const parts: Mesh[] = [];
  const spots = umbrellaSpots();
  for (let i = 0; i < spots.length; i++) {
    parts.push(makePart(new CylinderGeometry(0.04, 0.04, 2.2, 8), "white", spots[i].x, 1.1, spots[i].z));
    parts.push(makePart(new ConeGeometry(1.3, 0.6, 24), UMBRELLA_COLOURS[i], spots[i].x, 2.3, spots[i].z));
  }
  return parts;
}

// this makes one friend and their dog, with colours picked from the lists
function makeFriend(which: number): Friend {
  const person = {
    hair: FRIEND_HAIR_COLOURS[which % FRIEND_HAIR_COLOURS.length],
    skin: FRIEND_SKIN_COLOURS[which % FRIEND_SKIN_COLOURS.length],
    shirt: FRIEND_SHIRT_COLOURS[which % FRIEND_SHIRT_COLOURS.length],
    pants: "navy",
    size: 1,
    ponytail: true,
    blanket: "white", // they never go to bed at the beach
  };
  const furColour = FRIEND_DOG_COLOURS[which % FRIEND_DOG_COLOURS.length];
  const dog = { fur: furColour, ears: furColour, spots: false, size: FRIEND_DOG_SIZE };
  return new Friend(person, dog, BEACH_EDGE);
}

// the beach: sand, the sea, umbrellas, and friends walking their dogs
export class BeachScenery implements Scenery {
  skyColour: string = BEACH_SKY_COLOUR;
  edge: number = BEACH_EDGE;
  swimEdge: number = SWIM_EDGE;
  saydeeComes: boolean = true;
  canDig: boolean = true;
  canUnleash: boolean = true;
  hasBone: boolean = false;
  hasBadGuys: boolean = false;
  family: BeachFamily = new BeachFamily(); // your mum, dad and brother, relaxing on their towels
  playPlace: PlayPlace = new BeachPlay(this.family); // your towel, and building a sandcastle with your brother
  sea: Mesh | null = null;
  friends: Friend[] = [];

  // this puts the sand, the sea, the umbrellas, your family and the friends on the beach
  build(scene: Scene): void {
    this.sea = makeSea();
    scene.add(makeSand(), this.sea, ...makeUmbrellas(), ...this.family.models());
    for (let i = 0; i < FRIEND_COUNT; i++) {
      const friend = makeFriend(i);
      this.friends.push(friend);
      scene.add(...friend.models());
    }
  }

  // this makes the waves bob, and the friends stroll about
  move(now: number, seconds: number): void {
    if (this.sea != null) this.sea.position.y = 0.03 + Math.sin(now * WAVE_SPEED) * WAVE_HEIGHT;
    for (const friend of this.friends) friend.stroll(now, seconds);
  }

  // this says where the friends' dogs are
  otherDogs(): Vector3[] {
    return this.friends.map(function whereTheirDogIs(friend: Friend): Vector3 {
      return friend.dog.model.position;
    });
  }

  // this says where the friends themselves are
  otherPeople(): Vector3[] {
    return this.friends.map(function whereTheyAre(friend: Friend): Vector3 {
      return friend.person.model.position;
    });
  }

  // the umbrella poles, and your family on their towels
  fixedThings(): Vector3[] {
    return [...umbrellaSpots(), ...this.family.spots()];
  }

  // off her leash, she zooms to the umbrellas and along the edge of the sea, sniffing
  sniffSpots(): Vector3[] {
    const spots = umbrellaSpots().map(inFrontOfUmbrella);
    for (const x of [-4, -2, 0, 2, 4]) spots.push(new Vector3(x, 0, SHORE));
    return spots;
  }
}
