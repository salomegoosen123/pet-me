// StarStickers.ts – the gold stars Mum puts on your shirt when you tidy up the play room. They add up, in rows
// on the front of your shirt. Mia designed this game.
import { Mesh, Shape, ShapeGeometry, Vector3 } from "three";
import { paint } from "./paint";
import type { Person3D } from "./Person3D";
import { STAR_COLOUR } from "./settings";

const POINTS: number = 5; // a star has five points
const OUTSIDE: number = 0.07; // how far its points reach
const INSIDE: number = 0.03; // how far in it goes between the points
const ROWS: number[] = [1.48, 1.33, 1.18]; // how high each row of stars is on your shirt
const ACROSS: number[] = [-0.14, 0, 0.14]; // where each star in a row goes
const ON_YOUR_SHIRT: number = 0.31; // the front of your shirt

// this makes one gold star sticker, at a spot on your shirt
function makeStar(spot: Vector3): Mesh {
  const shape = new Shape();
  for (let i = 0; i < POINTS * 2; i++) {
    const reach = i % 2 === 0 ? OUTSIDE : INSIDE;
    const angle = (i / (POINTS * 2)) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) shape.moveTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
    else shape.lineTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
  }
  const star = new Mesh(new ShapeGeometry(shape), paint(STAR_COLOUR));
  star.position.copy(spot);
  return star;
}

// this says where a star goes on your shirt: three in a row, then the next row down
function spotFor(which: number): Vector3 {
  const row = Math.floor(which / ACROSS.length);
  return new Vector3(ACROSS[which % ACROSS.length], ROWS[row], ON_YOUR_SHIRT);
}

// StarStickers puts the right number of stars on your shirt
export class StarStickers {
  shown: number; // how many stars are on your shirt so far

  constructor() {
    this.shown = 0;
  }

  // this sticks on any new stars, so you've got as many on your shirt as Mum gave you (until your shirt is full)
  update(you: Person3D, stars: number): void {
    const room = ROWS.length * ACROSS.length;
    while (this.shown < Math.min(stars, room)) {
      you.model.add(makeStar(spotFor(this.shown)));
      this.shown = this.shown + 1;
    }
  }
}
