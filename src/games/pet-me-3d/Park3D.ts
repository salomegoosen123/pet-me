// Park3D.ts – the park in 3D: grass, trees, flowers, you, and Saydee on her leash. Mia designed this game.
import { Vector3 } from "three";
import type { World3D } from "../../game-kit/useWorld3D";
import { Dog3D } from "./Dog3D";
import type { Game } from "./Game";
import { ON_FLOOR } from "./homeSpots";
import { Leash3D } from "./Leash3D";
import { makeFlowers, makeGrass, makeTrees } from "./parkThings";
import { Person3D } from "./Person3D";
import { LEASH_LENGTH, SKY_COLOUR, WALK_AROUND_SPEED } from "./settings";
import { Stage3D } from "./stage";
import { trotBehind, walkWithKeys } from "./walking";

const DOG_SPEED: number = 3; // how fast she walks, in 3D steps every second
const PARK_FARTHEST: number = 25; // the farthest you can zoom out in the park
const PARK_EDGE: number = 18; // you can't walk farther than this from the middle
const ARRIVE_FROM: Vector3 = new Vector3(-6, ON_FLOOR, 5); // she walks into the park from here

// Park3D is the park: you walk with the arrow keys, and Saydee follows you on her leash
export class Park3D implements World3D<Game> {
  stage: Stage3D;
  dog: Dog3D | null;
  you: Person3D | null;
  leash: Leash3D | null;

  constructor() {
    this.stage = new Stage3D();
    this.dog = null;
    this.you = null;
    this.leash = null;
  }

  // this builds the park on the canvas
  start(canvas: HTMLCanvasElement): void {
    this.stage.start(canvas, SKY_COLOUR, PARK_FARTHEST);
    const scene = this.stage.scene;
    scene.add(makeGrass(), ...makeTrees(), ...makeFlowers());
    this.you = new Person3D();
    this.dog = new Dog3D();
    this.dog.model.position.copy(ARRIVE_FROM);
    this.leash = new Leash3D();
    scene.add(this.you.model, this.dog.model, this.leash.model);
  }

  // this draws one picture of the park
  show(game: Game): void {
    if (this.dog == null || this.you == null || this.leash == null || !game.started) return;
    const seconds = this.stage.nextFrame();
    const now = this.stage.now;
    const walking = walkWithKeys(this.stage, this.you, game.keys, PARK_EDGE, now, seconds);
    if (walking) trotBehind(this.dog, this.you, DOG_SPEED, now, seconds);
    else this.walkAroundYou(this.dog, this.you, now, seconds);
    this.leash.stretch(this.dog.collarSpot(), this.you.handSpot());
    this.stage.follow(this.you.model.position);
    this.stage.draw();
  }

  // this walks her in a circle around you while you stand still, and you turn to watch her
  walkAroundYou(dog: Dog3D, you: Person3D, now: number, seconds: number): void {
    const angle = now * WALK_AROUND_SPEED;
    const around = new Vector3(Math.cos(angle) * LEASH_LENGTH, 0, Math.sin(angle) * LEASH_LENGTH);
    const spot = you.model.position.clone().add(around).setY(ON_FLOOR);
    dog.walkTowards(spot, DOG_SPEED, seconds);
    dog.wag(now);
    dog.hop(now);
    you.faceTowards(dog.model.position);
  }

  // this throws the park away when you go home
  stop(): void {
    this.stage.stop();
    this.dog = null;
    this.you = null;
    this.leash = null;
  }
}
