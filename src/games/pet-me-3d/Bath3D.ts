// Bath3D.ts – the bath in the bathroom, with water and bubbles. Mia designed this game.
import { BoxGeometry, Group, SphereGeometry } from "three";
import type { Mesh } from "three";
import { makePart } from "./paint";
import { BATH_COLOUR, BATH_WATER_COLOUR, BUBBLE_COLOUR, BUBBLE_COUNT } from "./settings";

const BATH_LENGTH: number = 2.2;
const BATH_WIDTH: number = 1.1;
const BATH_HEIGHT: number = 0.6;
const WATER_LEVEL: number = 0.52; // how high the water comes up
const BUBBLE_BOB: number = 0.06; // how far the bubbles bob up and down
const BUBBLE_SPEED: number = 3; // how fast they bob

// a Bath3D is a tub full of water, where bubbles appear while Saydee has a bath
export class Bath3D {
  model: Group;
  bubbles: Mesh[];

  constructor() {
    this.model = new Group();
    this.bubbles = [];
    this.build();
  }

  // this makes the tub, the water, and the bubbles (hidden until bath time)
  build(): void {
    const tub = makePart(new BoxGeometry(BATH_LENGTH, BATH_HEIGHT, BATH_WIDTH), BATH_COLOUR, 0, BATH_HEIGHT / 2, 0);
    tub.receiveShadow = true;
    const water = makePart(new BoxGeometry(BATH_LENGTH - 0.15, 0.02, BATH_WIDTH - 0.15), BATH_WATER_COLOUR, 0, WATER_LEVEL, 0);
    this.model.add(tub, water);
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const size = 0.08 + Math.random() * 0.1;
      const x = (Math.random() - 0.5) * (BATH_LENGTH - 0.3);
      const z = (Math.random() - 0.5) * (BATH_WIDTH - 0.3);
      const bubble = makePart(new SphereGeometry(size, 12, 8), BUBBLE_COLOUR, x, WATER_LEVEL + size, z);
      bubble.visible = false;
      this.bubbles.push(bubble);
    }
    this.model.add(...this.bubbles);
  }

  // this shows the bubbles bobbing while she's in the bath, and hides them when she's not
  bubble(bathTime: boolean, now: number): void {
    for (let i = 0; i < this.bubbles.length; i++) {
      const bubble = this.bubbles[i];
      bubble.visible = bathTime;
      bubble.position.y = WATER_LEVEL + 0.1 + Math.sin(now * BUBBLE_SPEED + i) * BUBBLE_BOB;
    }
  }
}
