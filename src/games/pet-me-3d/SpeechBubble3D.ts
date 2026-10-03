// SpeechBubble3D.ts – a speech bubble that pops up over someone's head for a few seconds. Mia designed this game.
import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from "three";
import type { Object3D } from "three";
import { BUBBLE_SECONDS } from "./settings";

const PICTURE_WIDTH: number = 512; // how many dots across the bubble picture is
const PICTURE_HEIGHT: number = 160;
const BUBBLE_WIDTH: number = 2.6; // how wide the bubble is in the 3D world
const LONGEST_LINE: number = 22; // how many letters fit on one line
const ON_TOP: number = 20; // bubbles are drawn after everything else, so nothing hides them

// this splits words into lines that fit in the bubble (two lines at most)
function wrap(words: string): string[] {
  const lines: string[] = [""];
  for (const word of words.split(" ")) {
    const last = lines.length - 1;
    if ((lines[last] + " " + word).trim().length <= LONGEST_LINE) lines[last] = (lines[last] + " " + word).trim();
    else if (lines.length < 2) lines.push(word);
    else lines[last] = lines[last] + "…";
  }
  return lines;
}

// a SpeechBubble3D shows some words over someone's head, then goes away
export class SpeechBubble3D {
  model: Sprite;
  picture: HTMLCanvasElement;
  words: CanvasTexture;
  timeLeft: number; // how much longer the bubble stays

  constructor() {
    this.picture = document.createElement("canvas");
    this.picture.width = PICTURE_WIDTH;
    this.picture.height = PICTURE_HEIGHT;
    this.words = new CanvasTexture(this.picture);
    this.words.colorSpace = SRGBColorSpace;
    this.model = new Sprite(new SpriteMaterial({ map: this.words, depthTest: false }));
    this.model.scale.set(BUBBLE_WIDTH, BUBBLE_WIDTH * PICTURE_HEIGHT / PICTURE_WIDTH, 1);
    this.model.renderOrder = ON_TOP;
    this.model.visible = false;
    this.timeLeft = 0;
  }

  // this writes new words in the bubble and pops it up
  say(words: string): void {
    const pen = this.picture.getContext("2d");
    if (pen == null) return;
    pen.clearRect(0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
    pen.fillStyle = "white";
    pen.strokeStyle = "black";
    pen.lineWidth = 6;
    pen.beginPath();
    pen.roundRect(6, 6, PICTURE_WIDTH - 12, PICTURE_HEIGHT - 12, 40);
    pen.fill();
    pen.stroke();
    pen.fillStyle = "black";
    pen.font = "bold 40px sans-serif";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    const lines = wrap(words);
    for (let i = 0; i < lines.length; i++) {
      pen.fillText(lines[i], PICTURE_WIDTH / 2, PICTURE_HEIGHT / 2 + (i - (lines.length - 1) / 2) * 46);
    }
    this.words.needsUpdate = true;
    this.timeLeft = BUBBLE_SECONDS;
    this.model.visible = true;
  }

  // this keeps the bubble over someone's head (this far above their feet), and takes it away when its time is up
  follow(someone: Object3D, above: number, seconds: number): void {
    this.timeLeft = this.timeLeft - seconds;
    this.model.visible = this.timeLeft > 0;
    this.model.position.copy(someone.position);
    this.model.position.y = this.model.position.y + above;
  }

  // this throws the bubble away when the game closes
  throwAway(): void {
    this.words.dispose();
    this.model.material.dispose();
  }
}
