// GrandparentsPlay.ts – you and your brother at Ouma and Oupa's: he follows you round, the cottage roof
// lifts off when you go inside, and the TV has On and Off buttons. Mia designed this game.
import type { Camera, Mesh, Scene, Vector3 } from "three";
import { followYouOutside } from "./brotherOutside";
import { cottagePosts, insideCottage, makeCottageRoof } from "./cottage";
import { COTTAGE_TV_SPOT, furniturePosts } from "./cottageFurniture";
import { BROTHER_LOOK } from "./family";
import type { Ask, Game } from "./Game";
import { Person3D } from "./Person3D";
import type { PlayPlace } from "./ride";
import { TV3D } from "./TV3D";
import { TVRemote } from "./TVRemote";

const ARRIVE_AT: number = 1.5; // your brother gets out of the car just next to you
const FACING_THE_SOFA: number = Math.PI; // turns the TV round to face into the room

// GrandparentsPlay has your brother with you, the roof, and the TV with its remote
export class GrandparentsPlay implements PlayPlace {
  brother: Person3D;
  brotherFollows: boolean; // is he following you round Ouma and Oupa's
  roof: Mesh;
  tv: TV3D;
  remote: TVRemote;

  constructor() {
    this.brother = new Person3D(BROTHER_LOOK);
    this.brother.model.position.set(ARRIVE_AT, 0, 0);
    this.brotherFollows = false;
    this.roof = makeCottageRoof();
    this.tv = new TV3D(COTTAGE_TV_SPOT);
    this.tv.model.rotation.y = FACING_THE_SOFA;
    this.remote = new TVRemote(COTTAGE_TV_SPOT);
  }

  // this puts your brother, the roof, the TV and its buttons in Ouma and Oupa's place
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    scene.add(this.brother.model, this.roof, this.tv.model);
    this.remote.start(scene, canvas);
  }

  // this says where your brother is, so you bump into him
  inTheWay(): Vector3[] {
    return [this.brother.model.position];
  }

  // this pops the TV buttons up and down
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    this.remote.updateButtons(game, you, camera, seconds);
  }

  // this turns the TV on or off, if you pressed a button
  startPlaying(asked: Ask | null): void {
    this.remote.press(asked);
  }

  // this has your brother follow you, takes the roof off while you're inside so you can see in,
  // and shows cartoons on the TV when it's on. You're never playing on anything here yet
  play(you: Person3D, now: number, seconds: number): boolean {
    if (this.brotherFollows) followYouOutside(this.brother, you, now, seconds, [...cottagePosts(), ...furniturePosts()]);
    this.roof.visible = !insideCottage(you.model.position);
    this.tv.play(this.remote.on ? "cartoons" : "off", now);
    return false;
  }

  // there's nothing to be busy playing on here yet
  busy(): boolean {
    return false;
  }

  // this tells your brother if he should follow you round Ouma and Oupa's
  letBrotherFollow(follows: boolean): void {
    this.brotherFollows = follows;
  }

  // this throws the TV buttons away when you go home
  stop(): void {
    this.remote.stop();
  }
}
