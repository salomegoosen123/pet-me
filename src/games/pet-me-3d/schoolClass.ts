// schoolClass.ts – the class in your brother's school: the teacher at the board, and children sitting at their
// desks. When you walk in, the roof lifts off and the teacher says good morning. Two of the children are bullies,
// with their caps on backwards: they say mean things, and the teacher tells them off. The rest are smart children,
// with round glasses and books open on their desks. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, TorusGeometry, Vector3 } from "three";
import type { Object3D } from "three";
import { makePart } from "./paint";
import { Person3D } from "./Person3D";
import type { PersonLook } from "./Person3D";
import {
  CHILDRENS_SEATS, insideSchool, makeSchoolGrounds, makeSchoolRoof, SCHOOL_SEAT_TOP, SCHOOL_SEATS, TEACHER_SPOT,
} from "./schoolBuilding";
import {
  BOOK_COLOURS, BULLY_CAP_COLOUR, BULLY_SECONDS, BULLY_WORDS, FRIEND_HAIR_COLOURS, FRIEND_SKIN_COLOURS, GLASSES_COLOUR,
  SCHOOL_BULLIES, SCHOOL_UNIFORM_BOTTOMS, SCHOOL_UNIFORM_TOP, TEACHER_SHIRT_COLOUR,
} from "./settings";
import { SpeechBubble3D } from "./SpeechBubble3D";

const CHILD_SIZE: number = 0.7; // school children are as big as your brother
const ROOF_LIFT: number = 6; // how high the roof lifts when you walk in
const ROOF_SPEED: number = 10; // how fast it lifts off and comes down
const ABOVE_THE_TEACHER: number = 2.9; // her speech bubble floats this far above her feet
const ABOVE_A_CHILD: number = 1.8; // a sitting child's speech bubble floats this far above their feet
const FACING_THE_CLASS: number = Math.PI; // the teacher faces the desks (and the door)
const TELL_OFF_AFTER: number = 1.5; // the teacher tells a bully off this long after they say something mean
const TELLING_OFF_SECONDS: number = 3; // and she looks at them this long while she does
const ON_THE_DESK: Vector3 = new Vector3(0, 0.58, 0.45); // where a book lies, from the chair: on the desk in front
const OPEN_PAGES: number = 0.15; // how far the pages of an open book tip up

// how the teacher looks
const TEACHER_LOOK: PersonLook = {
  hair: "goldenrod", skin: "peachpuff", shirt: TEACHER_SHIRT_COLOUR, pants: "dimgray", size: 1, ponytail: true,
  blanket: "white",
};

// this says if the child on a seat is a bully: the last ones to sit down are
function isABully(seat: number): boolean {
  return CHILDRENS_SEATS.indexOf(seat) >= CHILDRENS_SEATS.length - SCHOOL_BULLIES;
}

// this puts a cap on a bully's head, on backwards
function addBackwardsCap(bully: Person3D): void {
  bully.model.add(
    makePart(new CylinderGeometry(0.32, 0.34, 0.16, 16), BULLY_CAP_COLOUR, 0, 2.3, 0),
    makePart(new BoxGeometry(0.4, 0.04, 0.3), BULLY_CAP_COLOUR, 0, 2.24, -0.42),
  );
}

// this puts round glasses on a smart child
function addGlasses(child: Person3D): void {
  for (const x of [-0.12, 0.12]) {
    child.model.add(makePart(new TorusGeometry(0.09, 0.018, 8, 20), GLASSES_COLOUR, x, 2.02, 0.32));
  }
  child.model.add(makePart(new BoxGeometry(0.07, 0.02, 0.02), GLASSES_COLOUR, 0, 2.03, 0.33));
}

// this makes an open book on a smart child's desk
function makeBook(seat: number, colour: string): Group {
  const book = new Group();
  const left = makePart(new BoxGeometry(0.17, 0.02, 0.24), "white", -0.085, 0.03, 0);
  const right = makePart(new BoxGeometry(0.17, 0.02, 0.24), "white", 0.085, 0.03, 0);
  left.rotation.z = -OPEN_PAGES;
  right.rotation.z = OPEN_PAGES;
  book.add(makePart(new BoxGeometry(0.38, 0.02, 0.26), colour, 0, 0.01, 0), left, right);
  book.position.copy(SCHOOL_SEATS[seat].spot).add(ON_THE_DESK);
  return book;
}

// this makes one child sitting at a desk, in school uniform, with all different hair and skin
// (caps on backwards for bullies, and glasses for smart children)
function makeChild(seat: number): Person3D {
  const look: PersonLook = {
    hair: FRIEND_HAIR_COLOURS[seat % FRIEND_HAIR_COLOURS.length],
    skin: FRIEND_SKIN_COLOURS[(seat * 3) % FRIEND_SKIN_COLOURS.length],
    shirt: SCHOOL_UNIFORM_TOP, // everyone's in school uniform
    pants: SCHOOL_UNIFORM_BOTTOMS,
    size: CHILD_SIZE,
    ponytail: seat % 2 === 0,
    blanket: "white",
  };
  const child = new Person3D(look);
  child.sitDown(SCHOOL_SEATS[seat].spot, SCHOOL_SEATS[seat].facing, SCHOOL_SEAT_TOP);
  if (isABully(seat)) addBackwardsCap(child);
  else addGlasses(child);
  return child;
}

