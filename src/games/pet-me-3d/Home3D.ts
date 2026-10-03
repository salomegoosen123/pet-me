// Home3D.ts – Saydee's home in 3D: all the rooms, the back yard, you, and Saydee. Mia designed this game.
import { Vector3 } from "three";
import type { World3D } from "../../game-kit/useWorld3D";
import { BaseVisit } from "./BaseVisit";
import { Bath3D } from "./Bath3D";
import { makeBathroom } from "./bathroom";
import { makeBedroom } from "./bedroom";
import { Bowl3D } from "./Bowl3D";
import { Carrying } from "./Carrying";
import { askedForHelp } from "./chatReplies";
import { Daycare, DAYCARE_BLOCKS, DAYCARE_SPOT } from "./daycare";
import { Dog3D } from "./Dog3D";
import { makeDoors } from "./doors";
import { Family3D } from "./family";
import type { Door3D } from "./doors";
import { makeBed, makeFloor } from "./furniture";
import type { Game, Outfit } from "./Game";
import { makeGrandparentsVisit } from "./grandparents";
import { Hideout } from "./Hideout";
import { HomeDog } from "./HomeDog";
import { HomePlay } from "./HomePlay";
import { yourOutfit } from "./outfits";
import { floatInPool, POOL_BLOCK } from "./pool";
import {
  BATH_SPOT, BED_SPOT, ERRAND_SPOTS, FOOD_BOWL_SPOT, spread, spreadSpot, WATER_BOWL_SPOT,
} from "./homeSpots";
import { HOUSE_LEFT, HOUSE_RIGHT, insideHouse, makeOuterWalls, Roof3D } from "./house";
import { atFridge, makeKitchen } from "./kitchen";
import { HomeTV } from "./HomeTV";
import { Jumping } from "./Jumping";
import { SaydeeRide } from "./SaydeeRide";
import { makeLivingRoom } from "./livingRoom";
import { NightBadGuys } from "./NightBadGuys";
import { makeParentsRoom } from "./parentsRoom";
import { makePlayRoom } from "./playRoom";
import { ThingButtons } from "./ThingButtons";
import { bumpOff, bumpOffBlocks, bumpOffWalls } from "./bumping";
import type { Block } from "./bumping";
import { SCHOOL_BLOCKS } from "./schoolBuilding";
import { SchoolClass } from "./schoolClass";
import { StarStickers } from "./StarStickers";
import { BLOCKS_EVERYONE, BLOCKS_ONLY_YOU } from "./obstacles";
import { PERSON_SIZE, Person3D } from "./Person3D";
import { HOME_WALLS } from "./walls";
import { Resting } from "./Resting";
import { BOWL_COLOUR, FOLLOW_SECONDS, WALL_COLOUR, WATER_BOWL_COLOUR } from "./settings";
import { Stage3D } from "./stage";
import { anyArrowDown, walkWithKeys } from "./walking";
import { makeYard, YARD_END } from "./yard";

const HAPPY_SPIN_SECONDS: number = 1; // how long she spins round for joy after a treat
const HAPPY_SPIN_SPEED: number = 12; // how fast she spins
const HOME_FARTHEST: number = spread(20) + 10; // the farthest you can zoom out at home, to see the whole house
const FAR_AWAY: number = 100; // the arrow keys never stop you by themselves: keepOnTheGrounds does
const FRONT_EDGE: number = DAYCARE_SPOT.z + 4.5; // you can walk out the front door, across the road, past the daycare
const YOUR_START: Vector3 = spreadSpot(0, 3.2); // where you stand at the start, near the front door
const ACROSS_THE_ROAD: Block[] = [...SCHOOL_BLOCKS, ...DAYCARE_BLOCKS]; // the school and daycare walls, desks and tables

