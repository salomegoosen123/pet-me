// jungleGym.ts – the jungle gym in the park playground: a climbing frame of colourful bars. Mia designed this game.
import { CylinderGeometry, Group, Vector3 } from "three";
import type { Mesh } from "three";
import { makePart } from "./paint";
import { JUNGLE_GYM_COLOURS } from "./settings";

export const JUNGLE_GYM_SPOT: Vector3 = new Vector3(4.5, 0, 0.5); // on your right when you arrive at the park
const BOX_SIZE: number = 0.8; // the jungle gym is made of boxes of bars, this big
const ACROSS: number = 3; // how many boxes wide it is
const DEEP: number = 2; // how many boxes from front to back
const HIGH: number = 2; // how many boxes tall
const BAR_THICKNESS: number = 0.04;
export const JUNGLE_GYM_TOP: number = HIGH * BOX_SIZE + BAR_THICKNESS; // how high the top bars are, to stand on
export const JUNGLE_GYM_FRONT: number = (DEEP * BOX_SIZE) / 2; // how far the front bars are from the middle
const QUARTER_TURN: number = Math.PI / 2;

// which way a bar goes
type Way = "up" | "leftToRight" | "frontToBack";

// this says how far a pole is from the middle, for the pole with this number in a row of boxes
function sideOf(pole: number, boxes: number): number {
  return (pole - boxes / 2) * BOX_SIZE;
}

// this says where every upright pole stands, from the middle of the jungle gym
function poleSpots(): Vector3[] {
  const spots: Vector3[] = [];
  for (let i = 0; i <= ACROSS; i++) {
    for (let j = 0; j <= DEEP; j++) spots.push(new Vector3(sideOf(i, ACROSS), 0, sideOf(j, DEEP)));
  }
  return spots;
}

// this picks the next colour from the list, going round and round
function nextColour(gym: Group): string {
  return JUNGLE_GYM_COLOURS[gym.children.length % JUNGLE_GYM_COLOURS.length];
}

// this makes one bar, going up, left to right, or front to back
function makeBar(length: number, way: Way, colour: string, spot: Vector3): Mesh {
  const bar = makePart(new CylinderGeometry(BAR_THICKNESS, BAR_THICKNESS, length, 8), colour, spot.x, spot.y, spot.z);
  if (way === "leftToRight") bar.rotation.z = QUARTER_TURN;
  if (way === "frontToBack") bar.rotation.x = QUARTER_TURN;
  return bar;
}

// this makes the jungle gym: upright poles, with bars across them at every level
export function makeJungleGym(): Group {
  const gym = new Group();
  const top = HIGH * BOX_SIZE;
  for (const pole of poleSpots()) gym.add(makeBar(top, "up", nextColour(gym), pole.clone().setY(top / 2)));
  for (let level = 1; level <= HIGH; level++) {
    const y = level * BOX_SIZE;
    for (let j = 0; j <= DEEP; j++) gym.add(makeBar(ACROSS * BOX_SIZE, "leftToRight", nextColour(gym), new Vector3(0, y, sideOf(j, DEEP))));
    for (let i = 0; i <= ACROSS; i++) gym.add(makeBar(DEEP * BOX_SIZE, "frontToBack", nextColour(gym), new Vector3(sideOf(i, ACROSS), y, 0)));
  }
  gym.position.copy(JUNGLE_GYM_SPOT);
  return gym;
}

// this says where the upright poles are in the park, so you and Saydee bump into them
export function jungleGymPosts(): Vector3[] {
  const posts: Vector3[] = [];
  for (const pole of poleSpots()) posts.push(pole.add(JUNGLE_GYM_SPOT));
  return posts;
}
