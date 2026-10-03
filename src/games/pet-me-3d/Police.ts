// Police.ts – the police coming to save you from the bad guys' hideout at night: their car drives up with its
// lights flashing, two police officers walk in and find you, arrest the bad guys, and drive them away.
// Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import type { Scene } from "three";
import { TRAPDOOR } from "./homeSpots";
import { FRONT } from "./house";
import { makePart } from "./paint";
import { Person3D } from "./Person3D";
import type { PersonLook } from "./Person3D";
import { POLICE_CAR_COLOUR, POLICE_COLOUR } from "./settings";
import { SpeechBubble3D } from "./SpeechBubble3D";
import { stepTowards, walkAlong } from "./walking";

const CAR_FROM: Vector3 = new Vector3(-26, 0, FRONT + 5.5); // the police car drives in along the road from here
const CAR_PARKED: Vector3 = new Vector3(-5, 0, FRONT + 5.5); // and parks here, in your front garden
const CAR_SPEED: number = 8; // how fast it drives
const BY_THE_CAR: Vector3[] = [new Vector3(-4.4, 0, FRONT + 4.4), new Vector3(-5.6, 0, FRONT + 4.4)]; // where they get out
const OUTSIDE_THE_DOOR: Vector3 = new Vector3(0, 0, FRONT + 1);
const INSIDE_THE_DOOR: Vector3 = new Vector3(0, 0, FRONT - 1);
const AT_THE_TRAPDOOR: Vector3[] = [TRAPDOOR.clone().add(new Vector3(-1.1, 0, 0.9)), TRAPDOOR.clone().add(new Vector3(1.1, 0, 0.9))];
const CLIMBED_UP: Vector3[] = [TRAPDOOR.clone().add(new Vector3(-1.1, 0, -0.5)), TRAPDOOR.clone().add(new Vector3(1.1, 0, -0.5))];
const WALK_SPEED: number = 3; // how fast the police walk
const ARREST_SECONDS: number = 2.5; // how long they hold on to the bad guys before they take them away
const BEHIND: number = 1.1; // the bad guys walk this far behind the police
const FLASH_SPEED: number = 8; // how fast the lights flash
const ABOVE_AN_OFFICER: number = 2.9; // the speech bubble floats this far above a police officer

// the two police officers: one with a ponytail, one with short hair
const OFFICER_LOOKS: PersonLook[] = [
  { hair: "saddlebrown", skin: "peachpuff", shirt: POLICE_COLOUR, pants: POLICE_COLOUR, size: 1, ponytail: true, blanket: "white" },
  { hair: "black", skin: "sienna", shirt: POLICE_COLOUR, pants: POLICE_COLOUR, size: 1, ponytail: false, blanket: "white" },
];

// what the police are doing
type PolicePart = "waiting" | "drivingIn" | "walkingIn" | "arresting" | "walkingOut" | "drivingOff";

// this makes a police officer, with a cap and a gold badge (hidden until the police car comes)
function makeOfficer(look: PersonLook): Person3D {
  const officer = new Person3D(look);
  officer.model.add(
    makePart(new CylinderGeometry(0.29, 0.29, 0.14, 20), POLICE_COLOUR, 0, 2.25, 0),
    makePart(new BoxGeometry(0.4, 0.03, 0.2), "black", 0, 2.19, 0.27),
    makePart(new BoxGeometry(0.12, 0.14, 0.04), "gold", 0.14, 1.45, 0.29),
  );
  officer.model.visible = false;
  return officer;
}

// this makes one light for the top of the police car, that shines in the dark
function makeLight(colour: string, z: number): Mesh {
  const light = new Mesh(new BoxGeometry(0.3, 0.15, 0.4), new MeshStandardMaterial({ color: colour, emissive: colour }));
  light.position.set(-0.1, 1.42, z);
  return light;
}

// this makes the police car: a body with a stripe, a cabin with windows, and four wheels
function makePoliceCar(): Group {
  const car = new Group();
  car.add(
    makePart(new BoxGeometry(2.4, 0.6, 1.2), POLICE_CAR_COLOUR, 0, 0.55, 0),
    makePart(new BoxGeometry(2.42, 0.15, 1.22), POLICE_COLOUR, 0, 0.6, 0),
    makePart(new BoxGeometry(1.3, 0.5, 1.1), POLICE_CAR_COLOUR, -0.1, 1.1, 0),
    makePart(new BoxGeometry(1.2, 0.35, 1.12), "lightblue", -0.1, 1.12, 0),
  );
  for (const x of [-0.8, 0.8]) {
    for (const z of [-0.6, 0.6]) {
      const wheel = makePart(new CylinderGeometry(0.3, 0.3, 0.2, 16), "black", x, 0.3, z);
      wheel.rotation.x = Math.PI / 2;
      car.add(wheel);
    }
  }
  car.visible = false;
  return car;
}

// the Police are the police car and the two officers
export class Police {
  car: Group;
  redLight: Mesh;
  blueLight: Mesh;
  officers: Person3D[];
  bubble: SpeechBubble3D; // "Police! You're under arrest!"
  part: PolicePart;
  stops: Vector3[][]; // where each officer walks next
  badGuys: Person3D[]; // the bad guys they're arresting
  timeLeft: number; // how much longer the arrest takes
  found: boolean; // have they found you