// this pushes Saydee back out of walls and furniture while you ride her round the house,
// and keeps her inside the house, the front garden (and across the road) and the back yard
function bumpAtHome(spot: Vector3, size: number): void {
  spot.x = Math.min(HOUSE_RIGHT - 0.3, Math.max(HOUSE_LEFT + 0.3, spot.x));
  spot.z = Math.min(FRONT_EDGE, Math.max(YARD_END + 0.3, spot.z));
  bumpOffWalls(spot, size, HOME_WALLS);
  bumpOffBlocks(spot, size, BLOCKS_EVERYONE);
  bumpOffBlocks(spot, size, ACROSS_THE_ROAD);
}

// this keeps you inside the house, the front garden (and across the road), and the fenced back yard,
// and stops you walking through walls, furniture, Saydee, or people (or into the pool, unless you're in your costume)
function keepOnTheGrounds(you: Person3D, dog: Dog3D, people: Vector3[], inCostume: boolean): void {
  const spot = you.model.position;
  spot.x = Math.min(HOUSE_RIGHT - 0.3, Math.max(HOUSE_LEFT + 0.3, spot.x));
  spot.z = Math.min(FRONT_EDGE, Math.max(YARD_END + 0.3, spot.z));
  bumpOffWalls(spot, PERSON_SIZE, HOME_WALLS);
  bumpOffBlocks(spot, PERSON_SIZE, BLOCKS_EVERYONE);
  bumpOffBlocks(spot, PERSON_SIZE, BLOCKS_ONLY_YOU);
  bumpOffBlocks(spot, PERSON_SIZE, ACROSS_THE_ROAD);
  if (!inCostume) bumpOffBlocks(spot, PERSON_SIZE, [POOL_BLOCK]);
  bumpOff(spot, PERSON_SIZE, dog.model.position, dog.bumpSize());
  for (const person of people) bumpOff(spot, PERSON_SIZE, person, PERSON_SIZE);
}

// Home3D is Saydee's home: you walk with the arrow keys, and she follows you or rests on her bed
export class Home3D implements World3D<Game> {
  stage: Stage3D;
  dog: Dog3D | null;
  you: Person3D | null;
  followTimeLeft: number; // how much longer she keeps following you after you stop
  resting: Resting; // sitting on chairs and lying in bed
  carrying: Carrying; // the apple or treat in your hand
  bath: Bath3D | null;
  spinTimeLeft: number; // how much longer she spins for joy
  dark: boolean; // is it dark because you are in bed
  roof: Roof3D;
  homeDog: HomeDog; // where Saydee is heading, and the doors on the way
  doors: Door3D[];
  homeTV: HomeTV; // the living room TV, with its On and Off buttons
  thingButtons: ThingButtons; // the buttons that pop up on things when you walk up to them
  family: Family3D; // your brother, your mum and your dad, walking round the house
  homePlay: HomePlay; // the ball pit and the teddy in the play room
  wearing: Outfit; // what you're dressed in right now
  jumping: Jumping; // your jump, when you press the space bar
  saydeeRide: SaydeeRide; // riding on Saydee's back
  hideout: Hideout; // the bad guys' hideout under the house
  nightBadGuys: NightBadGuys; // the bad guys who sneak in while you're asleep
  baseVisit: BaseVisit; // the tunnel into the bad guys' base, behind the tree, and the wolf down there
  daycare: Daycare; // the daycare across the road, full of children
  schoolClass: SchoolClass; // your brother's school across the road: the classroom, the teacher and the children
  starStickers: StarStickers; // the gold stars on your shirt, from Mum

  constructor() {
    this.starStickers = new StarStickers();
    this.daycare = new Daycare();
    this.schoolClass = new SchoolClass();
    this.hideout = new Hideout();
    this.nightBadGuys = new NightBadGuys();
    this.baseVisit = new BaseVisit();
    this.jumping = new Jumping();
    this.saydeeRide = new SaydeeRide();
    this.wearing = "clothes";
    this.family = new Family3D();
    this.homePlay = new HomePlay(this.family.walkers[0].person); // your brother can have the teddy too
    this.doors = [];
    this.homeTV = new HomeTV();
    this.thingButtons = new ThingButtons();
    this.roof = new Roof3D();
    this.homeDog = new HomeDog();
    this.stage = new Stage3D();
    this.dog = null;
    this.you = null;
    this.bath = null;
    this.followTimeLeft = 0;
    this.resting = new Resting();
    this.carrying = new Carrying();
    this.spinTimeLeft = 0;
    this.dark = false;
  }

