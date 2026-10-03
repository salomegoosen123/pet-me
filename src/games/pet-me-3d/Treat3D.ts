// Treat3D.ts – a meaty treat from the fridge, for Saydee. Mia designed this game.
import { CylinderGeometry, Group, SphereGeometry } from "three";
import { makePart } from "./paint";
import { TREAT_COLOUR } from "./settings";

const BONE_ACROSS: number = Math.PI / 2; // lays the bone on its side

// this makes a treat: a bit of meat on a little white bone
export function makeTreat(): Group {
  const treat = new Group();
  const meat = makePart(new SphereGeometry(0.12, 16, 12), TREAT_COLOUR, 0.04, 0, 0);
  meat.scale.set(1.3, 0.9, 0.9);
  const bone = makePart(new CylinderGeometry(0.025, 0.025, 0.3, 8), "white", -0.1, 0, 0);
  bone.rotation.z = BONE_ACROSS;
  const knob = makePart(new SphereGeometry(0.04, 8, 6), "white", -0.25, 0, 0);
  treat.add(meat, bone, knob);
  return treat;
}
