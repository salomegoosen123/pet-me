// family.ts – your family in the 3D home: your brother, your mum and your dad, walking round the house. Mia designed this game.
import { Vector3 } from "three";
import type { Camera, Object3D, Scene } from "three";
import { BallPitBuddy } from "./BallPitBuddy";
import { BROTHER_BED_MIDDLE, LYING_SPOT } from "./bedroom";
import { BrotherGifts } from "./BrotherGifts";
import { insideBlock } from "./bumping";
import { Cooking3D, STOVE_SPOT } from "./Cooking3D";
import { Dinner } from "./Dinner";
import type { Dog3D } from "./Dog3D";
import { FamilyChat } from "./FamilyChat";
import { FamilyWalker } from "./FamilyWalker";
import type { Away, Bed, DayPlan } from "./FamilyWalker";
import { FollowYou } from "./FollowYou";
import type { Ask, Game } from "./Game";
import { inThePool } from "./pool";
import { SchoolRun } from "./School";
import type { Snack3D } from "./Snack3D";
import { SwimWithYou } from "./SwimWithYou";
import { TidyUpCall } from "./TidyUpCall";
import { WATCHING_SPOT, WatchingRugby } from "./WatchingRugby";
import { spreadSpot } from "./homeSpots";
import { BALL_PIT_BLOCK } from "./obstacles";
import { DAD_LYING_SPOT, MUM_LYING_SPOT, PARENTS_BED_SPOT } from "./parentsRoom";
import { BALL_PIT_SPOT } from "./playRoom";
import { Person3D } from "./Person3D";
import type { PersonLook } from "./Person3D";
import {
  BROTHER_BEDCOVER_COLOUR, BROTHER_HAIR_COLOUR, BROTHER_PJS_COLOUR, BROTHER_SHIRT_COLOUR,
  BROTHER_SWIMSUIT_COLOUR, DAD_HAIR_COLOUR, DAD_PJS_COLOUR, DAD_SHIRT_COLOUR, MUM_HAIR_COLOUR, MUM_PJS_COLOUR,
  MUM_SHIRT_COLOUR, PARENTS_BEDCOVER_COLOUR, SKIN_COLOUR, BROTHER_SIZE,
} from "./settings";

const GROWN_UP: number = 1; // grown-ups are full size

// your brother: the same size as you, with short hair
export const BROTHER_LOOK: PersonLook = {
  hair: BROTHER_HAIR_COLOUR, skin: SKIN_COLOUR, shirt: BROTHER_SHIRT_COLOUR, pants: "navy", size: BROTHER_SIZE, ponytail: false,
  blanket: BROTHER_BEDCOVER_COLOUR,
};

// your brother's swimming costume: a bright costume, with bare legs
export const BROTHER_COSTUME: PersonLook = { ...BROTHER_LOOK, shirt: BROTHER_SWIMSUIT_COLOUR, pants: SKIN_COLOUR };

// your mum: a grown-up with a ponytail
export const MUM_LOOK: PersonLook = {
  hair: MUM_HAIR_COLOUR, skin: SKIN_COLOUR, shirt: MUM_SHIRT_COLOUR, pants: "dimgray", size: GROWN_UP, ponytail: true,
  blanket: PARENTS_BEDCOVER_COLOUR,
};

// your dad: a grown-up with short hair
export const DAD_LOOK: PersonLook = {
  hair: DAD_HAIR_COLOUR, skin: SKIN_COLOUR, shirt: DAD_SHIRT_COLOUR, pants: "navy", size: GROWN_UP, ponytail: false,
  blanket: PARENTS_BEDCOVER_COLOUR,
};

// everyone's PJs, a top and bottoms that match, for when you put your PJs on
const BROTHER_PJS: PersonLook = { ...BROTHER_LOOK, shirt: BROTHER_PJS_COLOUR, pants: BROTHER_PJS_COLOUR };
const MUM_PJS: PersonLook = { ...MUM_LOOK, shirt: MUM_PJS_COLOUR, pants: MUM_PJS_COLOUR };
const DAD_PJS: PersonLook = { ...DAD_LOOK, shirt: DAD_PJS_COLOUR, pants: DAD_PJS_COLOUR };

// where everyone starts at home
const BROTHER_HOME_SPOT: Vector3 = spreadSpot(-1.7, 3.9); // in the living room, left of the front door
const DAD_HOME_SPOT: Vector3 = spreadSpot(1.7, 3.9); // in the living room, right of the front door
const MUM_HOME_SPOT: Vector3 = STOVE_SPOT; // in the kitchen, cooking at the stove

// the places in the house your family likes to go
const FAMILY_PLACES: Vector3[] = [
  BROTHER_HOME_SPOT,
  DAD_HOME_SPOT,
  MUM_HOME_SPOT,
  spreadSpot(0, 1.5), // the middle of the house
  spreadSpot(6.5, 2.2), // by the kitchen table
  spreadSpot(7, -7), // your parents' room, at the end of their bed
  spreadSpot(-2, -5.5), // your bedroom
  spreadSpot(-5.5, 0.5), // the bathroom
];