  // this builds the home on the canvas: the floor, her bed, her bowls, you and Saydee
  start(canvas: HTMLCanvasElement): void {
    this.stage.start(canvas, WALL_COLOUR, HOME_FARTHEST);
    const scene = this.stage.scene;
    const floor = makeFloor();
    scene.add(floor, makeBed(), makeKitchen(), makeBathroom(), makeBedroom());
    this.hideout.start(scene, floor);
    this.nightBadGuys.start(scene);
    this.baseVisit.start(scene, canvas);
    scene.add(...this.daycare.models(), ...this.schoolClass.models());
    scene.add(...makeOuterWalls(), this.roof.model, makeYard(), makeLivingRoom(), makeParentsRoom(), makePlayRoom());
    scene.add(...makeGrandparentsVisit()); // Ouma and Oupa, waiting by their car in the front garden
    this.homeTV.start(scene, canvas);
    this.doors = makeDoors();
    for (const door of this.doors) scene.add(door.model);
    this.bath = new Bath3D();
    this.bath.model.position.copy(BATH_SPOT);
    scene.add(this.bath.model);
    this.dog = new Dog3D();
    this.dog.model.position.copy(BED_SPOT);
    this.you = new Person3D();
    this.you.model.position.copy(YOUR_START);
    const foodBowl = new Bowl3D(BOWL_COLOUR, "food");
    foodBowl.model.position.copy(FOOD_BOWL_SPOT);
    const waterBowl = new Bowl3D(WATER_BOWL_COLOUR, "water");
    waterBowl.model.position.copy(WATER_BOWL_SPOT);
    scene.add(this.dog.model, this.you.model, foodBowl.model, waterBowl.model);
    this.family.chatWithSaydee(this.dog);
    this.family.start(scene, canvas);
    this.thingButtons.start(scene, canvas);
    this.homePlay.start(scene, canvas);
    this.saydeeRide.start(scene, canvas, this.dog, this.you);
  }

