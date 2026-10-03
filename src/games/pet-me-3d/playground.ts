// playground.ts – the playground in the 3D park: a slide and a jungle gym.
// (The swings and the seesaw are in Swings3D.ts and Seesaw3D.ts, because they move.) Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, Vector3 } from "three";
import { jungleGymPosts, makeJungleGym } from "./jungleGym";
import { makePart } from "./paint";
import { SEESAW_SPOT } from "./Seesaw3D";
import { SLIDE_COLOUR, SLIDE_HEIGHT } from "./settings";
import { FRAME_COLOUR, makeCrossPole, swingsPosts } from "./Swings3D";

export const SLIDE_SPOT: Vector3 = new Vector3(0, 0, -4.6); // straight in front of you when you arrive at the park
const SLIDE_SLOPE: number = 0.7; // how steep the slide is
const CHUTE_LENGTH: number = SLIDE_HEIGHT / Math.sin(SLIDE_SLOPE); // a taller slide is a longer slide
export const CHUTE_REACH: number = SLIDE_HEIGHT / Math.tan(SLIDE_SLOPE); // how far out along the grass it comes

// this makes the slide: a platform on four poles, a ladder at the back, and the slide down the front
function makeSlide(): Group {
  const slide = new Group();
  slide.add(makePart(new BoxGeometry(0.9, 0.1, 0.9), FRAME_COLOUR, 0, SLIDE_HEIGHT, 0));
  for (const x of [-0.4, 0.4]) {
    for (const z of [-0.4, 0.4]) slide.add(makePart(new CylinderGeometry(0.05, 0.05, SLIDE_HEIGHT, 8), FRAME_COLOUR, x, SLIDE_HEIGHT / 2, z));
  }
  for (let rung = 0.3; rung < SLIDE_HEIGHT; rung += 0.3) slide.add(makeCrossPole(0.8, 0, rung, -0.4));
  const chute = new Group();
  chute.add(
    makePart(new BoxGeometry(0.8, 0.05, CHUTE_LENGTH), SLIDE_COLOUR, 0, 0, CHUTE_LENGTH / 2),
    makePart(new BoxGeometry(0.05, 0.18, CHUTE_LENGTH), SLIDE_COLOUR, -0.42, 0.08, CHUTE_LENGTH / 2),
    makePart(new BoxGeometry(0.05, 0.18, CHUTE_LENGTH), SLIDE_COLOUR, 0.42, 0.08, CHUTE_LENGTH / 2),
  );
  chute.position.set(0, SLIDE_HEIGHT, 0.45);
  chute.rotation.x = SLIDE_SLOPE; // tips the slide down to the grass
  slide.add(chute);
  slide.position.copy(SLIDE_SPOT);
  return slide;
}

// this makes the playground things that stay still: the slide and the jungle gym
export function makePlayground(): Group {
  const playground = new Group();
  playground.add(makeSlide(), makeJungleGym());
  return playground;
}

// this says where the poles and posts are, so you and Saydee bump into them
export function playgroundPosts(): Vector3[] {
  const posts: Vector3[] = [...swingsPosts()];
  for (const x of [-0.4, 0.4]) {
    for (const z of [-0.4, 0.4]) posts.push(SLIDE_SPOT.clone().add(new Vector3(x, 0, z)));
  }
  for (let along = 0.6; along < CHUTE_REACH; along += 0.9) posts.push(SLIDE_SPOT.clone().add(new Vector3(0, 0, 0.45 + along)));
  for (const x of [-1.3, 0, 1.3]) posts.push(SEESAW_SPOT.clone().add(new Vector3(x, 0, 0)));
  posts.push(...jungleGymPosts());
  return posts;
}
