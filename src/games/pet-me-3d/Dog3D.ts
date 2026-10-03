// Dog3D.ts – a 3D dog, like Saydee: a pitbull with a collar, who can walk, eat and wag its tail. Mia designed this game.
import { CapsuleGeometry, ConeGeometry, CylinderGeometry, Group, SphereGeometry, TorusGeometry, Vector3 } from "three";
import type { Mesh } from "three";
import { makeFurSpots } from "./furSpots";
import { makePart } from "./paint";
import {
  COLLAR_COLOUR, EAR_COLOUR, FUR_COLOUR, HEAD_WIDTH, NOSE_COLOUR, PUPPY_SIZE, SNOUT_COLOUR, WAG_SPEED,
} from "./settings";

const WAG_SWING: number = 0.6; // how far her tail swings each way
const LYING_DOWN: number = Math.PI / 2; // turns her body so she lies flat, facing you
const EAR_TILT: number = 0.5; // how much her little ears lean out to the side
const EAR_FOLD: number = 0.4; // how much the tips of her ears fold forward
const TAIL_UP: number = -0.7; // how much her tail sticks up behind her
const ARRIVED: number = 0.02; // this close to a spot counts as being there
const HOP_SPEED: number = 10; // how fast she hops while she walks
const HOP_HEIGHT: number = 0.12; // how high she hops
const NOM_SPEED: number = 12; // how fast she nods while she eats or drinks
const NOM_DIP: number = 0.08; // how far she dips her head into the bowl
const COLLAR_TILT: number = -0.5; // tilts her collar so it sits around her neck
const TUMMY_HEIGHT: number = 0.3; // how far her tummy is above her feet, before she is made smaller
const EXCITED_WAG: number = 3; // her tail wags this many times faster when she's excited
const BUMP_SIZE: number = 0.6; // how much room a dog takes up, before she is made smaller
const SLEEPY_HEAD: number = 0.15; // how far her head droops when she sleeps
const BREATH_SPEED: number = 2; // how fast she breathes in her sleep
const BREATH_SIZE: number = 0.04; // how much she swells when she breathes in
const CLOSED_EYES: number = 0.15; // closed eyes are squashed flat into little sleepy lines
const DIG_DIP: number = 0.25; // how far her nose goes down when she digs
const DIG_SPEED: number = 20; // how fast she scrabbles
const DIG_SCRABBLE: number = 0.08; // how much she bobs while she scrabbles

// how a dog looks: its fur, its ears, if it has pink spots, and how big it is
export interface DogLook {
  fur: string;
  ears: string;
  spots: boolean;
  size: number;
}

// how Saydee looks
export const SAYDEE_LOOK: DogLook = { fur: FUR_COLOUR, ears: EAR_COLOUR, spots: true, size: PUPPY_SIZE };

// a Dog3D is a 3D dog, like Saydee: it can walk, hop, eat, and wag its tail
export class Dog3D {
  model: Group; // where she is and which way she faces
  pose: Group; // her body inside it, which hops and nods
  tail: Group;
  collar: Mesh | null; // where the leash clips on
  eyes: Mesh[];
  look: DogLook;

  constructor(look: DogLook = SAYDEE_LOOK) {
    this.model = new Group();
    this.pose = new Group();
    this.tail = new Group();
    this.collar = null;
    this.eyes = [];
    this.look = look;
    this.build(look);
    this.pose.scale.setScalar(look.size);
    this.model.add(this.pose);
  }

  // this says how much room the dog takes up, for bumping into things
  bumpSize(): number {
    return BUMP_SIZE * this.look.size;
  }

  // this says how high to put the dog so its feet are on the ground
  standingHeight(): number {
    return -TUMMY_HEIGHT * this.look.size;
  }

