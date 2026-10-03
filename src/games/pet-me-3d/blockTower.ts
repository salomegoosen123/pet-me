// blockTower.ts – building a tower of blocks in the play room: each press of Add block puts one more on top,
// and Knock down sends them all tumbling onto the floor. Then you tidy up: walk to each block to pick it up,
// and it jumps back into the toy box. Mia designed this game.
import { BoxGeometry, Group, Material, Vector3 } from "three";
import type { Mesh } from "three";
import { bumpOffBlocks } from "./bumping";
import type { Ask } from "./Game";
import { ROOM_WALL } from "./homeSpots";
import { BACK, HOUSE_LEFT } from "./house";
import { BLOCKS_EVERYONE, BLOCKS_ONLY_YOU } from "./obstacles";
import { makePart } from "./paint";
import type { Person3D } from "./Person3D";
import { TOY_BOX_SPOT } from "./playRoom";
import { PopUpButton3D } from "./PopUpButton3D";
import { TOWER_BLOCK_COLOURS, TOWER_MOST_BLOCKS } from "./settings";

const TOWER_SPOT: Vector3 = TOY_BOX_SPOT.clone().add(new Vector3(0.7, 0, 2.8)); // on the play room floor, near the toy box
const IN_THE_TOY_BOX: Vector3 = TOY_BOX_SPOT.clone().setY(0.5); // where the blocks go when you tidy up
const BLOCK_SIZE: number = 0.4;
const WOBBLE: number = 0.3; // how crooked each block sits
const ON_THE_FLOOR: number = BLOCK_SIZE / 2; // a block on the floor has its middle this high
const LOWEST_BUTTON: number = 1.5; // the buttons float at least this high...
const ABOVE_THE_TOP: number = 0.8; // ...and this far above the top of the tower
const FLING: number = 2.5; // how hard the blocks fly out when you knock the tower down
const GRAVITY: number = 12; // how fast they fall
const SPIN: number = 8; // how fast they turn over as they fly
const QUARTER_TURN: number = Math.PI / 2;
const NEAR_THE_WALL: number = 0.3; // blocks stop this far from the play room walls
const PICK_UP_REACH: number = 0.6; // walk this close to a block to pick it up
const JUMP_HOME_SECONDS: number = 0.6; // how long a block takes to jump into the toy box
const JUMP_HIGH: number = 1.2; // how high it jumps on the way

// where a block is: in the tower, tumbling down, on the floor, jumping into the toy box, or put away
type BlockPlace = "tower" | "tumbling" | "floor" | "jumpingHome" | "putAway";

// this keeps a block inside the play room, not in the walls
function insideThePlayRoom(spot: Vector3): void {
  spot.x = Math.min(-ROOM_WALL - NEAR_THE_WALL, Math.max(HOUSE_LEFT + NEAR_THE_WALL, spot.x));
  spot.z = Math.min(-ROOM_WALL - NEAR_THE_WALL, Math.max(BACK + NEAR_THE_WALL, spot.z));
}

// BlockTower is the tower of blocks, and its Add block and Knock down buttons
export class BlockTower {
  group: Group; // all the blocks
  blocks: Mesh[];
  places: BlockPlace[]; // where each block is
  speeds: Vector3[]; // how fast each block is flying, while the tower tumbles
  jumpFrom: Vector3[]; // where each block jumped from, on its way to the toy box
  jumpTime: number[]; // how far through its jump each block is (0 to 1)
  addButton: PopUpButton3D;
  knockButton: PopUpButton3D;

  constructor() {
    this.group = new Group();
    this.blocks = [];
    this.places = [];
    this.speeds = [];
    this.jumpFrom = [];
    this.jumpTime = [];
    this.addButton = new PopUpButton3D("🧱 Add block", "addBlock", TOWER_SPOT, LOWEST_BUTTON, "left");
    this.knockButton = new PopUpButton3D("💥 Knock down", "knockDown", TOWER_SPOT, LOWEST_BUTTON, "right");
  }

  // this says both buttons
  buttons(): PopUpButton3D[] {
    return [this.addButton, this.knockButton];
  }

  // this says if the tower is standing (or there's no tower yet), and not waiting to be tidied up
  standing(): boolean {
    return this.blocks.length === 0 || this.places[0] === "tower";
  }

  // this pops up Add block (while there's room for more) and Knock down (while there's a tower), when you're near.
  // They float just above the top of the tower. While the blocks are on the floor, you have to tidy up first
  popButtons(you: Person3D, free: boolean, seconds: number): void {
    const near = free && this.standing() && this.addButton.isNear(you.model.position);
    this.addButton.height = Math.max(LOWEST_BUTTON, this.blocks.length * BLOCK_SIZE + ABOVE_THE_TOP);
    this.knockButton.height = this.addButton.height;
    this.addButton.pop(near && this.blocks.length < TOWER_MOST_BLOCKS, seconds);
    this.knockButton.pop(near && this.blocks.length > 0, seconds);
  }

