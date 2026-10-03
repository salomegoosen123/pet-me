// Outside3D.ts – going out in 3D, to the park or the beach: you, and Saydee on her leash (or off it). Mia designed this game.
import { Vector3 } from "three";
import type { World3D } from "../../game-kit/useWorld3D";
import { BadGuys } from "./BadGuys";
import { Dog3D } from "./Dog3D";
import type { Game, Outfit } from "./Game";
import { ON_FLOOR } from "./homeSpots";
import { Leash3D } from "./Leash3D";
import { bumpOff } from "./bumping";
import { Digging } from "./Digging";
import { FrisbeeFetch } from "./FrisbeeFetch";
import { Jumping } from "./Jumping";
import { yourOutfit } from "./outfits";
import { SaydeeRide } from "./SaydeeRide";
import { SqueakyBone } from "./SqueakyBone";
import { StarStickers } from "./StarStickers";
import { OffLeash } from "./OffLeash";
import { PERSON_SIZE, Person3D } from "./Person3D";
import type { PlayPlace } from "./ride";
import type { Scenery } from "./scenery";
import { LEASH_LENGTH, NOTICE_DISTANCE, PULL_LENGTH, WALK_AROUND_SPEED } from "./settings";
import { Stage3D } from "./stage";
import { trotBehind, walkWithKeys } from "./walking";

const DOG_SPEED: number = 3; // how fast she walks, in 3D steps every second
const OUTSIDE_FARTHEST: number = 25; // the farthest you can zoom out
const ARRIVE_FROM: Vector3 = new Vector3(-6, ON_FLOOR, 5); // she walks in from here
const OTHER_DOG_SIZE: number = 0.5; // how much room the other dogs take up
const TRUNK_SIZE: number = 0.3; // how much room a tree trunk or a pole takes up

// Outside3D is a place outside: you walk with the arrow keys, and Saydee follows you on her leash
export class Outside3D implements World3D<Game> {
  stage: Stage3D;
  scenery: Scenery;
  dog: Dog3D | null;
  you: Person3D | null;
  leash: Leash3D | null;
  digging: Digging;
  offLeash: OffLeash; // the Unleash button, and Saydee running free
  playPlace: PlayPlace; // the things to play on here, like the playground or your beach towel
  fetch: FrisbeeFetch; // the frisbee, and the Throw button
  bone: SqueakyBone; // Saydee's squeaky bone, and the Bone button
  saydeeRide: SaydeeRide; // riding on Saydee's back
  wearing: Outfit; // what you're dressed in right now
  jumping: Jumping; // your jump, when you press the space bar
  badGuys: BadGuys; // the bad guys who sneak up on you when Saydee isn't by your side
  starStickers: StarStickers; // the gold stars on your shirt, from Mum

  constructor(scenery: Scenery) {
    this.starStickers = new StarStickers();
    this.badGuys = new BadGuys();
    this.jumping = new Jumping();
    this.wearing = "clothes";
    this.bone = new SqueakyBone();
    this.saydeeRide = new SaydeeRide();
    this.digging = new Digging();
    this.offLeash = new OffLeash();
    this.playPlace = scenery.playPlace;
    this.fetch = new FrisbeeFetch();
    this.stage = new Stage3D();
    this.scenery = scenery;
    this.dog = null;
    this.you = null;
    this.leash = null;
  }

  // this builds the place on the canvas, with you in it, and Saydee too if she comes
  start(canvas: HTMLCanvasElement): void {
    this.stage.start(canvas, this.scenery.skyColour, OUTSIDE_FARTHEST);
    const scene = this.stage.scene;
    this.scenery.build(scene);
    this.you = new Person3D();
    this.dog = new Dog3D();
    this.dog.model.position.copy(ARRIVE_FROM);
    this.leash = new Leash3D();
    scene.add(this.you.model);
    if (this.scenery.saydeeComes) scene.add(this.dog.model, this.leash.model);
    if (this.scenery.canUnleash) this.offLeash.start(scene, canvas, this.dog, this.scenery.sniffSpots());
    if (this.scenery.canUnleash) this.fetch.start(scene, canvas, this.you, this.scenery.edge - 1);
    this.playPlace.start(scene, canvas);
    if (this.scenery.hasBone) this.bone.start(scene, canvas, this.dog);
    if (this.scenery.saydeeComes) this.saydeeRide.start(scene, canvas, this.dog, this.you);
    if (this.scenery.hasBadGuys) this.badGuys.start(scene);
  }

