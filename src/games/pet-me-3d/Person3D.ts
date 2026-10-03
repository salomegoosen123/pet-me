// Person3D.ts – a 3D person, like you: walking, holding a leash, sitting at the table. Mia designed this game.
import { BoxGeometry, CapsuleGeometry, Group, MeshStandardMaterial, SphereGeometry, Vector3 } from "three";
import type { Mesh, Object3D } from "three";
import { makePart } from "./paint";
import { BEDCOVER_COLOUR, HAIR_COLOUR, PANTS_COLOUR, SHIRT_COLOUR, SKIN_COLOUR, YOU_SIZE } from "./settings";

// how a person looks: their hair, skin, shirt and pants, how big they are (1 is a grown-up), if they have a ponytail,
// and the colour of the blanket that covers them in bed
export interface PersonLook {
  hair: string;
  skin: string;
  shirt: string;
  pants: string;
  size: number;
  ponytail: boolean;
  blanket: string;
}

// how much room a person takes up, for bumping into things
export const PERSON_SIZE: number = 0.35;

// how you look
export const YOUR_LOOK: PersonLook = {
  hair: HAIR_COLOUR, skin: SKIN_COLOUR, shirt: SHIRT_COLOUR, pants: PANTS_COLOUR, size: YOU_SIZE, ponytail: true,
  blanket: BEDCOVER_COLOUR,
};

const ARM_FORWARD: number = -0.9; // tilts your arm so it reaches out to hold the leash
const STEP_SPEED: number = 9; // how fast your legs swing when you walk
const STEP_SWING: number = 0.5; // how far your legs swing
const SEAT_TOP: number = 0.55; // how high the top of a chair or the sofa is, unless it says
const HIPS: number = 0.75; // how high a grown-up's bottom is, from their feet
const HEAD_HEIGHT: number = 1.95; // how high a grown-up's head is
const HEAD_SIZE: number = 0.26;
const BODY_THICKNESS: number = 0.3; // from the middle of a grown-up's body to their back
const LEGS_FORWARD: number = -Math.PI / 2; // your legs stick out in front when you sit
const LEG_APART: number = 0.15; // how far apart your legs are
const LEG_STANDING_Y: number = 0.45; // how high the middle of your legs is when you stand
const LIE_BACK: number = -Math.PI / 2; // tips you over onto your back, head towards the pillow

// this makes the blanket that covers someone in bed, from their feet up to their chest (hidden until they lie down)
function makeBlanket(colour: string): Mesh {
  const blanket = makePart(new BoxGeometry(0.9, 1.5, 0.12), colour, 0, 0.75, 0.34);
  blanket.visible = false;
  return blanket;
}

// a Person3D is you: legs, a body, arms, a head and hair, with a hand for the leash, and a blanket for bedtime
export class Person3D {
  model: Group;
  hand: Group; // an empty spot in your hand, where the leash goes
  legs: Mesh[];
  body: Mesh | null; // your body, which wears your shirt or your swimming costume
  blanket: Mesh;
  sitting: boolean;
  lying: boolean;

  constructor(look: PersonLook = YOUR_LOOK) {
    this.model = new Group();
    this.hand = new Group();
    this.legs = [];
    this.body = null;
    this.blanket = makeBlanket(look.blanket);
    this.sitting = false;
    this.lying = false;
    this.build(look);
    this.model.scale.setScalar(look.size);
  }

  // this says if you are sitting or lying down, so you can't walk until you get up
  isDown(): boolean {
    return this.sitting || this.lying;
  }

  // this makes the head, with hair (and a ponytail, if they have one). A child's head is big for their size
  makeHead(look: PersonLook): Group {
    const head = new Group();
    head.add(makePart(new SphereGeometry(HEAD_SIZE, 24, 16), look.skin, 0, 0, 0));
    const hair = makePart(new SphereGeometry(0.28, 24, 16), look.hair, 0, 0.07, -0.04);
    hair.scale.set(1, 0.8, 1);
    head.add(hair);
    if (look.ponytail) head.add(makePart(new SphereGeometry(0.12, 16, 12), look.hair, 0, 0, -0.3));
    const bigger = 1 / Math.sqrt(look.size);
    head.scale.setScalar(bigger);
    head.position.set(0, HEAD_HEIGHT + HEAD_SIZE * (bigger - 1), 0);
    return head;
  }