  // this draws one picture of the home
  show(game: Game): void {
    if (this.dog == null || this.you == null || !game.started) return;
    const seconds = this.stage.nextFrame();
    const now = this.stage.now;
    const inTheHideout = this.hideout.update(game, this.you, this.dog, this.homeDog, now, seconds);
    if (inTheHideout || this.nightBadGuys.update(game, this.you, now, seconds)) {
      this.whileTheBadGuysHaveYou(game, this.you, this.dog, now, seconds);
      return;
    }
    if (game.inTheBase) {
      this.whileInTheBase(game, this.you, this.dog, now, seconds);
      return;
    }
    this.dressYou(game, this.you);
    const ridingSaydee = this.saydeeRide.move(this.dog, this.you, game.keys, this.stage, now, seconds, FAR_AWAY, bumpAtHome);
    const inPlayRoom = this.homePlay.play(this.you, now, seconds, game.keys);
    const playing = ridingSaydee || inPlayRoom;
    if (!playing && this.you.isDown() && anyArrowDown(game.keys)) this.you.standUp();
    const walking = !playing && !this.you.isDown() && walkWithKeys(this.stage, this.you, game.keys, FAR_AWAY, now, seconds);
    const people = [...this.family.spots(), ...this.daycare.spots(), ...this.schoolClass.spots()];
    if (walking) keepOnTheGrounds(this.you, this.dog, people, game.inCostume());
    if (!playing && !this.you.isDown()) {
      floatInPool(this.you, now); // in the pool, you swim
      const jump = this.jumping.lift(game.keys, seconds); // space to jump
      this.you.model.position.y = this.you.model.position.y + jump;
    }
    this.doWhatWasAsked(game, this.you);
    const said = game.takeWhatYouSaid(); // what you typed in the chat
    if (said != null) this.family.hear(said, this.you, game.chat);
    if (!playing) this.resting.checkWhereYouAre(this.you);
    this.darkWhileInBed(game, this.you);
    if (this.you.lying) game.putToBed(); // Saydee goes to sleep on her bed too
    game.standAtFridge(this.carrying.handsEmpty() && !this.homePlay.youHaveTeddy() && atFridge(this.you.model.position));
    this.thingButtons.update(game, this.you, this.stage.camera, seconds);
    this.homePlay.updateButtons(game, this.you, this.stage.camera, seconds);
    this.saydeeRide.updateButtons(game, this.you, this.stage.camera, seconds, game.pet.doing === "resting");
    this.family.updateButtons(game, this.you, this.stage.camera, seconds, this.carrying.apple != null);
    this.baseVisit.updateButtons(game, this.you, this.dog, this.stage.camera, seconds, !ridingSaydee && !this.you.isDown());
    this.carrying.eatAtTable(this.you, seconds);
    if (this.carrying.handOver(this.you, this.dog)) {
      game.giveTreat();
      this.spinTimeLeft = HAPPY_SPIN_SECONDS;
    }
    this.followTimeLeft = walking ? FOLLOW_SECONDS : Math.max(0, this.followTimeLeft - seconds);
    if (!ridingSaydee) this.homeDog.move(this.dog, this.you, game.pet, this.followTimeLeft > 0, now, seconds);
    this.bubbleBath(this.dog, game.pet.doing === "busy" && game.pet.errand === "bath", now);
    this.spinForJoy(this.dog, seconds);
    if (!walking && !playing && !this.you.isDown()) this.you.faceTowards(this.dog.model.position);
    this.family.messInThePlayRoom(this.homePlay.messy()); // then Mum comes to tell you to tidy up
    this.family.move(this.you, this.dog, now, seconds, game.brotherFollows);
    if (this.family.starFromMum()) game.getAStar(); // for tidying up!
    this.starStickers.update(this.you, game.stars);
    this.daycare.update(this.you, now, seconds);
    this.schoolClass.update(this.you, seconds);
    this.roof.settle(!insideHouse(this.you.model.position), seconds);
    this.homeTV.update(game, this.you, this.family.dadWatchingRugby(), this.stage.camera, now, seconds);
    const police = this.hideout.police.spots(); // the police, taking the bad guys away
    const whoCanOpenDoors = [this.you.model.position, this.dog.model.position, ...this.family.spots(), ...police];
    for (const door of this.doors) door.swing(door.someoneNear(whoCanOpenDoors), seconds);
    this.stage.follow(this.you.model.position);
    this.stage.draw();
  }

  // this is home while the bad guys are taking you, or have got you in their hideout: no buttons, your family
  // carries on, and the doors open for Saydee, the bad guys and the police. If you shout HELP in the chat, Saydee hears
  whileTheBadGuysHaveYou(game: Game, you: Person3D, dog: Dog3D, now: number, seconds: number): void {
    game.takeRequest();
    const said = game.takeWhatYouSaid();
    if (said != null) this.family.hearFromTheHideout(said, game.chat);
    if (said != null && askedForHelp(said)) this.hideout.hearHelp();
    this.carryOn(you, dog, now, seconds, this.hideout.police.watch() ?? you.model.position); // watch the police come
  }

  // this is you in the bad guys' base: you walk about down there, the wolf comes at you,
  // and if you shout HELP in the chat, Saydee comes running
  whileInTheBase(game: Game, you: Person3D, dog: Dog3D, now: number, seconds: number): void {
    const said = game.takeWhatYouSaid();
    if (said != null) this.family.hearFromTheHideout(said, game.chat);
    if (said != null && askedForHelp(said)) this.baseVisit.callSaydee();
    const saydeeComing = this.baseVisit.play(game, you, dog, this.homeDog, this.stage, now, seconds);
    if (!saydeeComing) this.homeDog.move(dog, you, game.pet, false, now, seconds);
    this.baseVisit.updateButtons(game, you, dog, this.stage.camera, seconds, false);
    this.carryOn(you, dog, now, seconds, you.model.position);
  }

