// parkThings.ts – the grass, trees, flowers and playground in the 3D park. Mia designed this game.
import { Mesh, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import type { Group, Scene } from "three";
import { makePart, paint } from "./paint";
import { ParkBench } from "./ParkBench";
import { makePlayground, playgroundPosts } from "./playground";
import { PlaygroundPlay } from "./PlaygroundPlay";
import type { PlayPlace } from "./ride";
import type { Scenery } from "./scenery";
import { FLOWER_COLOURS, FLOWER_COUNT, GRASS_COLOUR, SKY_COLOUR, TREE_COUNT } from "./settings";
import { makeTree } from "./tree";

const PARK_EDGE: number = 18; // you can't walk farther than this from the middle of the park

const GRASS_SIZE: number = 60;
const FLAT: number = -Math.PI / 2; // turns a flat thing so it lies on the ground
const TREES_AWAY: number = 8; // how far the trees stand from the middle
const FLOWERS_NEAR: number = 3; // the nearest a flower grows to you
const FLOWERS_FAR: number = 12; // the farthest
const SNIFF_FROM_TREE: number = 0.85; // Saydee stands this far from a tree to sniff it

// this makes the grass
export function makeGrass(): Mesh {
  const grass = new Mesh(new PlaneGeometry(GRASS_SIZE, GRASS_SIZE), paint(GRASS_COLOUR));
  grass.rotation.x = FLAT;
  grass.receiveShadow = true;
  return grass;
}


// this says where each tree stands, in a big circle around the middle
function treeSpots(): Vector3[] {
  const spots: Vector3[] = [];
  for (let i = 0; i < TREE_COUNT; i++) {
    const angle = (i / TREE_COUNT) * Math.PI * 2;
    spots.push(new Vector3(Math.cos(angle) * TREES_AWAY, 0, Math.sin(angle) * TREES_AWAY));
  }
  return spots;
}

// this makes one tree at a spot
function makeTreeAt(spot: Vector3): Group {
  return makeTree(spot.x, spot.z);
}

// this makes all the trees, in a big circle around you
export function makeTrees(): Group[] {
  return treeSpots().map(makeTreeAt);
}

// this makes all the flowers, dotted about on the grass in lots of colours
export function makeFlowers(): Mesh[] {
  const flowers: Mesh[] = [];
  for (let i = 0; i < FLOWER_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = FLOWERS_NEAR + Math.random() * (FLOWERS_FAR - FLOWERS_NEAR);
    const colour = FLOWER_COLOURS[i % FLOWER_COLOURS.length];
    flowers.push(makePart(new SphereGeometry(0.1, 12, 8), colour, Math.cos(angle) * distance, 0.1, Math.sin(angle) * distance));
  }
  return flowers;
}

// this says where a flower grows
function whereItGrows(flower: Mesh): Vector3 {
  return flower.position.clone();
}

// this says where Saydee stands to sniff a tree: just in front of it, on the side near the middle
function inFrontOfTree(tree: Vector3): Vector3 {
  return tree.clone().setLength(TREES_AWAY - SNIFF_FROM_TREE);
}

// the park: grass, a circle of trees, flowers, and a playground
export class ParkScenery implements Scenery {
  skyColour: string = SKY_COLOUR;
  edge: number = PARK_EDGE;
  swimEdge: number = PARK_EDGE; // there's no sea at the park, so it's the same
  saydeeComes: boolean = true;
  canDig: boolean = false;
  canUnleash: boolean = true;
  hasBone: boolean = true;
  hasBadGuys: boolean = true;
  playPlace: PlayPlace = new PlaygroundPlay(); // the Play buttons on the playground
  flowerSpots: Vector3[] = []; // where the flowers grow, for Saydee to sniff
  bench: ParkBench = new ParkBench(); // your mum and dad, sitting on a bench

  // this puts the grass, trees, flowers, playground and bench in the park
  build(scene: Scene): void {
    const flowers = makeFlowers();
    this.flowerSpots = flowers.map(whereItGrows);
    scene.add(makeGrass(), ...makeTrees(), ...flowers, makePlayground(), ...this.bench.models());
  }

  // the trees and the flowers, for Saydee to sniff when she's off her leash
  sniffSpots(): Vector3[] {
    return [...treeSpots().map(inFrontOfTree), ...this.flowerSpots];
  }

  // nothing moves in the park by itself yet
  move(): void {
    return;
  }

  // there are no other dogs in the park yet
  otherDogs(): Vector3[] {
    return [];
  }

  // and no other people
  otherPeople(): Vector3[] {
    return [];
  }

  // the tree trunks, the playground poles, and the bench
  fixedThings(): Vector3[] {
    return [...treeSpots(), ...playgroundPosts(), ...this.bench.spots()];
  }
}