  // this does what you pressed
  press(asked: Ask | null): void {
    if (asked === "addBlock") this.addBlock();
    if (asked === "knockDown") this.knockDown();
  }

  // this puts one more block on top of the tower
  addBlock(): void {
    if (!this.standing() || this.blocks.length >= TOWER_MOST_BLOCKS) return;
    const colour = TOWER_BLOCK_COLOURS[this.blocks.length % TOWER_BLOCK_COLOURS.length];
    const height = BLOCK_SIZE * (this.blocks.length + 0.5);
    const block = makePart(new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), colour, TOWER_SPOT.x, height, TOWER_SPOT.z);
    block.rotation.y = (Math.random() - 0.5) * WOBBLE;
    this.blocks.push(block);
    this.places.push("tower");
    this.speeds.push(new Vector3());
    this.jumpFrom.push(new Vector3());
    this.jumpTime.push(0);
    this.group.add(block);
  }

  // this knocks the tower down: every block flies out and tumbles to the floor (the high ones fly furthest)
  knockDown(): void {
    if (!this.standing()) return;
    for (let i = 0; i < this.blocks.length; i++) {
      const angle = Math.random() * Math.PI * 2;
      const push = FLING * (0.4 + this.blocks[i].position.y / 3);
      this.speeds[i].set(Math.cos(angle) * push, Math.random() * FLING, Math.sin(angle) * push);
      this.places[i] = "tumbling";
    }
  }

  // this moves the blocks: tumbling to the floor, jumping into the toy box when you pick them up,
  // and once they're all put away, you can build a new tower
  update(you: Person3D, seconds: number): void {
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.places[i] === "tumbling") this.tumble(i, seconds);
      else if (this.places[i] === "floor") this.pickUpIfNear(i, you);
      else if (this.places[i] === "jumpingHome") this.jumpHome(i, seconds);
    }
    if (this.blocks.length > 0 && this.places.every(isPutAway)) this.allTidy();
  }

  // this makes a block fly and tumble until it lands flat on the floor
  tumble(which: number, seconds: number): void {
    const block = this.blocks[which];
    const speed = this.speeds[which];
    speed.y = speed.y - GRAVITY * seconds;
    block.position.addScaledVector(speed, seconds);
    insideThePlayRoom(block.position);
    block.rotation.x = block.rotation.x + SPIN * seconds;
    block.rotation.z = block.rotation.z + SPIN * 0.7 * seconds;
    if (block.position.y > ON_THE_FLOOR) return;
    block.position.y = ON_THE_FLOOR; // it lands, flat on one side
    bumpOffBlocks(block.position, BLOCK_SIZE, [...BLOCKS_EVERYONE, ...BLOCKS_ONLY_YOU]); // not in the ball pit, where you can't reach it
    block.rotation.x = Math.round(block.rotation.x / QUARTER_TURN) * QUARTER_TURN;
    block.rotation.z = Math.round(block.rotation.z / QUARTER_TURN) * QUARTER_TURN;
    this.places[which] = "floor";
  }

  // when you walk up to a block on the floor, you pick it up and it jumps into the toy box
  pickUpIfNear(which: number, you: Person3D): void {
    const spot = this.blocks[which].position;
    if (Math.hypot(spot.x - you.model.position.x, spot.z - you.model.position.z) > PICK_UP_REACH) return;
    this.jumpFrom[which].copy(spot);
    this.jumpTime[which] = 0;
    this.places[which] = "jumpingHome";
  }

  // this jumps a block in a high arc into the toy box
  jumpHome(which: number, seconds: number): void {
    const block = this.blocks[which];
    this.jumpTime[which] = Math.min(1, this.jumpTime[which] + seconds / JUMP_HOME_SECONDS);
    const along = this.jumpTime[which];
    block.position.lerpVectors(this.jumpFrom[which], IN_THE_TOY_BOX, along);
    block.position.y = block.position.y + Math.sin(along * Math.PI) * JUMP_HIGH;
    if (along < 1) return;
    block.visible = false;
    this.places[which] = "putAway";
  }

  // all tidy! This clears the blocks away, ready for a new tower
  allTidy(): void {
    for (const block of this.blocks) {
      this.group.remove(block);
      block.geometry.dispose();
      if (block.material instanceof Material) block.material.dispose();
    }
    this.blocks = [];
    this.places = [];
    this.speeds = [];
    this.jumpFrom = [];
    this.jumpTime = [];
  }
}

// this says if a block is put away in the toy box
function isPutAway(place: BlockPlace): boolean {
  return place === "putAway";
}