  // this draws one picture of the place
  show(game: Game): void {
    if (this.dog == null || this.you == null || this.leash == null || !game.started) return;
    const seconds = this.stage.nextFrame();
    const now = this.stage.now;
    this.scenery.move(now, seconds);
    const asked = game.takeRequest();
    if (game.badGuysInJail && !this.badGuys.inJail()) this.badGuys.lockUp(); // the police took them away
    const held = this.scenery.hasBadGuys && this.badGuys.holdingYou(); // a bad guy is carrying you off
    if (this.scenery.saydeeComes) this.saydeeRide.press(asked, this.you, this.dog);
    if (!this.saydeeRide.riding && !held) this.playPlace.startPlaying(asked, this.you);
    if (asked === "throw") this.fetch.throwFrom(this.you);
    if (asked === "bone") this.bone.giveIt();
    if (game.outfit !== this.wearing) this.you.dress(yourOutfit(game.outfit));
    this.wearing = game.outfit;
    this.starStickers.update(this.you, game.stars); // your gold stars from Mum
    const edge = game.inCostume() ? this.scenery.swimEdge : this.scenery.edge; // you can only go in the sea in your costume
    this.playPlace.letBrotherFollow(game.brotherFollows);
    const free = !this.saydeeRide.riding && !this.playPlace.busy() && !this.you.isDown();
    if (free) this.you.model.position.y = 0; // feet on the ground (the sea floats you, and a jump lifts you, after this)
    const onSomething = this.playPlace.play(this.you, now, seconds, game.keys);
    const outside = this;

    // this pushes Saydee (while you ride her) or a bad guy back out of trees, poles and people
    function bumpOut(spot: Vector3, size: number): void {
      outside.bumpOffEverything(spot, size);
    }

    const ridingSaydee = this.scenery.saydeeComes
      && this.saydeeRide.move(this.dog, this.you, game.keys, this.stage, now, seconds, this.scenery.edge, bumpOut);
    const canGrab = free && !onSomething; // the bad guys can't grab you off the playground
    const takenAway = this.scenery.hasBadGuys
      && this.badGuys.update(this.you, this.dog, game.leashOn, canGrab, now, seconds, bumpOut);
    if (takenAway) game.takenUnderHome(); // they've carried you off to their hideout under your home
    const playing = onSomething || ridingSaydee || held; // you can't walk while a bad guy carries you
    const walking = !playing && walkWithKeys(this.stage, this.you, game.keys, edge, now, seconds);
    const jump = free && !playing ? this.jumping.lift(game.keys, seconds) : 0; // space to jump
    this.you.model.position.y = this.you.model.position.y + jump;
    if (ridingSaydee) this.leash.model.visible = false; // no leash while you ride her
    else if (this.scenery.saydeeComes) this.saydeeComesToo(game, this.dog, this.leash, this.you, playing, walking, now, seconds);
    else if (!playing) this.bumpOffEverything(this.you.model.position, PERSON_SIZE); // just you, Saydee's at home
    this.offLeash.updateButtons(game, this.you, this.stage.camera, seconds);
    this.playPlace.updateButtons(game, this.you, this.stage.camera, seconds);
    this.fetch.updateButtons(game, this.stage.camera, playing, seconds);
    this.bone.updateButtons(game, this.you, this.stage.camera, seconds);
    this.saydeeRide.updateButtons(game, this.you, this.stage.camera, seconds, !this.fetch.isFetching() && !held);
    this.stage.follow(this.you.model.position);
    this.stage.draw();
  }

