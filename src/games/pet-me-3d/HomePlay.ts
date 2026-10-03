// HomePlay.ts – playing in the play room at home: the ball pit (balls fly out when you bounce), the teddy from the
// toy box (which you can give to your brother), the toy fountain, and the tower of blocks. Mia designed this game.
import { Vector3 } from "three";
import type { Camera, Group, Scene } from "three";
import type { Keys } from "../../game-kit/useKeys";
import { BallPitRide } from "./BallPitRide";
import { BlockTower } from "./blockTower";
import { Clicking } from "./Clicking";
import { FlyingToys } from "./FlyingToys";
import type { Ask, Game } from "./Game";
import type { Person3D } from "./Person3D";
import { BALL_PIT_SIZE, BALL_PIT_SPOT, makeTeddy, TEDDY_SPOT, TOY_BOX_SPOT } from "./playRoom";
import { PopUpButton3D } from "./PopUpButton3D";
import type { Ride } from "./ride";
import { BALLS_FLY_OUT_SECONDS, MOST_BALLS_OUT } from "./settings";
import { ToyFountain } from "./ToyFountain";
import { makeBall } from "./toys";

const BUTTON_HEIGHT: number = 1.5; // how high the buttons float over the ball pit and the toy box
const OVER_BROTHER: number = 2.8; // how high the teddy buttons float over your brother (above his apple button)
const HANGING_DOWN: Vector3 = new Vector3(0, -0.35, 0); // the teddy hangs down a bit from a hand

// who has the teddy: it's by the toy box, in your hand, or in your brother's hand
type TeddyWith = "box" | "you" | "brother";

// HomePlay has the Play button on the ball pit, and the teddy buttons, and does what they're for
export class HomePlay {
  brother: Person3D;
  ballPit: BallPitRide;
  riding: Ride | null; // what you are playing on right now
  teddy: Group;
  teddyWith: TeddyWith;
  playButton: PopUpButton3D;
  teddyButton: PopUpButton3D;
  putBackButton: PopUpButton3D;
  giveTeddyButton: PopUpButton3D;
  takeTeddyButton: PopUpButton3D;
  tower: BlockTower; // the tower of blocks you build
  flyingBalls: FlyingToys; // the balls that fly out of the ball pit when you bounce in it
  fountain: ToyFountain; // the Fountain button on the toy box, and the toys it shoots out
  clicking: Clicking;

  constructor(brother: Person3D) {
    this.brother = brother;
    this.tower = new BlockTower();
    this.flyingBalls = new FlyingToys(BALL_PIT_SPOT, BALL_PIT_SIZE, makeBall, BALLS_FLY_OUT_SECONDS, MOST_BALLS_OUT);
    this.fountain = new ToyFountain();
    this.ballPit = new BallPitRide();
    this.riding = null;
    this.teddy = makeTeddy();
    this.teddy.position.copy(TEDDY_SPOT);
    this.teddyWith = "box";
    this.playButton = new PopUpButton3D("▶️ Play", "ballPit", BALL_PIT_SPOT, BUTTON_HEIGHT, "middle");
    this.teddyButton = new PopUpButton3D("🧸 Teddy", "teddy", TOY_BOX_SPOT, BUTTON_HEIGHT, "middle");
    this.putBackButton = new PopUpButton3D("🧸 Put back", "teddy", TOY_BOX_SPOT, BUTTON_HEIGHT, "middle");
    this.giveTeddyButton = new PopUpButton3D("🧸 Give", "giveTeddy", brother.model.position, OVER_BROTHER, "middle");
    this.takeTeddyButton = new PopUpButton3D("🧸 Take back", "takeTeddy", brother.model.position, OVER_BROTHER, "middle");
    this.clicking = new Clicking();
  }

  // this says all the buttons
  buttons(): PopUpButton3D[] {
    return [
      this.playButton, this.teddyButton, this.putBackButton, this.giveTeddyButton, this.takeTeddyButton,
      ...this.tower.buttons(), this.fountain.button,
    ];
  }

  // this says if there's a mess in the play room: balls out of the ball pit, toys out of the toy box,
  // or a knocked-down tower
  messy(): boolean {
    return this.flyingBalls.toys.length > 0 || this.fountain.messy() || !this.tower.standing();
  }

  // this says if the teddy is in your hand
  youHaveTeddy(): boolean {
    return this.teddyWith === "you";
  }

  // this puts the teddy, the tower and the buttons in the home, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    scene.add(this.teddy, this.tower.group, this.flyingBalls.group, this.fountain.toys.group);
    for (const button of this.buttons()) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this pops up each button when you're near its thing and it can be used, and does its job if you click it
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    const free = this.riding == null;
    const spot = you.model.position;
    this.playButton.pop(free && this.playButton.isNear(spot), seconds);
    this.teddyButton.pop(free && this.teddyWith === "box" && this.teddyButton.isNear(spot), seconds);
    this.putBackButton.pop(free && this.teddyWith === "you" && this.putBackButton.isNear(spot), seconds);
    this.giveTeddyButton.pop(free && this.teddyWith === "you" && this.giveTeddyButton.isNear(spot), seconds);
    this.takeTeddyButton.pop(free && this.teddyWith === "brother" && this.takeTeddyButton.isNear(spot), seconds);
    this.tower.popButtons(you, free, seconds);
    this.fountain.popButton(you, free, seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons());
    if (clicked != null) game.doJob(clicked.job);
  }

  // this does what you asked for: a go in the ball pit, moving the teddy about, or building the tower
  startPlaying(asked: Ask | null, you: Person3D): void {
    if (this.riding != null) return;
    this.tower.press(asked);
    this.fountain.press(asked);
    if (asked === "teddy") this.pickUpOrPutBack();
    if (asked === "giveTeddy" && this.teddyWith === "you") this.teddyWith = "brother";
    if (asked === "takeTeddy" && this.teddyWith === "brother") this.teddyWith = "you";
    if (asked !== "ballPit") return;
    this.riding = this.ballPit;
    this.riding.begin(you);
  }

  // this picks the teddy up from the toy box, or puts it back
  pickUpOrPutBack(): void {
    if (this.teddyWith === "box") {
      this.teddyWith = "you";
      return;
    }
    if (this.teddyWith !== "you") return;
    this.teddyWith = "box";
    this.teddy.position.copy(TEDDY_SPOT);
    this.teddy.rotation.y = 0;
  }

  // this carries the teddy in whoever's hand it's in, moves the tower's blocks (tumbling down, or jumping into the
  // toy box when you tidy up), and moves you while you play. It says if you're playing
  play(you: Person3D, now: number, seconds: number, keys: Keys): boolean {
    this.tower.update(you, seconds);
    this.flyingBalls.update(you, this.riding === this.ballPit, seconds);
    this.fountain.update(you, seconds);
    if (this.teddyWith === "you") this.carryTeddy(you);
    if (this.teddyWith === "brother") this.carryTeddy(this.brother);
    if (this.riding == null) return false;
    if (!this.riding.move(you, now, seconds, keys)) this.riding = null;
    return true;
  }

  // this keeps the teddy hanging from someone's hand
  carryTeddy(person: Person3D): void {
    this.teddy.position.copy(person.handSpot()).add(HANGING_DOWN);
    this.teddy.rotation.y = person.model.rotation.y;
  }

  // this throws the buttons away when the game closes
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons()) button.throwAway();
  }
}
