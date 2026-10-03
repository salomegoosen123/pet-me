// PlaygroundPlay.ts – playing in the park playground: Play buttons on the slide, the swings, the seesaw and the jungle gym. Mia designed this game.
import type { Camera, Scene, Vector3 } from "three";
import type { Keys } from "../../game-kit/useKeys";
import { followYouOutside } from "./brotherOutside";
import { Clicking } from "./Clicking";
import type { Ask, Game, PlayThing } from "./Game";
import { JUNGLE_GYM_SPOT, JUNGLE_GYM_TOP } from "./jungleGym";
import { JungleGymRide } from "./JungleGymRide";
import { BROTHER_LOOK } from "./family";
import { Person3D } from "./Person3D";
import { playgroundPosts, SLIDE_SPOT } from "./playground";
import { PopUpButton3D } from "./PopUpButton3D";
import type { PlayPlace, Ride } from "./ride";
import { BROTHER_WAITS, Seesaw3D, SEESAW_SPOT } from "./Seesaw3D";
import { SeesawRide } from "./SeesawRide";
import { SLIDE_HEIGHT } from "./settings";
import { SlideRide } from "./SlideRide";
import { SwingRide } from "./SwingRide";
import { Swings3D, SWINGS_SPOT, SWING_TOP } from "./Swings3D";

const ABOVE: number = 1; // the Play buttons float this far above the top of each thing
const SEESAW_BUTTON_HEIGHT: number = 2; // the seesaw is low, so its button floats a bit higher

// PlaygroundPlay pops up a Play button on each playground thing, and gives you a go on it when you click it
export class PlaygroundPlay implements PlayPlace {
  swings: Swings3D;
  seesaw: Seesaw3D;
  brother: Person3D; // he waits by the seesaw, and plays on the seesaw and the swings with you
  brotherFollows: boolean; // is he following you round the park
  rides: Record<PlayThing, Ride>; // a go on each thing you can play on
  riding: Ride | null; // the thing you are playing on right now
  buttons: PopUpButton3D[];
  clicking: Clicking;

  constructor() {
    this.swings = new Swings3D();
    this.seesaw = new Seesaw3D();
    this.brother = new Person3D(BROTHER_LOOK);
    this.brother.model.position.copy(BROTHER_WAITS);
    this.brotherFollows = false;
    this.rides = {
      slide: new SlideRide(this.brother),
      swing: new SwingRide(this.swings, this.brother),
      seesaw: new SeesawRide(this.seesaw, this.brother),
      climb: new JungleGymRide(this.brother),
    };
    this.riding = null;
    this.buttons = [
      new PopUpButton3D("▶️ Play", "slide", SLIDE_SPOT, SLIDE_HEIGHT + ABOVE, "middle"),
      new PopUpButton3D("▶️ Play", "swing", SWINGS_SPOT, SWING_TOP + ABOVE, "middle"),
      new PopUpButton3D("▶️ Play", "seesaw", SEESAW_SPOT, SEESAW_BUTTON_HEIGHT, "middle"),
      new PopUpButton3D("▶️ Play", "climb", JUNGLE_GYM_SPOT, JUNGLE_GYM_TOP + ABOVE, "middle"),
    ];
    this.clicking = new Clicking();
  }

  // this puts the swings, the seesaw, your brother and the Play buttons in the park, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    scene.add(this.swings.model, this.seesaw.model, this.brother.model);
    for (const button of this.buttons) scene.add(button.model);
    this.clicking.listen(canvas);
  }

  // this says where the people in the playground are, so you and Saydee bump into them
  inTheWay(): Vector3[] {
    return [this.brother.model.position];
  }

  // this pops up a Play button when you're near its thing, and asks for a go if you click it
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number): void {
    for (const button of this.buttons) button.pop(this.riding == null && button.isNear(you.model.position), seconds);
    const clicked = this.clicking.clickedButton(camera, this.buttons);
    if (clicked != null) game.doJob(clicked.job);
  }

  // this gets you on the slide, the swings, the seesaw or the jungle gym, if you asked for a go
  startPlaying(asked: Ask | null, you: Person3D): void {
    if (this.riding != null) return;
    if (asked !== "slide" && asked !== "swing" && asked !== "seesaw" && asked !== "climb") return;
    this.riding = this.rides[asked];
    this.riding.begin(you);
  }

  // this moves you on the thing you're playing on. It says if you're playing.
  // When you're not playing, your brother follows you round the park
  play(you: Person3D, now: number, seconds: number, keys: Keys): boolean {
    if (this.riding == null) {
      if (this.brotherFollows) followYouOutside(this.brother, you, now, seconds, playgroundPosts());
      return false;
    }
    if (!this.riding.move(you, now, seconds, keys)) this.riding = null;
    return true;
  }

  // this says if you're in the middle of a go on something
  busy(): boolean {
    return this.riding != null;
  }

  // this tells your brother if he should follow you round the park
  letBrotherFollow(follows: boolean): void {
    this.brotherFollows = follows;
  }

  // this throws the buttons away when you go home
  stop(): void {
    this.clicking.stop();
    for (const button of this.buttons) button.throwAway();
  }
}