  // this moves Saydee: digging, fetching, zooming off her leash, or walking with you on it, and bumps you both
  saydeeComesToo(
    game: Game, dog: Dog3D, leash: Leash3D, you: Person3D, playing: boolean, walking: boolean, now: number, seconds: number,
  ): void {
    const otherDog = this.nearestOtherDog(you);
    const mayDig = this.scenery.canDig && otherDog == null && game.leashOn; // off her leash, she's too busy zooming
    const digging = this.digging.keepDigging(dog, this.stage.scene, mayDig, now, seconds);
    const fetching = this.fetch.play(dog, you, game.leashOn, now, seconds); // she runs after the frisbee
    if (!game.leashOn && !fetching && !digging) this.offLeash.runFree(dog, now, seconds); // off her leash, she zooms about
    else if (game.leashOn && playing) dog.wag(now, true); // she waits and watches you play
    else if (game.leashOn && !digging) this.moveSaydee(dog, you, otherDog, walking, now, seconds); // she stays put while she digs
    if (!walking && otherDog != null) you.faceTowards(dog.model.position);
    this.bump(dog, you, !playing);
    leash.model.visible = game.leashOn;
    leash.stretch(dog.collarSpot(), you.handSpot());
    this.bone.carry(dog, fetching, seconds);
  }

  // this makes Saydee pull towards another dog, trot behind you, or walk round you while you stand still
  moveSaydee(dog: Dog3D, you: Person3D, otherDog: Vector3 | null, walking: boolean, now: number, seconds: number): void {
    if (otherDog != null) this.pullTowards(dog, you, otherDog, now, seconds);
    else if (walking) trotBehind(dog, you, DOG_SPEED, now, seconds);
    else this.walkAroundYou(dog, you, now, seconds);
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

  // this stops you and Saydee going through each other, other people, other dogs, trees or poles
  // (but not you while you're playing on something, because you're meant to be on it)
  bump(dog: Dog3D, you: Person3D, pushYou: boolean): void {
    if (pushYou) this.bumpOffEverything(you.model.position, PERSON_SIZE);
    if (pushYou) bumpOff(you.model.position, PERSON_SIZE, dog.model.position, dog.bumpSize());
    this.bumpOffEverything(dog.model.position, dog.bumpSize());
    bumpOff(dog.model.position, dog.bumpSize(), you.model.position, PERSON_SIZE);
  }

  // this pushes someone back out of anything here they've walked into
  bumpOffEverything(spot: Vector3, size: number): void {
    for (const person of this.scenery.otherPeople()) bumpOff(spot, size, person, PERSON_SIZE);
    for (const otherDog of this.scenery.otherDogs()) bumpOff(spot, size, otherDog, OTHER_DOG_SIZE);
    for (const thing of this.scenery.fixedThings()) bumpOff(spot, size, thing, TRUNK_SIZE);
    for (const thing of this.playPlace.inTheWay()) bumpOff(spot, size, thing, PERSON_SIZE);
    const badGuys = this.scenery.hasBadGuys ? this.badGuys.spots() : [];
    for (const badGuy of badGuys) bumpOff(spot, size, badGuy, PERSON_SIZE);
  }

  // this finds the closest other dog, if one is near enough for Saydee to notice
  nearestOtherDog(you: Person3D): Vector3 | null {
    let closest: Vector3 | null = null;
    for (const spot of this.scenery.otherDogs()) {
      const distance = spot.distanceTo(you.model.position);
      if (distance > NOTICE_DISTANCE) continue;
      if (closest == null || distance < closest.distanceTo(you.model.position)) closest = spot;
    }
    return closest;
  }

  // this makes her pull on her leash towards another dog, wagging super fast
  pullTowards(dog: Dog3D, you: Person3D, otherDog: Vector3, now: number, seconds: number): void {
    const way = otherDog.clone().sub(you.model.position).setY(0).normalize();
    const endOfLeash = you.model.position.clone().addScaledVector(way, PULL_LENGTH).setY(ON_FLOOR);
    dog.walkTowards(endOfLeash, DOG_SPEED, seconds);
    dog.wag(now, true);
    dog.hop(now);
  }

  // this throws the place away when you go home
  stop(): void {
    this.offLeash.stop();
    this.playPlace.stop();
    this.fetch.stop();
    this.bone.stop();
    this.saydeeRide.stop();
    this.stage.stop();
    this.dog = null;
    this.you = null;
    this.leash = null;
  }
}