// SchoolClass is the school building, its roof, the teacher, the children and the bullies
export class SchoolClass {
  grounds: Group;
  roof: Group;
  teacher: Person3D;
  children: Person3D[];
  books: Group; // the smart children's books, open on their desks
  bullies: Person3D[];
  bullyBubbles: SpeechBubble3D[]; // what each bully says
  bubble: SpeechBubble3D; // what the teacher says
  youWereInside: boolean; // were you in the school a moment ago
  roofOn: number; // how high the roof sits on the walls
  roofLift: number; // how far the roof is lifted off
  meanIn: number; // how long until a bully says something mean
  tellOffIn: number; // how long until the teacher tells them off (0 when nobody needs telling off)
  meanOne: number; // which bully said something mean
  tellingOffLeft: number; // how much longer the teacher looks at the bully she's telling off

  constructor() {
    this.grounds = makeSchoolGrounds();
    this.roof = makeSchoolRoof();
    this.roofOn = this.roof.position.y;
    this.roofLift = 0;
    this.teacher = new Person3D(TEACHER_LOOK);
    this.teacher.model.position.copy(TEACHER_SPOT);
    this.teacher.model.rotation.y = FACING_THE_CLASS;
    this.children = CHILDRENS_SEATS.map(makeChild);
    this.books = new Group();
    this.bullies = [];
    this.bullyBubbles = [];
    for (let i = 0; i < CHILDRENS_SEATS.length; i++) {
      const seat = CHILDRENS_SEATS[i];
      if (!isABully(seat)) {
        this.books.add(makeBook(seat, BOOK_COLOURS[i % BOOK_COLOURS.length])); // smart children read books
        continue;
      }
      this.bullies.push(this.children[i]);
      this.bullyBubbles.push(new SpeechBubble3D());
    }
    this.bubble = new SpeechBubble3D();
    this.youWereInside = false;
    this.meanIn = BULLY_SECONDS;
    this.tellOffIn = 0;
    this.meanOne = 0;
    this.tellingOffLeft = 0;
  }

  // the school, the roof, the teacher, the children and everyone's speech bubbles, to go in the home
  models(): Object3D[] {
    return [
      this.grounds, this.roof, this.teacher.model, this.bubble.model, this.books,
      ...this.children.map(modelOf), ...this.bullyBubbles.map(bubbleOf),
    ];
  }

  // this says where the teacher is, so you bump into her (the children are at their desks)
  spots(): Vector3[] {
    return [this.teacher.model.position];
  }

  // this lifts the roof off while you're inside, and the teacher says good morning when you walk in.
  // While you're in class, the bullies say mean things, and the teacher tells them off
  update(you: Person3D, seconds: number): void {
    const inside = insideSchool(you.model.position) && you.model.visible;
    const goal = inside ? ROOF_LIFT : 0;
    this.roofLift = this.roofLift + (goal - this.roofLift) * Math.min(1, ROOF_SPEED * seconds);
    this.roof.position.y = this.roofOn + this.roofLift;
    if (inside && !this.youWereInside) this.bubble.say("Good morning! Welcome to class! 📚");
    this.tellingOffLeft = Math.max(0, this.tellingOffLeft - seconds);
    if (this.tellingOffLeft > 0) this.teacher.faceTowards(this.bullies[this.meanOne].model.position);
    else if (inside) this.teacher.faceTowards(you.model.position);
    else this.teacher.model.rotation.y = FACING_THE_CLASS;
    if (inside) this.bulliesAreMean(you, seconds);
    this.youWereInside = inside;
    this.bubble.follow(this.teacher.model, ABOVE_THE_TEACHER, seconds);
    for (let i = 0; i < this.bullies.length; i++) this.bullyBubbles[i].follow(this.bullies[i].model, ABOVE_A_CHILD, seconds);
  }

  // every now and then a bully turns round and says something mean to you. Then the teacher tells them off,
  // and they turn back to the front
  bulliesAreMean(you: Person3D, seconds: number): void {
    if (this.bullies.length === 0) return;
    if (this.tellOffIn > 0) {
      this.tellOffIn = this.tellOffIn - seconds;
      if (this.tellOffIn <= 0) this.tellOff();
      return;
    }
    this.meanIn = this.meanIn - seconds;
    if (this.meanIn > 0) return;
    this.meanIn = BULLY_SECONDS;
    this.meanOne = Math.floor(Math.random() * this.bullies.length);
    const words = BULLY_WORDS[Math.floor(Math.random() * BULLY_WORDS.length)];
    this.bullyBubbles[this.meanOne].say(words);
    this.bullies[this.meanOne].faceTowards(you.model.position);
    this.tellOffIn = TELL_OFF_AFTER;
  }

  // the teacher turns to the bully and tells them off, and the bully turns back to face the board
  tellOff(): void {
    this.tellingOffLeft = TELLING_OFF_SECONDS;
    this.bubble.say("Stop that! That's not kind! 😠");
    this.bullies[this.meanOne].model.rotation.y = SCHOOL_SEATS[0].facing;
  }

  // this throws the speech bubbles away when the game closes
  stop(): void {
    this.bubble.throwAway();
    for (const bubble of this.bullyBubbles) bubble.throwAway();
  }
}

// this says someone's 3D model
function modelOf(person: Person3D): Object3D {
  return person.model;
}

// this says a speech bubble's 3D model
function bubbleOf(bubble: SpeechBubble3D): Object3D {
  return bubble.model;
}
