// Leash3D.ts – Saydee's leash in 3D, from her collar to your hand. Mia designed this game.
import { CylinderGeometry, Mesh, Vector3 } from "three";
import { paint } from "./paint";
import { LEASH_COLOUR } from "./settings";

const UP: Vector3 = new Vector3(0, 1, 0);
const LEASH_THICKNESS: number = 0.03;

// a Leash3D is a thin rope that stretches between two spots
export class Leash3D {
  model: Mesh;

  constructor() {
    this.model = new Mesh(new CylinderGeometry(LEASH_THICKNESS, LEASH_THICKNESS, 1, 8), paint(LEASH_COLOUR));
    this.model.castShadow = true;
  }

  // this stretches the leash from her collar to your hand
  stretch(from: Vector3, to: Vector3): void {
    const way = to.clone().sub(from);
    this.model.position.copy(from).addScaledVector(way, 0.5);
    this.model.scale.set(1, way.length(), 1);
    this.model.quaternion.setFromUnitVectors(UP, way.normalize());
  }
}
