// tree.ts – one tree, for the park and the back yard. Mia designed this game.
import { CylinderGeometry, Group, SphereGeometry } from "three";
import { makePart } from "./paint";
import { LEAVES_COLOUR, TRUNK_COLOUR } from "./settings";

// this makes one tree: a trunk with a big round top of leaves
export function makeTree(x: number, z: number): Group {
  const tree = new Group();
  const trunk = makePart(new CylinderGeometry(0.2, 0.25, 1.4, 12), TRUNK_COLOUR, 0, 0.7, 0);
  const leaves = makePart(new SphereGeometry(1.1, 24, 16), LEAVES_COLOUR, 0, 2.1, 0);
  tree.add(trunk, leaves);
  tree.position.set(x, 0, z);
  return tree;
}
