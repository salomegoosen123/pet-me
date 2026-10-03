// Friend.ts – someone at the beach, strolling along with their dog on a leash. Mia designed this game.
import { Vector3 } from "three";
import type { Object3D } from "three";
import { Dog3D } from "./Dog3D";
import type { DogLook } from "./Dog3D";
import { Leash3D } from "./Leash3D";
import { Person3D } from "./Person3D";
import type { PersonLook } from "./Person3D";
import { trotBehind } from "./walking";

const STROLL_SPEED: number = 1.2; // how fast friends stroll, slower than you
const DOG_SPEED: number = 2; // how fast their dogs trot
const THERE: number = 0.3; // this close to a spot counts as being there

// this picks a new spot somewhere on the sand to stroll to
function pickSpot(edge: number): Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * edge;
  return new Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
}

// a Friend is a person and their dog, walking from spot to spot
export class Friend {
  person: Person3D;
  dog: Dog3D;
  leash: Leash3D;
  goingTo: Vector3;
  edge: number;

  constructor(personLook: PersonLook, dogLook: DogLook, edge: number) {
    this.person = new Person3D(personLook);
    this.dog = new Dog3D(dogLook);
    this.leash = new Leash3D();
    this.edge = edge;
    this.person.model.position.copy(pickSpot(edge));
    this.dog.model.position.copy(this.person.model.position).setY(this.dog.standingHeight());
    this.goingTo = pickSpot(edge);
  }

  // this gives the 3D things to put on the beach
  models(): Object3D[] {
    return [this.person.model, this.dog.model, this.leash.model];
  }

  // this makes them stroll to a spot, then pick a new one, with the dog trotting behind
  stroll(now: number, seconds: number): void {
    const way = this.goingTo.clone().sub(this.person.model.position).setY(0);
    if (way.length() < THERE) this.goingTo = pickSpot(this.edge);
    else this.person.stepAlong(way.normalize(), STROLL_SPEED * seconds, this.edge, now);
    trotBehind(this.dog, this.person, DOG_SPEED, now, seconds);
    this.leash.stretch(this.dog.collarSpot(), this.person.handSpot());
  }
}
