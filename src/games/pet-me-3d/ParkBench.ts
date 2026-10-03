// ParkBench.ts – a bench in the park, with your mum and dad sitting on it, watching the playground. Mia designed this game.
import { BoxGeometry, Group, Vector3 } from "three";
import type { Object3D } from "three";
import { DAD_LOOK, MUM_LOOK } from "./family";
import { makePart } from "./paint";
import { Person3D } from "./Person3D";
import { BENCH_COLOUR } from "./settings";

const BENCH_SPOT: Vector3 = new Vector3(-5.5, 0, 0.5); // on your left as you come into the park
const LOOKING_AT: Vector3 = new Vector3(-1, 0, -4); // the middle of the playground
const FACING_THE_PLAYGROUND: number = Math.atan2(LOOKING_AT.x - BENCH_SPOT.x, LOOKING_AT.z - BENCH_SPOT.z);
const BENCH_TURN: number = FACING_THE_PLAYGROUND + Math.PI; // the back of the bench is behind the people on it
const UP: Vector3 = new Vector3(0, 1, 0);
const SEAT_HEIGHT: number = 0.45;
const BENCH_LENGTH: number = 2;
const SITTING_APART: number = 0.5; // Mum and Dad sit this far each side of the middle

// this says where a spot along the bench is, from the middle
function alongBench(along: number): Vector3 {
  return BENCH_SPOT.clone().add(new Vector3(along, 0, 0).applyAxisAngle(UP, BENCH_TURN));
}

// this makes the bench: a seat, a back, and four legs
function makeBench(): Group {
  const bench = new Group();
  bench.add(
    makePart(new BoxGeometry(BENCH_LENGTH, 0.08, 0.5), BENCH_COLOUR, 0, SEAT_HEIGHT, 0),
    makePart(new BoxGeometry(BENCH_LENGTH, 0.45, 0.06), BENCH_COLOUR, 0, SEAT_HEIGHT + 0.3, 0.25),
  );
  for (const x of [-0.9, 0.9]) {
    for (const z of [-0.2, 0.2]) bench.add(makePart(new BoxGeometry(0.06, SEAT_HEIGHT, 0.06), "dimgray", x, SEAT_HEIGHT / 2, z));
  }
  bench.position.copy(BENCH_SPOT);
  bench.rotation.y = BENCH_TURN;
  return bench;
}

// this sits someone on the bench, a little way along from the middle
function sitOnBench(person: Person3D, along: number): Person3D {
  person.sitDown(alongBench(along), FACING_THE_PLAYGROUND, SEAT_HEIGHT + 0.04);
  return person;
}

// a ParkBench has your mum and dad sitting on it
export class ParkBench {
  parents: Person3D[];

  constructor() {
    this.parents = [
      sitOnBench(new Person3D(MUM_LOOK), -SITTING_APART),
      sitOnBench(new Person3D(DAD_LOOK), SITTING_APART),
    ];
  }

  // this says everything to put in the park: the bench, and your mum and dad on it
  models(): Object3D[] {
    const things: Object3D[] = [makeBench()];
    for (const person of this.parents) things.push(person.model);
    return things;
  }

  // this says where the bench is, so you and Saydee bump into it
  spots(): Vector3[] {
    return [-0.8, 0, 0.8].map(alongBench);
  }
}
