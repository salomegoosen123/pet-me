// paint.ts – the paint and the parts for every 3D thing in Pet Me 3D. Mia designed this game.
import { Mesh, MeshStandardMaterial } from "three";
import type { BufferGeometry } from "three";

// this makes a soft-looking colour for a 3D thing
export function paint(colour: string): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: colour, roughness: 0.8 });
}

// this makes one part of a 3D thing, in a colour, at a spot, with a shadow
export function makePart(shape: BufferGeometry, colour: string, x: number, y: number, z: number): Mesh {
  const part = new Mesh(shape, paint(colour));
  part.position.set(x, y, z);
  part.castShadow = true;
  return part;
}
