// brotherOutside.ts – your brother following you round outside, at the park or at Ouma and Oupa's. Mia designed this game.
import { Vector3 } from "three";
import { bumpOff } from "./bumping";
import { spotBehindYou } from "./FollowYou";
import { PERSON_SIZE } from "./Person3D";
import type { Person3D } from "./Person3D";
import { FAMILY_WALK_SPEED } from "./settings";

const BROTHER_SPEED: number = FAMILY_WALK_SPEED * 1.7; // your brother walks as fast as you, so he keeps up
const CLOSE_ENOUGH: number = 1.6; // when he's this close to you, he stops and waits
const POST_SIZE: number = 0.3; // how much room a pole or a post takes up
const FAR_AWAY: number = 100; // walking never stops him by itself

// this walks your brother after you, and stops him when he's close. He bumps into posts, and into you
export function followYouOutside(brother: Person3D, you: Person3D, now: number, seconds: number, posts: Vector3[]): void {
  const here = brother.model.position;
  if (Math.hypot(here.x - you.model.position.x, here.z - you.model.position.z) < CLOSE_ENOUGH) {
    brother.standStill();
    brother.faceTowards(you.model.position);
    return;
  }
  const target = spotBehindYou(you);
  const way = new Vector3(target.x - here.x, 0, target.z - here.z);
  brother.stepAlong(way.clone().normalize(), Math.min(way.length(), BROTHER_SPEED * seconds), FAR_AWAY, now);
  for (const post of posts) bumpOff(here, PERSON_SIZE, post, POST_SIZE);
  bumpOff(here, PERSON_SIZE, you.model.position, PERSON_SIZE);
}