// the play room is only for you and your brother, so only he goes there too: to the middle, and into the ball pit
const BROTHER_PLACES: Vector3[] = [...FAMILY_PLACES, spreadSpot(-6, -6), BALL_PIT_SPOT];

// Mum loves cooking, so the stove is in her list three times
const MUM_PLACES: Vector3[] = [...FAMILY_PLACES, STOVE_SPOT, STOVE_SPOT];

// Dad loves watching rugby, so the sofa is in his list three times
const DAD_PLACES: Vector3[] = [...FAMILY_PLACES, WATCHING_SPOT, WATCHING_SPOT, WATCHING_SPOT];

// everyone's bed: where they stand next to it, and where they lie in it
const BROTHER_BED: Bed = {
  side: BROTHER_BED_MIDDLE.clone().add(new Vector3(1.65, 0, 0.8)), // between his bed and yours
  lying: LYING_SPOT.clone().setX(BROTHER_BED_MIDDLE.x), // his bed is just like yours
};
const MUM_BED: Bed = { side: PARENTS_BED_SPOT.clone().add(new Vector3(-1.95, 0, 0.8)), lying: MUM_LYING_SPOT };
const DAD_BED: Bed = { side: PARENTS_BED_SPOT.clone().add(new Vector3(1.95, 0, 0.8)), lying: DAD_LYING_SPOT };

// this makes one person in your family, standing in their spot, ready to follow their day plan
function makeWalker(spot: Vector3, plan: DayPlan): FamilyWalker {
  const person = new Person3D(plan.clothes);
  person.model.position.copy(spot);
  return new FamilyWalker(person, plan);
}

// this says who a walker is
function personOf(walker: FamilyWalker): Person3D {
  return walker.person;
}

// this says where someone is
function whereTheyAre(person: Person3D): Vector3 {
  return person.model.position;
}

// this says someone's 3D model
function modelOf(person: Person3D): Object3D {
  return person.model;
}

// your Family3D at home: they walk from room to room and look at you when they stop. Mum cooks, Dad watches rugby,
// and when the table is full everyone has dinner together
export class Family3D {
  walkers: FamilyWalker[];
  cooking: Cooking3D; // Mum's pot on the stove, and the plates
  rugby: WatchingRugby; // Dad on the sofa
  dinner: Dinner; // the Dinner button, and everyone eating
  swimming: SwimWithYou; // your brother swimming with you in the pool
  following: FollowYou; // your brother following you everywhere else
  ballPit: BallPitBuddy; // your brother bouncing in the ball pit with you
  gifts: BrotherGifts; // the Give button over your brother, and the apple he's eating
  chat: FamilyChat; // everyone's speech bubbles, when you chat
  school: SchoolRun; // your brother's school across the road, and him walking there in the morning
  tidyUp: TidyUpCall; // Mum coming to tell you to clean up the play room
  playRoomMessy: boolean; // is there a mess in the play room

  constructor() {
    this.school = new SchoolRun(BROTHER_LOOK);
    this.tidyUp = new TidyUpCall();
    this.playRoomMessy = false;
    this.ballPit = new BallPitBuddy();
    this.cooking = new Cooking3D();
    this.rugby = new WatchingRugby();
    this.swimming = new SwimWithYou(BROTHER_LOOK, BROTHER_COSTUME);
    this.following = new FollowYou();
    this.walkers = [
      makeWalker(BROTHER_HOME_SPOT, {
        places: BROTHER_PLACES, bed: BROTHER_BED, jumpIn: BALL_PIT_BLOCK, hobby: null, clothes: BROTHER_LOOK, pjs: BROTHER_PJS,
      }),
      makeWalker(MUM_HOME_SPOT, {
        places: MUM_PLACES, bed: MUM_BED, jumpIn: null, hobby: this.cooking, clothes: MUM_LOOK, pjs: MUM_PJS,
      }),
      makeWalker(WATCHING_SPOT, {
        places: DAD_PLACES, bed: DAD_BED, jumpIn: null, hobby: this.rugby, clothes: DAD_LOOK, pjs: DAD_PJS,
      }),
    ];
    this.dinner = new Dinner(this.cooking.plates, this.walkers);
    this.gifts = new BrotherGifts(this.walkers[0].person);
    this.chat = new FamilyChat(this.everyone(), ["brother", "mum", "dad"]);
  }

  // this lets you chat with Saydee too (she's in the home, not in your family's walkers)
  chatWithSaydee(dog: Dog3D): void {
    this.chat.addSaydee(dog);
  }

  // this shows what you said in the chat, and the person you named (or the closest) answers
  hear(words: string, you: Person3D, chat: string[]): void {
    this.chat.youSay(words, you, chat);
  }

  // this shows what you shouted from the bad guys' hideout: your family can't hear you down there
  hearFromTheHideout(words: string, chat: string[]): void {
    this.chat.youSayAlone(words, chat);
  }

  // this puts your family, the Dinner button and the Give button in the home, and starts listening for clicks
  start(scene: Scene, canvas: HTMLCanvasElement): void {
    for (const thing of this.models()) scene.add(thing);
    this.dinner.start(scene, canvas);
    this.gifts.start(scene, canvas);
    this.chat.start(scene);
  }

