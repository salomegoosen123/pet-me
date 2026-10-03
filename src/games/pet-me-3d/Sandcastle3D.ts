// Sandcastle3D.ts – the sandcastle you build with your brother at the beach, one piece at a time,
// and that squashes flat if you step on it. Mia designed this game.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, SphereGeometry, Vector3 } from "three";
import type { Mesh } from "three";
import { makePart } from "./paint";
import { CASTLE_COLOUR, CASTLE_FLAG_COLOUR } from "./settings";

export const SANDCASTLE_SPOT: Vector3 = new Vector3(-4, 0, -1.3); // on the sand, in front of your family's towels
const PIECE_SECONDS: number = 0.5; // a new piece goes on every half a second
const POP_SECONDS: number = 0.25; // how long each piece takes to pop up to its full size
const CRUMBLE_SECONDS: number = 0.6; // how long it takes to squash flat when you step on it
const BASE_HEIGHT: number = 0.3;
const TOWER_HEIGHT: number = 0.45;

// this makes all the pieces of the castle, in the order they go on: the bottom, the towers, their tops, and a flag
function makePieces(): Mesh[] {
  const towerY = BASE_HEIGHT + TOWER_HEIGHT / 2;
  const topY = BASE_HEIGHT + TOWER_HEIGHT + 0.12;
  const corners: [number, number][] = [[-0.35, -0.35], [0.35, -0.35], [0.35, 0.35], [-0.35, 0.35]]; // across, and front to back
  const pieces: Mesh[] = [makePart(new CylinderGeometry(0.6, 0.7, BASE_HEIGHT, 24), CASTLE_COLOUR, 0, BASE_HEIGHT / 2, 0)];
  for (const [x, z] of corners) pieces.push(makePart(new CylinderGeometry(0.15, 0.17, TOWER_HEIGHT, 16), CASTLE_COLOUR, x, towerY, z));
  pieces.push(makePart(new CylinderGeometry(0.2, 0.22, TOWER_HEIGHT * 1.6, 16), CASTLE_COLOUR, 0, BASE_HEIGHT + TOWER_HEIGHT * 0.8, 0));
  for (const [x, z] of corners) pieces.push(makePart(new ConeGeometry(0.19, 0.25, 16), CASTLE_COLOUR, x, topY, z));
  pieces.push(makePart(new CylinderGeometry(0.015, 0.015, 0.4, 6), "white", 0, BASE_HEIGHT + TOWER_HEIGHT * 1.6 + 0.2, 0));
  pieces.push(makePart(new BoxGeometry(0.2, 0.12, 0.02), CASTLE_FLAG_COLOUR, 0.1, BASE_HEIGHT + TOWER_HEIGHT * 1.6 + 0.33, 0));
  return pieces;
}

// this makes the flat pile of sand that's left after the castle gets squashed
function makePile(): Mesh {
  const pile = makePart(new SphereGeometry(0.7, 20, 12), CASTLE_COLOUR, 0, 0.02, 0);
  pile.scale.set(1.2, 0.2, 1.2);
  pile.visible = false;
  return pile;
}

// a Sandcastle3D starts as flat sand, grows piece by piece while you build it, and squashes flat if you step on it
export class Sandcastle3D {
  model: Group;
  pieces: Mesh[];
  homeHeights: number[]; // how high each piece sits when the castle is standing
  pile: Mesh;
  buildTime: number; // how long you have been building it
  crumbleTime: number | null; // how long it has been squashing flat, or null when it isn't

  constructor() {
    this.model = new Group();
    this.pieces = makePieces();
    this.homeHeights = [];
    this.pile = makePile();
    this.buildTime = 0;
    this.crumbleTime = null;
    for (const piece of this.pieces) {
      piece.visible = false;
      this.homeHeights.push(piece.position.y);
      this.model.add(piece);
    }
    this.model.add(this.pile);
    this.model.position.copy(SANDCASTLE_SPOT);
  }

  // this says if the castle is finished
  isBuilt(): boolean {
    return this.buildTime >= this.pieces.length * PIECE_SECONDS;
  }

  // this says if you can start building (not while it's there, or while it's squashing flat)
  canBuild(): boolean {
    return !this.isBuilt() && this.crumbleTime == null;
  }

  // this builds a bit more: each piece pops up in turn. It says if the castle is finished
  grow(seconds: number): boolean {
    this.pile.visible = false;
    this.buildTime = this.buildTime + seconds;
    for (let i = 0; i < this.pieces.length; i++) {
      const since = this.buildTime - i * PIECE_SECONDS; // how long ago this piece started to go on
      this.pieces[i].visible = since > 0;
      this.pieces[i].position.y = this.homeHeights[i];
      this.pieces[i].scale.setScalar(Math.min(1, Math.max(0.01, since / POP_SECONDS)));
    }
    return this.isBuilt();
  }

  // this starts squashing the castle flat, if it's standing
  knockDown(): void {
    if (this.isBuilt() && this.crumbleTime == null) this.crumbleTime = 0;
  }

  // this squashes the castle a bit more, until only a pile of sand is left
  crumble(seconds: number): void {
    if (this.crumbleTime == null) return;
    this.crumbleTime = this.crumbleTime + seconds;
    const left = Math.max(0.01, 1 - this.crumbleTime / CRUMBLE_SECONDS); // 1 standing up, nearly 0 all squashed
    for (let i = 0; i < this.pieces.length; i++) {
      this.pieces[i].position.y = this.homeHeights[i] * left;
      this.pieces[i].scale.set(1.5 - left * 0.5, left, 1.5 - left * 0.5);
    }
    if (this.crumbleTime < CRUMBLE_SECONDS) return;
    for (const piece of this.pieces) piece.visible = false;
    this.pile.visible = true;
    this.buildTime = 0;
    this.crumbleTime = null;
  }
}
