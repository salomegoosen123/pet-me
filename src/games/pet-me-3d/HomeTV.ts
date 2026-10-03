// HomeTV.ts – the TV in your living room: On and Off buttons, cartoons for you, and rugby for Dad.
// It turns on by itself when you or Dad sit down to watch. Mia designed this game.
import type { Camera, Scene } from "three";
import type { Ask, Game } from "./Game";
import { TV_SPOT } from "./livingRoom";
import type { Person3D } from "./Person3D";
import { onTheSofa } from "./seats";
import { TV3D } from "./TV3D";
import type { Channel } from "./TV3D";
import { TVRemote } from "./TVRemote";

// HomeTV is the living room TV and its remote
export class HomeTV {
  tv: TV3D;
  remote: TVRemote;
  youWereWatching: boolean; // were you sitting on the sofa a moment ago
  dadWasWatching: boolean; // was Dad watching rugby a moment ago

  constructor() {
    this.tv = new TV3D(TV_SPOT);
    this.remote = new TVRemote(TV_SPOT);
    this.youWereWatching = false;
    this.dadWasWatching = false;
  }

  // this puts the TV and its buttons in the living room
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    scene.add(this.tv.model);
    this.remote.start(scene, canvas);
  }

  // this turns the TV on when you or Dad sit down to watch, shows what's on, and pops the buttons up and down
  update(game: Game, you: Person3D, dadWatching: boolean, camera: Camera, now: number, seconds: number): void {
    const youWatching = you.sitting && onTheSofa(you.model.position);
    if (youWatching && !this.youWereWatching) this.remote.on = true;
    if (dadWatching && !this.dadWasWatching) this.remote.on = true;
    this.youWereWatching = youWatching;
    this.dadWasWatching = dadWatching;
    this.tv.play(this.whatsOn(youWatching, dadWatching), now);
    this.remote.updateButtons(game, you, camera, seconds);
  }

  // this says what's on: nothing when it's off, cartoons for you, rugby for Dad, and cartoons if nobody's watching
  whatsOn(youWatching: boolean, dadWatching: boolean): Channel {
    if (!this.remote.on) return "off";
    if (youWatching) return "cartoons";
    if (dadWatching) return "rugby";
    return "cartoons";
  }

  // this turns the TV on or off, if you pressed a button
  press(asked: Ask | null): void {
    this.remote.press(asked);
  }

  // this throws the buttons away when the game closes
  stop(): void {
    this.remote.stop();
  }
}
