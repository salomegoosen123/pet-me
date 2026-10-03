// Digging.ts – Saydee digging holes in the sand at the beach, all by herself. Mia designed this game.
import { CircleGeometry, Mesh, SphereGeometry, Vector3 } from "three";
import type { Scene } from "three";
import type { Dog3D } from "./Dog3D";
import { paint } from "./paint";
import { DIG_EVERY, DIG_SECONDS, HOLE_COLOUR, SAND_PILE_COLOUR } from "./settings";

const FLAT: number = -Math.PI / 2;
const HOLE_SIZE: number = 0.35;
const PAWS_AHEAD: number = 0.6; // the hole is this far in front of her, where her paws are
const PILE_BEHIND: number = 0.5; // the sand she kicks back lands this far behind her

// this makes a hole in front of her, and a pile of sand behind her
function makeHole(dog: Dog3D): Mesh[] {
  const facing = new Vector3(Math.sin(dog.model.rotation.y), 0, Math.cos(dog.model.rotation.y));
  const hole = new Mesh(new CircleGeometry(HOLE_SIZE, 20), paint(HOLE_COLOUR));
  hole.rotation.x = FLAT;
  hole.position.copy(dog.model.position).addScaledVector(facing, PAWS_AHEAD).setY(0.02);
  const pile = new Mesh(new SphereGeometry(0.3, 16, 8), paint(SAND_PILE_COLOUR));
  pile.scale.set(1, 0.35, 1);
  pile.position.copy(dog.model.position).addScaledVector(facing, -PILE_BEHIND).setY(0);
  pile.castShadow = true;
  return [hole, pile];
}

// Digging counts down to her next dig, and makes the hole when she's finished
export class Digging {
  waitLeft: number; // seconds until she wants to dig again
  digLeft: number; // seconds of digging left, while she's digging

  constructor() {
    this.waitLeft = DIG_EVERY;
    this.digLeft = 0;
  }

  // this says if she's digging right now; when it's time, she starts, and when she's done, the hole appears
  keepDigging(dog: Dog3D, scene: Scene, allowed: boolean, now: number, seconds: number): boolean {
    if (this.digLeft > 0) {
      this.digLeft = this.digLeft - seconds;
      dog.dig(now);
      dog.wag(now);
      if (this.digLeft <= 0) {
        scene.add(...makeHole(dog));
        this.waitLeft = DIG_EVERY;
      }
      return true;
    }
    if (!allowed) return false;
    this.waitLeft = this.waitLeft - seconds;
    if (this.waitLeft > 0) return false;
    this.digLeft = DIG_SECONDS;
    return true;
  }
}
