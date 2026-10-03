// PopUpButton3D.ts – a button that pops up over a thing, or over Saydee, when you walk up to it. Mia designed this game.
import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from "three";
import type { Vector3 } from "three";
import type { Job } from "./Game";
import { BUTTON_COLOUR, BUTTON_POP_DISTANCE, BUTTON_SIZE } from "./settings";

const LABEL_WIDTH: number = 256; // how many dots across the button picture is
const LABEL_HEIGHT: number = 96;
const POP_SPEED: number = 10; // how fast it pops up and shrinks away
const ON_TOP: number = 10; // buttons are drawn last, so walls never hide them
const WORDS_SIZE: number = 44; // how big the words are, unless they are too long to fit
const WORDS_ROOM: number = LABEL_WIDTH - 40; // how much room the words have across the button

// where a button sits over its thing: in the middle, or on one side when a thing has two buttons
export type Side = "left" | "middle" | "right";
const SIDE_ANCHOR: Record<Side, number> = { left: 1.04, middle: 0.5, right: -0.04 };

// this draws the button: a round-cornered box in the button colour, with white words (smaller if they're long)
function drawLabel(words: string): CanvasTexture {
  const picture = document.createElement("canvas");
  picture.width = LABEL_WIDTH;
  picture.height = LABEL_HEIGHT;
  const pen = picture.getContext("2d");
  if (pen != null) {
    pen.fillStyle = BUTTON_COLOUR;
    pen.strokeStyle = "white";
    pen.lineWidth = 8;
    pen.beginPath();
    pen.roundRect(6, 6, LABEL_WIDTH - 12, LABEL_HEIGHT - 12, 30);
    pen.fill();
    pen.stroke();
    pen.fillStyle = "white";
    pen.font = `bold ${WORDS_SIZE}px sans-serif`;
    const shrink = Math.min(1, WORDS_ROOM / pen.measureText(words).width);
    pen.font = `bold ${Math.floor(WORDS_SIZE * shrink)}px sans-serif`;
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillText(words, LABEL_WIDTH / 2, LABEL_HEIGHT / 2);
  }
  const label = new CanvasTexture(picture);
  label.colorSpace = SRGBColorSpace;
  return label;
}

// a PopUpButton3D floats over one thing, pops up when you are close, and does a job when you click it
export class PopUpButton3D {
  model: Sprite;
  label: CanvasTexture;
  thing: Vector3; // the thing the button is on (it can move, like Saydee)
  height: number; // how high over the thing the button floats
  job: Job; // what happens when you click it
  size: number; // 0 when it's hidden, 1 when it's all the way up

  constructor(words: string, job: Job, thing: Vector3, height: number, side: Side) {
    this.label = drawLabel(words);
    this.model = new Sprite(new SpriteMaterial({ map: this.label, depthTest: false }));
    this.model.position.copy(thing).setY(height);
    this.model.center.set(SIDE_ANCHOR[side], 0.5);
    this.model.renderOrder = ON_TOP;
    this.model.visible = false;
    this.thing = thing;
    this.height = height;
    this.job = job;
    this.size = 0;
  }

  // this says if you are close enough to its thing for the button to pop up
  isNear(you: Vector3): boolean {
    return Math.hypot(you.x - this.thing.x, you.z - this.thing.z) < BUTTON_POP_DISTANCE;
  }

  // this pops the button up, or shrinks it away, and keeps it over its thing
  pop(up: boolean, seconds: number): void {
    this.model.position.copy(this.thing).setY(this.height);
    const goal = up ? 1 : 0;
    this.size = this.size + (goal - this.size) * Math.min(1, POP_SPEED * seconds);
    this.model.visible = this.size > 0.05;
    const width = BUTTON_SIZE * this.size;
    this.model.scale.set(width, width * LABEL_HEIGHT / LABEL_WIDTH, 1);
  }

  // this says if the button is up, so you can click it
  isUp(): boolean {
    return this.size > 0.5;
  }

  // this throws the button away when the game closes
  throwAway(): void {
    this.label.dispose();
    this.model.material.dispose();
  }
}