  // this keeps home going while you can't do the usual things: your family carries on, the roof lifts off,
  // the doors open for everyone (the bad guys and the police too), and the camera watches
  carryOn(you: Person3D, dog: Dog3D, now: number, seconds: number, watch: Vector3): void {
    this.family.move(you, dog, now, seconds, false);
    this.roof.settle(!insideHouse(you.model.position), seconds);
    const visitors = [...this.nightBadGuys.spots(), ...this.hideout.police.spots()];
    const whoCanOpenDoors = [dog.model.position, ...this.family.spots(), ...visitors];
    for (const door of this.doors) door.swing(door.someoneNear(whoCanOpenDoors), seconds);
    this.stage.follow(watch);
    this.stage.draw();
  }

  // this makes it night while you are in bed: it gets dark and your family goes to bed.
  // When you get up it's morning: it's light again, everyone gets up too, and you put your school uniform on
  darkWhileInBed(game: Game, you: Person3D): void {
    if (you.lying === this.dark) return;
    this.dark = you.lying;
    this.stage.darken(this.dark);
    if (this.dark) {
      this.family.goToBed();
      return;
    }
    this.family.wakeUp(you);
    game.putOnUniform();
  }

  // this does what you pressed a button for: play in the ball pit, have dinner, sit down, or take an apple or a treat from the fridge
  doWhatWasAsked(game: Game, you: Person3D): void {
    const asked = game.takeRequest();
    if (this.dog != null) this.saydeeRide.press(asked, you, this.dog);
    this.homePlay.startPlaying(asked, you);
    if (this.homePlay.riding != null) return; // no sitting down or fridge while you're in the ball pit
    if (asked === "dinner" && !you.isDown()) {
      this.family.startDinner(you);
      this.resting.alreadySitting();
    }
    if (asked === "giveApple") this.giveBrotherYourApple(you);
    this.homeTV.press(asked);
    if (asked === "goInTunnel" || asked === "goDownTrapdoor") this.baseVisit.goIn(game, you, asked === "goDownTrapdoor");
    this.family.movePresent(asked);
    if (asked === "sit" && !you.isDown()) this.resting.sitAtNearestSeat(you);
    if (asked === "bed" && !you.isDown()) this.resting.goToBed(you);
    if (asked === "apple" && atFridge(you.model.position)) this.carrying.takeApple(you);
    if (asked === "treat" && atFridge(you.model.position)) this.carrying.takeTreat(you);
  }

  // this takes the apple out of your hand and gives it to your brother
  giveBrotherYourApple(you: Person3D): void {
    const apple = this.carrying.giveAwayApple(you);
    if (apple != null) this.family.brotherTakesApple(apple);
  }

  // this puts on your clothes, your swimming costume or your PJs, when you change at the wardrobe
  dressYou(game: Game, you: Person3D): void {
    if (game.outfit === this.wearing) return;
    you.dress(yourOutfit(game.outfit));
    this.family.wearPJs(game.outfit === "pjs"); // when you put your PJs on, your family does too
    this.wearing = game.outfit;
  }

  // this makes her spin round for joy after a treat
  spinForJoy(dog: Dog3D, seconds: number): void {
    if (this.spinTimeLeft <= 0) return;
    this.spinTimeLeft = this.spinTimeLeft - seconds;
    dog.spinBy(this.spinTimeLeft * HAPPY_SPIN_SPEED);
  }

  // this shows the bubbles while Saydee is sitting in her bath
  bubbleBath(dog: Dog3D, bathTime: boolean, now: number): void {
    if (this.bath == null) return;
    this.bath.bubble(bathTime && dog.model.position.distanceTo(ERRAND_SPOTS.bath) < 0.1, now);
  }

  // this throws the home away when the game closes
  stop(): void {
    this.thingButtons.stop();
    this.homePlay.stop();
    this.family.stop();
    this.homeTV.stop();
    this.saydeeRide.stop();
    this.hideout.stop();
    this.baseVisit.stop();
    this.schoolClass.stop();
    this.stage.stop();
    this.dog = null;
    this.you = null;
    this.carrying = new Carrying();
    this.bath = null;
    this.roof = new Roof3D();
    this.homeDog = new HomeDog();
  }
}
