// TV3D.ts – the TV in the living room: cartoons while you sit on the sofa, and rugby while Dad watches. Mia designed this game.
import { BoxGeometry, CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import type { Vector3 } from "three";
import { makePart } from "./paint";
import { CARTOON_CHARACTERS, CARTOON_COLOURS } from "./settings";

const SCREEN_WIDTH: number = 1.8;
const SCREEN_HEIGHT: number = 1;
const FACING_THE_SOFA: number = -Math.PI / 2; // the screen faces back across the room
const PICTURE_WIDTH: number = 256; // how many dots across the cartoon picture is
const PICTURE_HEIGHT: number = 144;
const SCENE_SECONDS: number = 3; // a new character and colour every few seconds
const BOUNCE_SPEED: number = 4;

// what's on the TV
export type Channel = "off" | "cartoons" | "rugby";

// a TV3D is a TV on a stand, with a screen that is black when off, and shows cartoons or rugby when on
export class TV3D {
  model: Group;
  picture: HTMLCanvasElement;
  pen: CanvasRenderingContext2D | null;
  screen: CanvasTexture;
  on: boolean;

  constructor(spot: Vector3) {
    this.model = new Group();
    this.picture = document.createElement("canvas");
    this.picture.width = PICTURE_WIDTH;
    this.picture.height = PICTURE_HEIGHT;
    this.pen = this.picture.getContext("2d");
    this.screen = new CanvasTexture(this.picture);
    this.screen.colorSpace = SRGBColorSpace;
    this.on = false;
    this.build();
    this.model.position.copy(spot);
    this.drawBlack();
  }

  // this makes the stand, the black frame, and the screen
  build(): void {
    const stand = makePart(new BoxGeometry(0.5, 0.6, 1.4), "dimgray", 0, 0.3, 0);
    const frame = makePart(new BoxGeometry(0.1, SCREEN_HEIGHT + 0.1, SCREEN_WIDTH + 0.1), "black", 0, 1.2, 0);
    const glass = new Mesh(new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT), new MeshBasicMaterial({ map: this.screen }));
    glass.rotation.y = FACING_THE_SOFA;
    glass.position.set(-0.06, 1.2, 0);
    this.model.add(stand, frame, glass);
  }

  // this shows what's on: cartoons, rugby, or nothing (a black screen)
  play(channel: Channel, now: number): void {
    if (channel === "cartoons") this.drawCartoon(now);
    else if (channel === "rugby") this.drawRugby(now);
    else if (this.on) this.drawBlack();
    this.on = channel !== "off";
  }

  // this draws one picture of a rugby match: a green pitch with white lines, the ball flying, and players chasing it
  drawRugby(now: number): void {
    if (this.pen == null) return;
    this.pen.fillStyle = "forestgreen";
    this.pen.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
    this.pen.fillStyle = "white";
    for (const x of [30, PICTURE_WIDTH / 2, PICTURE_WIDTH - 30]) this.pen.fillRect(x - 2, 0, 4, PICTURE_HEIGHT);
    const ballX = PICTURE_WIDTH / 2 + Math.sin(now * 0.9) * 90;
    const ballY = PICTURE_HEIGHT * 0.6 - Math.abs(Math.sin(now * 2.5)) * 40;
    this.pen.textAlign = "center";
    this.pen.textBaseline = "middle";
    this.pen.font = "30px sans-serif";
    this.pen.fillText("🏉", ballX, ballY);
    this.pen.font = "40px sans-serif";
    this.pen.fillText("🏃", ballX - 40 + Math.sin(now * 3) * 5, PICTURE_HEIGHT * 0.72);
    this.pen.fillText("🏃‍♀️", ballX + 45 + Math.cos(now * 3) * 5, PICTURE_HEIGHT * 0.78);
    this.screen.needsUpdate = true;
  }

  // this makes the screen black, like a TV that is off
  drawBlack(): void {
    if (this.pen == null) return;
    this.pen.fillStyle = "black";
    this.pen.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
    this.screen.needsUpdate = true;
  }

  // this draws one picture of the cartoon: a character bouncing across a bright colour
  drawCartoon(now: number): void {
    if (this.pen == null) return;
    const scene = Math.floor(now / SCENE_SECONDS);
    this.pen.fillStyle = CARTOON_COLOURS[scene % CARTOON_COLOURS.length];
    this.pen.fillRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
    const x = PICTURE_WIDTH / 2 + Math.sin(now * 1.3) * 70;
    const y = PICTURE_HEIGHT * 0.7 - Math.abs(Math.sin(now * BOUNCE_SPEED)) * 50;
    this.pen.font = "60px sans-serif";
    this.pen.textAlign = "center";
    this.pen.textBaseline = "middle";
    this.pen.fillText(CARTOON_CHARACTERS[scene % CARTOON_CHARACTERS.length], x, y);
    this.screen.needsUpdate = true;
  }
}
