// Game.ts – the whole Popcorn Land game: you, jumping from cloud to cloud up into a sky that goes on forever,
// with balloons floating up past you. Mia designed this game.
import { loadBestScore, saveBestScore } from "../../game-kit/bestScore";
import type { Keys } from "../../game-kit/useKeys";
import { Balloon } from "./Balloon";
import { Cloud } from "./Cloud";
import { Player } from "./Player";
import { BALLOON_SECONDS, CLOUD_GAP, CLOUD_WIDE, CLOUDS, GAME_NAME, LIVES, TICK_MS, WIN_AT, YOU_SIZE } from "./settings";
import { WORLD_HEIGHT, WORLD_WIDTH } from "./world";

const BIG_CLOUD_TOP: number = 40; // the big cloud at the bottom of the sky, where you start
const START_ACROSS: number = 60; // where you start, from the left
const FOLLOW_AT: number = 0.5; // when you climb higher than halfway up the screen, the screen follows you up
const CLOUD_REACH: number = 220; // a new cloud is never further across than this from the one below it
const MS_IN_A_SECOND: number = 1000;
const LEAST_WAIT: number = 0.6; // a new balloon comes after at least this much of BALLOON_SECONDS...
const MORE_WAIT: number = 0.8; // ...and up to this much more, so you can't tell exactly when

// the Game holds you, the clouds and the balloons, and makes everything move every tick
export class Game {
  keys: Keys; // the keyboard, for the arrow keys and space
  player: Player;
  clouds: Cloud[];
  balloons: Balloon[];
  bottomOfTheScreen: number; // how high up the sky the bottom of the screen is (it goes up as you climb)
  nextBalloonIn: number; // how many seconds until the next balloon comes
  popped: number; // how many balloons you've popped
  lives: number; // how many more times you can fall off the bottom
  best: number; // the most balloons you've ever popped in one game
  newBest: boolean; // did you beat your best this time
  started: boolean;
  won: boolean; // did you pop enough balloons to win
  isOver: boolean; // did you fall off too many times

  constructor(keys: Keys) {
    this.keys = keys;
    this.player = new Player(START_ACROSS, BIG_CLOUD_TOP);
    this.clouds = [new Cloud(0, BIG_CLOUD_TOP, WORLD_WIDTH)];
    for (const spot of CLOUDS) this.clouds.push(new Cloud(spot.across, spot.high, spot.wide)); // the first clouds
    this.balloons = [];
    this.bottomOfTheScreen = 0;
    this.nextBalloonIn = 0;
    this.popped = 0;
    this.lives = LIVES;
    this.best = 0;
    this.newBest = false;
    this.started = false;
    this.won = false;
    this.isOver = false;
  }

  // this starts the game when you press Play, and remembers your best so far
  start(): void {
    this.started = true;
    this.best = loadBestScore(GAME_NAME);
  }

  // the game's over (you won, or fell off too many times): this saves your score if it's your best ever
  finish(): void {
    this.newBest = this.popped > this.best;
    saveBestScore(GAME_NAME, this.popped);
    this.best = Math.max(this.best, this.popped);
  }

  // this happens every TICK_MS: the arrow keys walk you, space makes you jump, you land on clouds,
  // the screen follows you up, new clouds appear above, and the balloons float up
  tick(): void {
    if (!this.started || this.won || this.isOver) return;
    if (this.keys.isDown("ArrowLeft")) this.player.walk(-1);
    if (this.keys.isDown("ArrowRight")) this.player.walk(1);
    if (this.keys.isDown(" ")) this.player.jump();
    this.player.fall(this.clouds);
    this.followYouUp();
    this.makeCloudsAbove();
    if (this.player.height < this.bottomOfTheScreen - YOU_SIZE) this.fallOff();
    this.floatTheBalloons();
    this.sendABalloon();
  }

  // this moves the screen up when you climb past halfway up it (it never goes back down)
  followYouUp(): void {
    const halfway = this.bottomOfTheScreen + WORLD_HEIGHT * FOLLOW_AT;
    if (this.player.height > halfway) this.bottomOfTheScreen = this.player.height - WORLD_HEIGHT * FOLLOW_AT;
  }

  // this puts new clouds above the top of the screen, each one a jump above the last and not too far across,
  // and forgets the clouds that are far below the screen
  makeCloudsAbove(): void {
    let highest = this.clouds[0];
    for (const cloud of this.clouds) {
      if (cloud.top > highest.top) highest = cloud;
    }
    while (highest.top < this.bottomOfTheScreen + WORLD_HEIGHT + CLOUD_GAP) {
      const middle = highest.across + highest.width / 2 + (Math.random() - 0.5) * 2 * CLOUD_REACH;
      const across = Math.min(WORLD_WIDTH - CLOUD_WIDE, Math.max(0, middle - CLOUD_WIDE / 2));
      highest = new Cloud(across, highest.top + CLOUD_GAP, CLOUD_WIDE);
      this.clouds.push(highest);
    }
    const stillHere: Cloud[] = [];
    for (const cloud of this.clouds) {
      if (cloud.top > this.bottomOfTheScreen - WORLD_HEIGHT) stillHere.push(cloud);
    }
    this.clouds = stillHere;
  }

  // you fell off the bottom of the screen: you lose a life, and pop back onto a cloud (or it's Game Over)
  fallOff(): void {
    this.lives = this.lives - 1;
    if (this.lives > 0) {
      this.backOntoACloud();
      return;
    }
    this.isOver = true;
    this.finish();
  }

  // this pops you back onto the lowest cloud you can see
  backOntoACloud(): void {
    let lowest: Cloud | null = null;
    for (const cloud of this.clouds) {
      if (cloud.top < this.bottomOfTheScreen) continue;
      if (lowest == null || cloud.top < lowest.top) lowest = cloud;
    }
    if (lowest == null) return;
    this.player.landOn(lowest);
  }

  // this floats every balloon up, pops the ones you touch (they disappear), and forgets the ones that have
  // floated out of the top of the screen
  floatTheBalloons(): void {
    const stillHere: Balloon[] = [];
    for (const balloon of this.balloons) {
      balloon.float();
      const popped = balloon.isTouching(this.player.across, this.player.height);
      if (popped) this.popABalloon();
      else if (!balloon.isGone(this.bottomOfTheScreen)) stillHere.push(balloon);
    }
    this.balloons = stillHere;
  }

  // you popped a balloon! Pop enough and you win
  popABalloon(): void {
    if (this.won || this.isOver) return; // the game's already over
    this.popped = this.popped + 1;
    if (this.popped < WIN_AT) return;
    this.won = true;
    this.finish();
  }

  // this sends a new balloon floating up from the bottom of the screen, every now and then
  sendABalloon(): void {
    this.nextBalloonIn = this.nextBalloonIn - TICK_MS / MS_IN_A_SECOND;
    if (this.nextBalloonIn > 0) return;
    this.balloons.push(new Balloon(this.bottomOfTheScreen));
    this.nextBalloonIn = BALLOON_SECONDS * (LEAST_WAIT + Math.random() * MORE_WAIT);
  }
}