  // this pops the Dinner button and the Give button up and down
  updateButtons(game: Game, you: Person3D, camera: Camera, seconds: number, youHaveApple: boolean): void {
    this.dinner.updateButtons(game, you, camera, seconds);
    this.gifts.updateButtons(game, you, camera, seconds, youHaveApple);
  }

  // this gives your brother the apple from your hand
  brotherTakesApple(apple: Snack3D): void {
    this.gifts.takeApple(apple);
  }

  // this takes the present out of the wardrobe, or gives it to your brother, if you asked
  movePresent(asked: Ask | null): void {
    this.gifts.movePresent(asked);
  }

  // this starts dinner, when you press the Dinner button
  startDinner(you: Person3D): void {
    this.dinner.begin(you);
  }

  // this throws the Dinner and Give buttons away when the game closes
  stop(): void {
    this.dinner.stop();
    this.gifts.stop();
    this.chat.stop();
    this.school.stop();
    this.tidyUp.stop();
  }

  // this says if Dad is watching rugby, so the TV can show it
  dadWatchingRugby(): boolean {
    return this.rugby.watching;
  }

  // this says who is in your family
  everyone(): Person3D[] {
    return this.walkers.map(personOf);
  }

  // this says everything that goes in the home: your family, Mum's pot and plate, and your brother's school bubble
  models(): Object3D[] {
    return [...this.everyone().map(modelOf), ...this.cooking.models(), ...this.school.models(), this.tidyUp.bubble.model];
  }

  // this tells your family if there's a mess in the play room (then Mum comes to tell you to tidy up)
  messInThePlayRoom(messy: boolean): void {
    this.playRoomMessy = messy;
  }

  // this says if Mum has just given you a gold star for tidying up
  starFromMum(): boolean {
    return this.tidyUp.takeTheStar();
  }

  // this says where everyone is, so you bump into them and doors open for them
  spots(): Vector3[] {
    return this.everyone().map(whereTheyAre);
  }

  // this moves everyone a little bit, eats a bit of dinner if it's dinner time,
  // and keeps your brother with you (following you too, if you told him to)
  move(you: Person3D, dog: Dog3D, now: number, seconds: number, brotherFollows: boolean): void {
    this.brotherComesAlong(you, brotherFollows);
    this.mumChecksThePlayRoom(you);
    for (const walker of this.walkers) walker.move(you, dog, now, seconds);
    this.dinner.eat(you, seconds);
    this.gifts.update(you, seconds);
    this.chat.update(you, seconds);
    this.school.followHim(this.walkers[0].person, seconds);
    this.tidyUp.followHer(this.walkers[1].person, seconds);
  }

  // when there's a mess in the play room, Mum comes to the door and tells you to clean up your room
  // (unless it's bedtime or dinner time). When it's tidy, she says well done and goes back to what she was doing
  mumChecksThePlayRoom(you: Person3D): void {
    const mum = this.walkers[1];
    const free = !mum.bedtime && mum.dinnerChair == null;
    const away = free && this.playRoomMessy ? this.tidyUp : null;
    if (mum.away === away) return;
    if (mum.away === this.tidyUp && !this.playRoomMessy) this.tidyUp.wellDone();
    mum.comeBack();
    if (away != null) mum.goAway(away, you);
  }

  // this sends your brother to school in the morning. The rest of the time he stays with you: swimming next to you
  // in the pool, bouncing next to you in the ball pit, and following you everywhere else if you told him to
  // (unless it's bedtime or dinner time)
  brotherComesAlong(you: Person3D, follows: boolean): void {
    const brother = this.walkers[0];
    const free = !brother.bedtime && brother.dinnerChair == null;
    const youSwimming = inThePool(you.model.position) && !you.isDown();
    const youInBallPit = insideBlock(you.model.position, BALL_PIT_BLOCK);
    let away: Away | null = null;
    if (free && this.school.schoolTime()) away = this.school;
    else if (free && youSwimming) away = this.swimming;
    else if (free && youInBallPit) away = this.ballPit;
    else if (free && follows) away = this.following;
    if (brother.away === away) return;
    brother.comeBack();
    if (away != null) brother.goAway(away, you);
  }

  // this puts everyone in their PJs when you put yours on, and back in their clothes when you take them off
  wearPJs(on: boolean): void {
    for (const walker of this.walkers) walker.person.dress(on ? walker.plan.pjs : walker.plan.clothes);
    this.school.keepUniformOn(this.walkers[0].person); // (not your brother, if it's a school day)
  }

  // this sends everyone to bed (if it was dinner time, dinner's over)
  goToBed(): void {
    if (this.dinner.eating) this.dinner.finish();
    for (const walker of this.walkers) walker.goToBed();
  }

  // this gets everyone up again. It's morning, so it's time for school (you get your school bag on)
  wakeUp(you: Person3D): void {
    for (const walker of this.walkers) walker.wakeUp();
    this.school.newDay(you);
  }
}