  constructor() {
    this.redLight = makeLight("red", -0.22);
    this.blueLight = makeLight("blue", 0.22);
    this.car = makePoliceCar();
    this.car.add(this.redLight, this.blueLight);
    this.officers = OFFICER_LOOKS.map(makeOfficer);
    this.bubble = new SpeechBubble3D();
    this.part = "waiting";
    this.stops = [[], []];
    this.badGuys = [];
    this.timeLeft = 0;
    this.found = false;
  }

  // this puts the police car and the officers in the home (hidden until someone calls them)
  start(scene: Scene): void {
    scene.add(this.car, this.bubble.model);
    for (const officer of this.officers) scene.add(officer.model);
  }

  // this calls the police to come and arrest the bad guys
  call(badGuys: Person3D[]): void {
    if (this.part !== "waiting") return;
    this.badGuys = badGuys;
    this.found = false;
    this.car.position.copy(CAR_FROM);
    this.car.rotation.y = 0;
    this.car.visible = true;
    this.part = "drivingIn";
  }

  // this says if the police have found you
  foundYou(): boolean {
    return this.found;
  }

  // this says what to watch while the police come for you: their car, then the first officer (or nothing)
  watch(): Vector3 | null {
    if (this.part === "drivingIn") return this.car.position;
    if (this.part === "walkingIn") return this.officers[0].model.position;
    return null;
  }

  // this says where the police are (and the bad guys they're taking away), so the doors open for them
  spots(): Vector3[] {
    const spots: Vector3[] = [];
    for (const officer of this.officers) {
      if (officer.model.visible) spots.push(officer.model.position);
    }
    if (this.part !== "walkingOut") return spots;
    for (const badGuy of this.badGuys) spots.push(badGuy.model.position);
    return spots;
  }

  // this moves the police, one part after the other
  update(now: number, seconds: number): void {
    this.redLight.visible = Math.sin(now * FLASH_SPEED) > 0;
    this.blueLight.visible = !this.redLight.visible;
    this.bubble.follow(this.officers[0].model, ABOVE_AN_OFFICER, seconds);
    if (this.part === "drivingIn") this.driveIn(seconds);
    else if (this.part === "walkingIn") this.walkIn(now, seconds);
    else if (this.part === "arresting") this.arrest(seconds);
    else if (this.part === "walkingOut") this.takeThemAway(now, seconds);
    else if (this.part === "drivingOff") this.driveOff(seconds);
  }

  // this drives the police car towards a spot, and says if it's there
  driveTo(spot: Vector3, seconds: number): boolean {
    const way = spot.clone().sub(this.car.position);
    const distance = way.length();
    if (distance < 0.05) return true;
    this.car.position.addScaledVector(way.normalize(), Math.min(distance, CAR_SPEED * seconds));
    return false;
  }

  // the police car drives up and parks in your front garden, and the police get out
  driveIn(seconds: number): void {
    if (!this.driveTo(CAR_PARKED, seconds)) return;
    for (let i = 0; i < this.officers.length; i++) {
      this.officers[i].model.position.copy(BY_THE_CAR[i]);
      this.officers[i].model.visible = true;
      this.stops[i] = [OUTSIDE_THE_DOOR, INSIDE_THE_DOOR, AT_THE_TRAPDOOR[i]];
    }
    this.part = "walkingIn";
  }

  // the police walk in the front door to the trapdoor, and find you. The bad guys have to climb up
  walkIn(now: number, seconds: number): void {
    let allThere = true;
    for (let i = 0; i < this.officers.length; i++) {
      if (!walkAlong(this.officers[i], this.stops[i], WALK_SPEED, now, seconds)) allThere = false;
    }
    if (!allThere) return;
    this.found = true;
    this.timeLeft = ARREST_SECONDS;
    this.bubble.say("Police! 👮 You're under arrest!");
    for (let i = 0; i < this.badGuys.length; i++) {
      this.badGuys[i].model.position.copy(CLIMBED_UP[i]);
      this.badGuys[i].model.visible = true;
      this.badGuys[i].faceTowards(this.officers[i].model.position);
      this.officers[i].faceTowards(this.badGuys[i].model.position);
    }
    this.part = "arresting";
  }

  // the police hold on to the bad guys for a moment, then take them out to the police car
  arrest(seconds: number): void {
    this.timeLeft = this.timeLeft - seconds;
    if (this.timeLeft > 0) return;
    for (let i = 0; i < this.officers.length; i++) this.stops[i] = [INSIDE_THE_DOOR, OUTSIDE_THE_DOOR, BY_THE_CAR[i]];
    this.part = "walkingOut";
  }

  // the police walk the bad guys out to the car, and they all get in
  takeThemAway(now: number, seconds: number): void {
    let allThere = true;
    for (let i = 0; i < this.officers.length; i++) {
      if (!walkAlong(this.officers[i], this.stops[i], WALK_SPEED, now, seconds)) allThere = false;
      stepTowards(this.badGuys[i], this.officers[i].model.position, WALK_SPEED, BEHIND, now, seconds);
    }
    if (!allThere) return;
    for (const person of [...this.officers, ...this.badGuys]) person.model.visible = false;
    this.car.rotation.y = Math.PI; // it turns round to drive away
    this.part = "drivingOff";
  }

  // the police car drives away with the bad guys in it
  driveOff(seconds: number): void {
    if (!this.driveTo(CAR_FROM, seconds)) return;
    this.car.visible = false;
    this.part = "waiting";
  }

  // this throws the speech bubble away when the game closes
  stop(): void {
    this.bubble.throwAway();
  }
}