  // this puts the person together, part by part
  build(look: PersonLook): void {
    const leftLeg = makePart(new CapsuleGeometry(0.13, 0.6, 6, 12), look.pants, -LEG_APART, LEG_STANDING_Y, 0);
    const rightLeg = makePart(new CapsuleGeometry(0.13, 0.6, 6, 12), look.pants, LEG_APART, LEG_STANDING_Y, 0);
    const body = makePart(new CapsuleGeometry(0.3, 0.5, 8, 16), look.shirt, 0, 1.3, 0);
    const leftArm = makePart(new CapsuleGeometry(0.08, 0.5, 6, 12), look.skin, -0.4, 1.25, 0);
    const rightArm = makePart(new CapsuleGeometry(0.08, 0.5, 6, 12), look.skin, 0.38, 1.3, 0.25);
    rightArm.rotation.x = ARM_FORWARD;
    this.hand.position.set(0.38, 1.08, 0.48);
    this.legs = [leftLeg, rightLeg];
    this.body = body;
    this.model.add(leftLeg, rightLeg, body, leftArm, rightArm, this.makeHead(look), this.hand, this.blanket);
  }

  // this changes what you're wearing: the colour of your top and your legs
  dress(look: PersonLook): void {
    if (this.body != null && this.body.material instanceof MeshStandardMaterial) this.body.material.color.set(look.shirt);
    for (const leg of this.legs) {
      if (leg.material instanceof MeshStandardMaterial) leg.material.color.set(look.pants);
    }
  }

  // this says where your hand is, so the leash can go there
  handSpot(): Vector3 {
    return this.hand.getWorldPosition(new Vector3());
  }

  // this puts something in your hand
  hold(thing: Object3D): void {
    this.hand.add(thing);
  }

  // this takes something out of your hand
  letGo(thing: Object3D): void {
    this.hand.remove(thing);
  }

  // this says which way you are facing
  facing(): Vector3 {
    return new Vector3(Math.sin(this.model.rotation.y), 0, Math.cos(this.model.rotation.y));
  }

  // this turns you to watch Saydee
  faceTowards(spot: Vector3): void {
    const way = spot.clone().sub(this.model.position);
    this.model.rotation.y = Math.atan2(way.x, way.z);
  }

  // this walks you a step along a way, but never past the edge of the park
  stepAlong(way: Vector3, distance: number, edge: number, now: number): void {
    this.model.position.addScaledVector(way, distance);
    if (this.model.position.length() > edge) this.model.position.setLength(edge);
    this.model.rotation.y = Math.atan2(way.x, way.z);
    this.marchOnTheSpot(now);
  }

  // this swings your legs like walking, without moving you, like climbing a ladder
  marchOnTheSpot(now: number): void {
    this.legs[0].rotation.x = Math.sin(now * STEP_SPEED) * STEP_SWING;
    this.legs[1].rotation.x = -Math.sin(now * STEP_SPEED) * STEP_SWING;
  }

  // this makes you stand still
  standStill(): void {
    if (this.isDown()) return;
    for (const leg of this.legs) leg.rotation.x = 0;
  }

  // this lies you down on your back, like in bed with your head on the pillow (a smaller you lies further up the bed).
  // In bed you get a blanket; on a beach towel you don't
  lieDown(feetSpot: Vector3, underBlanket: boolean = true): void {
    const smaller = 1 - this.model.scale.y;
    this.lying = true;
    this.blanket.visible = underBlanket;
    this.model.position.copy(feetSpot).add(new Vector3(0, -BODY_THICKNESS * smaller, -HEAD_HEIGHT * smaller));
    this.model.rotation.set(LIE_BACK, 0, 0);
    for (const leg of this.legs) leg.rotation.x = 0;
  }

  // this sits you down on a seat, like a chair facing the table, or on the slide
  sitDown(spot: Vector3, facing: number, seatTop: number = SEAT_TOP): void {
    this.sitting = true;
    this.model.position.set(spot.x, seatTop - HIPS * this.model.scale.y, spot.z);
    this.model.rotation.y = facing;
    this.legs[0].position.set(-LEG_APART, 0.87, 0.35);
    this.legs[1].position.set(LEG_APART, 0.87, 0.35);
    for (const leg of this.legs) leg.rotation.x = LEGS_FORWARD;
  }

  // this stands you back up
  standUp(): void {
    this.sitting = false;
    this.lying = false;
    this.blanket.visible = false;
    this.model.position.y = 0;
    this.model.rotation.x = 0;
    this.legs[0].position.set(-LEG_APART, LEG_STANDING_Y, 0);
    this.legs[1].position.set(LEG_APART, LEG_STANDING_Y, 0);
    for (const leg of this.legs) leg.rotation.x = 0;
  }
}
