// FlyingToys.ts – toys flying out of somewhere and landing all over the play room floor: balls out of the ball
// pit when you bounce in it, and toys out of the toy box when you press Fountain. Then you tidy up: walk to each
// one and it jumps back where it came from. Mia designed this game.
import { Group, Vector3 } from "three";
import type { Object3D } from "three";
import { bumpOffBlocks } from "./bumping";
import { ROOM_WALL } from "./homeSpots";
import { BACK, HOUSE_LEFT } from "./house";
import { BLOCKS_EVERYONE, BLOCKS_ONLY_YOU } from "./obstacles";
import type { Person3D } from "./Person3D";
import { throwAwayAll } from "./stage";

const TOY_SIZE: number = 0.12; // how much room a toy takes up, and how high its middle is when it's on the floor
const OUT_OF_HOME: number = 0.6; // how high a toy starts when it flies out
const FLING: number = 3; // how hard toys fly out, sideways
const FLING_UP: number = 4; // and upwards
const GRAVITY: number = 10; // how fast they fall
const SPIN: number = 6; // how fast they turn over as they fly
const NEAR_THE_WALL: number = 0.3; // toys stop this far from the play room walls
const PICK_UP_REACH: number = 0.6; // walk this close to a toy to pick it up
const JUMP_HOME_SECONDS: number = 0.6; // how long a toy takes to jump back home
const JUMP_HIGH: number = 1; // how high it jumps on the way
const BACK_IN: number = 0.35; // how high a toy lands back home

// where a toy is: flying out, on the floor, or jumping back home
type ToyPlace = "flying" | "floor" | "jumpingHome";

// this keeps a toy inside the play room, not in the walls
function insideThePlayRoom(spot: Vector3): void {
  spot.x = Math.min(-ROOM_WALL - NEAR_THE_WALL, Math.max(HOUSE_LEFT + NEAR_THE_WALL, spot.x));
  spot.z = Math.min(-ROOM_WALL - NEAR_THE_WALL, Math.max(BACK + NEAR_THE_WALL, spot.z));
}

// FlyingToys are the toys that have flown out of one place, like the ball pit or the toy box
export class FlyingToys {
  home: Vector3; // where they fly out of, and go back to
  homeSize: number; // how wide that place is
  makeToy: { (): Object3D }; // makes one toy
  every: number; // how often one flies out, in seconds
  most: number; // the most that can be out at once
  group: Group; // all the toys that are out
  toys: Object3D[];
  places: ToyPlace[]; // where each toy is
  speeds: Vector3[]; // how fast each toy is flying
  jumpFrom: Vector3[]; // where each toy jumped from, on its way home
  jumpTo: Vector3[]; // and where it lands
  jumpTime: number[]; // how far through its jump each toy is (0 to 1)
  nextIn: number; // how long until another toy flies out

  constructor(home: Vector3, homeSize: number, makeToy: { (): Object3D }, every: number, most: number) {
    this.home = home;
    this.homeSize = homeSize;
    this.makeToy = makeToy;
    this.every = every;
    this.most = most;
    this.group = new Group();
    this.toys = [];
    this.places = [];
    this.speeds = [];
    this.jumpFrom = [];
    this.jumpTo = [];
    this.jumpTime = [];
    this.nextIn = 0;
  }

  // this throws toys out while something's making them fly (like you bouncing), flies them, picks them up
  // when you walk to them (once nothing's throwing them about), and jumps them back home
  update(you: Person3D, throwing: boolean, seconds: number): void {
    this.nextIn = this.nextIn - seconds;
    if (throwing && this.nextIn <= 0 && this.toys.length < this.most) this.throwOne();
    for (let i = 0; i < this.toys.length; i++) {
      if (this.places[i] === "flying") this.fly(i, seconds);
      else if (this.places[i] === "floor" && !throwing) this.pickUpIfNear(i, you);
      else if (this.places[i] === "jumpingHome") this.jumpHome(i, seconds);
    }
  }

  // this says a spot somewhere in the toys' home, this high up
  somewhereAtHome(height: number): Vector3 {
    const reach = this.homeSize / 2 - TOY_SIZE * 2;
    return this.home.clone().add(new Vector3((Math.random() - 0.5) * 2 * reach, height, (Math.random() - 0.5) * 2 * reach));
  }

  // this throws one toy out, a random way
  throwOne(): void {
    this.nextIn = this.every;
    const toy = this.makeToy();
    toy.position.copy(this.somewhereAtHome(OUT_OF_HOME));
    const angle = Math.random() * Math.PI * 2;
    const push = FLING * (0.5 + Math.random());
    this.toys.push(toy);
    this.places.push("flying");
    this.speeds.push(new Vector3(Math.cos(angle) * push, FLING_UP * (0.6 + Math.random() * 0.6), Math.sin(angle) * push));
    this.jumpFrom.push(new Vector3());
    this.jumpTo.push(new Vector3());
    this.jumpTime.push(0);
    this.group.add(toy);
  }

  // this flies a toy through the air, turning over, until it lands on the floor out of the way of the furniture
  fly(which: number, seconds: number): void {
    const toy = this.toys[which];
    const speed = this.speeds[which];
    speed.y = speed.y - GRAVITY * seconds;
    toy.position.addScaledVector(speed, seconds);
    toy.rotation.x = toy.rotation.x + SPIN * seconds;
    insideThePlayRoom(toy.position);
    if (toy.position.y > TOY_SIZE) return;
    toy.position.y = TOY_SIZE;
    toy.rotation.x = 0; // it lands the right way up
    bumpOffBlocks(toy.position, TOY_SIZE, [...BLOCKS_EVERYONE, ...BLOCKS_ONLY_YOU]); // where you can reach it
    this.places[which] = "floor";
  }

  // when you walk up to a toy on the floor, you pick it up and it jumps back home
  pickUpIfNear(which: number, you: Person3D): void {
    const spot = this.toys[which].position;
    if (Math.hypot(spot.x - you.model.position.x, spot.z - you.model.position.z) > PICK_UP_REACH) return;
    this.jumpFrom[which].copy(spot);
    this.jumpTo[which].copy(this.somewhereAtHome(BACK_IN));
    this.jumpTime[which] = 0;
    this.places[which] = "jumpingHome";
  }

  // this jumps a toy in an arc back home, where it goes back in with all the others
  jumpHome(which: number, seconds: number): void {
    const toy = this.toys[which];
    this.jumpTime[which] = Math.min(1, this.jumpTime[which] + seconds / JUMP_HOME_SECONDS);
    const along = this.jumpTime[which];
    toy.position.lerpVectors(this.jumpFrom[which], this.jumpTo[which], along);
    toy.position.y = toy.position.y + Math.sin(along * Math.PI) * JUMP_HIGH;
    if (along < 1) return;
    this.putAway(which);
  }

  // this takes a toy away once it's back home
  putAway(which: number): void {
    const toy = this.toys[which];
    this.group.remove(toy);
    throwAwayAll(toy);
    this.toys.splice(which, 1);
    this.places.splice(which, 1);
    this.speeds.splice(which, 1);
    this.jumpFrom.splice(which, 1);
    this.jumpTo.splice(which, 1);
    this.jumpTime.splice(which, 1);
  }
}