  // this puts the dog together, part by part, as a pitbull
  build(look: DogLook): void {
    const fur = look.fur;
    const ears = look.ears;
    const body = makePart(new CapsuleGeometry(0.5, 0.7, 8, 16), fur,0, 0.8, 0);
    body.rotation.x = LYING_DOWN;
    const chest = makePart(new SphereGeometry(0.5, 32, 16), fur,0, 0.85, 0.45);
    chest.scale.set(1.1, 1, 1);
    const head = makePart(new SphereGeometry(0.48, 32, 16), fur,0, 1.42, 0.85);
    head.scale.set(HEAD_WIDTH, 1, 1.05); // a big puppy head, as wide as the HEAD_WIDTH knob
    const snout = makePart(new SphereGeometry(0.22, 24, 12), SNOUT_COLOUR, 0, 1.25, 1.3);
    snout.scale.set(1.17 * HEAD_WIDTH, 0.85, 0.9); // a short puppy jaw, as wide as her head
    const nose = makePart(new SphereGeometry(0.08, 16, 8), NOSE_COLOUR, 0, 1.33, 1.5);
    const eyeApart = 0.18 * HEAD_WIDTH; // her eyes move closer together on a thinner head
    const leftEye = makePart(new SphereGeometry(0.09, 16, 8), NOSE_COLOUR, -eyeApart, 1.52, 1.29);
    const rightEye = makePart(new SphereGeometry(0.09, 16, 8), NOSE_COLOUR, eyeApart, 1.52, 1.29);
    const earApart = 0.3 * HEAD_WIDTH; // and so do her ears
    const leftEar = makePart(new ConeGeometry(0.12, 0.24, 12), ears,-earApart, 1.9, 0.8);
    leftEar.rotation.set(EAR_FOLD, 0, EAR_TILT);
    const rightEar = makePart(new ConeGeometry(0.12, 0.24, 12), ears,earApart, 1.9, 0.8);
    rightEar.rotation.set(EAR_FOLD, 0, -EAR_TILT);
    const leftPaw = makePart(new CapsuleGeometry(0.13, 0.35, 6, 12), fur,-0.28, 0.43, 1.05);
    leftPaw.rotation.x = LYING_DOWN;
    const rightPaw = makePart(new CapsuleGeometry(0.13, 0.35, 6, 12), fur,0.28, 0.43, 1.05);
    rightPaw.rotation.x = LYING_DOWN;
    const leftHip = makePart(new SphereGeometry(0.32, 16, 12), fur,-0.38, 0.65, -0.45);
    const rightHip = makePart(new SphereGeometry(0.32, 16, 12), fur,0.38, 0.65, -0.45);

    const tailPart = makePart(new CylinderGeometry(0.035, 0.08, 0.45, 12), fur,0, 0.22, 0);
    this.tail.add(tailPart);
    this.tail.position.set(0, 1.0, -0.72); // the tail starts inside her bottom, so it stays on
    this.tail.rotation.x = TAIL_UP;

    this.eyes = [leftEye, rightEye];
    this.pose.add(body, chest, head, snout, nose, leftEye, rightEye, leftEar, rightEar);
    this.pose.add(leftPaw, rightPaw, leftHip, rightHip, this.tail);
    if (look.spots) this.pose.add(...makeFurSpots());

    const collar = makePart(new TorusGeometry(0.36, 0.07, 12, 32), COLLAR_COLOUR, 0, 1.1, 0.62);
    collar.rotation.x = COLLAR_TILT;
    this.pose.add(collar);
    this.collar = collar;
  }

  // this says where her collar is, so the leash can clip on
  collarSpot(): Vector3 {
    if (this.collar == null) return this.model.position.clone();
    return this.collar.getWorldPosition(new Vector3());
  }

  // this swings her tail from side to side, super fast when she's excited
  wag(seconds: number, excited: boolean = false): void {
    const speed = excited ? WAG_SPEED * EXCITED_WAG : WAG_SPEED;
    this.tail.rotation.z = Math.sin(seconds * speed) * WAG_SWING;
  }

  // this walks her a little way towards a spot, facing where she goes, and says if she is there
  walkTowards(spot: Vector3, speed: number, seconds: number): boolean {
    const way = spot.clone().sub(this.model.position);
    const distance = way.length();
    if (distance < ARRIVED) return true;
    if (Math.abs(way.x) + Math.abs(way.z) > ARRIVED) this.model.rotation.y = Math.atan2(way.x, way.z);
    this.model.position.addScaledVector(way.normalize(), Math.min(distance, speed * seconds));
    return false;
  }

  // this turns her to face you again
  faceFront(): void {
    this.model.rotation.y = 0;
  }

  // this turns her to look at a spot, like her bowl
  faceTowards(spot: Vector3): void {
    const way = spot.clone().sub(this.model.position);
    this.model.rotation.y = Math.atan2(way.x, way.z);
  }

  // this turns her a bit further round, for a happy spin
  spinBy(angle: number): void {
    this.model.rotation.y = this.model.rotation.y + angle;
  }

  // this makes her hop along while she walks
  hop(seconds: number): void {
    this.eyesOpen(true);
    this.pose.scale.y = this.look.size;
    this.pose.position.y = Math.abs(Math.sin(seconds * HOP_SPEED)) * HOP_HEIGHT;
    this.pose.rotation.x = 0;
  }

  // this makes her nod into her bowl while she eats or drinks
  nom(seconds: number): void {
    this.pose.position.y = 0;
    this.pose.rotation.x = (1 + Math.sin(seconds * NOM_SPEED)) * NOM_DIP;
  }

  // this opens or closes her eyes
  eyesOpen(open: boolean): void {
    for (const eye of this.eyes) eye.scale.y = open ? 1 : CLOSED_EYES;
  }

  // this makes her sleep: eyes closed, head down, tail still, breathing slowly in and out
  snooze(seconds: number): void {
    this.eyesOpen(false);
    this.pose.position.y = 0;
    this.pose.rotation.x = SLEEPY_HEAD;
    this.pose.scale.y = this.look.size * (1 + Math.sin(seconds * BREATH_SPEED) * BREATH_SIZE);
    this.tail.rotation.z = 0;
  }

  // this makes her dig: nose down in the sand, scrabbling fast
  dig(seconds: number): void {
    this.eyesOpen(true);
    this.pose.scale.y = this.look.size;
    this.pose.position.y = 0;
    this.pose.rotation.x = DIG_DIP + Math.sin(seconds * DIG_SPEED) * DIG_SCRABBLE;
  }

  // this makes her lie still
  keepStill(): void {
    this.eyesOpen(true);
    this.pose.scale.y = this.look.size;
    this.pose.position.y = 0;
    this.pose.rotation.x = 0;
  }
}
