// ride.ts – what a go on something does, like the slide or your beach towel, and a place full of them. Mia designed this game.
// (A "go" can also be building something, like a sandcastle.)
import type { Camera, Scene, Vector3 } from "three";
import type { Keys } from "../../game-kit/useKeys";
import type { Ask, Game } from "./Game";
import type { Person3D } from "./Person3D";

// a Ride is a go on one thing: it gets you on, moves you, and says when you're off again
export interface Ride {
  begin(you: Person3D): void; // gets you on
  move(you: Person3D, now: number, seconds: number, keys: Keys): boolean; // moves you, and says if you're still on
}

// a PlayPlace is all the things to play on in one place outside, like the park playground or your towel at the beach
export interface PlayPlace {
  start(scene: Scene, canvas: HTMLCanvasElement): void; // puts the things and their buttons in the place
  inTheWay(): Vector3[]; // where the people and things there are, so you and Saydee bump into them
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void; // pops the buttons up and down
  startPlaying(asked: Ask | null, you: Person3D): void; // gives you a go, if you asked for one
  play(you: Person3D, now: number, seconds: number, keys: Keys): boolean; // moves you, and says if you're playing
  busy(): boolean; // says if you're in the middle of a go on something
  letBrotherFollow(follows: boolean): void; // tells your brother if he should follow you (you told him in the chat)
  stop(): void; // throws the buttons away
}
