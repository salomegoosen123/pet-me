// walking.ts – you walking with the arrow keys, and a dog trotting after its person. Mia designed this game.
import { Vector3 } from "three";
import type { Keys } from "../../game-kit/useKeys";
import type { Dog3D } from "./Dog3D";
import type { Person3D } from "./Person3D";
import { FOLLOW_DISTANCE, YOU_SPEED } from "./settings";
import type { Stage3D } from "./stage";

const THERE: number = 0.05; // this close to a spot counts as being there

// this says if any arrow key is held down
export function anyArrowDown(keys: Keys): boolean {
  return keys.isDown("ArrowUp") || keys.isDown("ArrowDown") || keys.isDown("ArrowLeft") || keys.isDown("ArrowRight");
}

// this walks you with the arrow keys, the way the camera is looking, and says if you are walking
export function walkWithKeys(
  stage: Stage3D, you: Person3D, keys: Keys, edge: number, now: number, seconds: number,
): boolean {
  const forward = stage.groundForward();
  const right = new Vector3(-forward.z, 0, forward.x);
  const way = new Vector3();
  if (keys.isDown("ArrowUp")) way.add(forward);
  if (keys.isDown("ArrowDown")) way.sub(forward);
  if (keys.isDown("ArrowRight")) way.add(right);
  if (keys.isDown("ArrowLeft")) way.sub(right);
  if (way.lengthSq() === 0) {
    you.standStill();
    return false;
  }
  you.stepAlong(way.normalize(), YOU_SPEED * seconds, edge, now);
  return true;
}

// this walks someone a step towards a spot (but stops a little way short), or stands them still when they're there
export function stepTowards(person: Person3D, spot: Vector3, speed: number, stopShort: number, now: number, seconds: number): void {
  const way = new Vector3(spot.x - person.model.position.x, 0, spot.z - person.model.position.z);
  const distance = way.length() - stopShort;
  if (distance <= THERE) person.standStill();
  else person.stepAlong(way.normalize(), Math.min(distance, speed * seconds), Infinity, now);
}

// this walks someone to their next stop, then the one after, and says when they're at the last one
export function walkAlong(person: Person3D, stops: Vector3[], speed: number, now: number, seconds: number): boolean {
  if (stops.length === 0) return true;
  stepTowards(person, stops[0], speed, 0, now, seconds);
  const way = new Vector3(stops[0].x - person.model.position.x, 0, stops[0].z - person.model.position.z);
  if (way.length() < THERE * 2) stops.shift();
  return stops.length === 0;
}

// this says the spot just behind a person, where their dog trots along
export function spotBehind(person: Person3D, dog: Dog3D): Vector3 {
  const behind = person.model.position.clone().addScaledVector(person.facing(), -FOLLOW_DISTANCE);
  return behind.setY(dog.standingHeight());
}

// this makes a dog trot along just behind its person
export function trotBehind(dog: Dog3D, person: Person3D, speed: number, now: number, seconds: number): void {
  dog.walkTowards(spotBehind(person, dog), speed, seconds);
  dog.wag(now);
  dog.hop(now);
}
