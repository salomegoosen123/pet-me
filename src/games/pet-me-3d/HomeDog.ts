// HomeDog.ts – how Saydee moves about the house: to her bowls, the bath, after you, and back to her bed. Mia designed this game.
import { Vector3 } from "three";
import { bumpOff, bumpOffBlocks, bumpOffWalls } from "./bumping";
import { BLOCKS_EVERYONE } from "./obstacles";
import type { Dog3D } from "./Dog3D";
import { BED_SPOT, ERRAND_LOOK_AT, ERRAND_SPOTS, ON_FLOOR, ROOM_WALL, YOUR_BED_MIDDLE } from "./homeSpots";
import { PERSON_SIZE } from "./Person3D";
import type { Person3D } from "./Person3D";
import type { Pet } from "./Pet";
import { PLAYROOM_DOOR_Z } from "./playRoom";
import { besideThePool, inThePool, POOL_BLOCK } from "./pool";
import { roomOf, routeBetween } from "./routes";
import type { Room } from "./routes";
import { spotBehind } from "./walking";
import { HOME_WALLS } from "./walls";

const DOG_SPEED: number = 2.5; // how fast she walks, in 3D steps every second
const WAIT_BY_THE_PLAYROOM: Vector3 = new Vector3(-ROOM_WALL + 1.5, ON_FLOOR, PLAYROOM_DOOR_Z); // in your bedroom, by the play room door

// HomeDog remembers where Saydee is heading and the doors she has to go through to get there
export class HomeDog {
  goal: Vector3 | null; // where she is heading (or null while she follows you)
  stops: Vector3[]; // the doors on the way, then the goal
  yourRoom: Room | null; // the room you were in, while she follows you

  constructor() {
    this.goal = null;
    this.stops = [];
    this.yourRoom = null;
  }

  // this makes Saydee do what the game says: go to a bowl or the bath, follow you, or go back to her bed
  move(dog: Dog3D, you: Person3D, pet: Pet, following: boolean, now: number, seconds: number): void {
    if (pet.doing === "resting" && following) {
      this.followYou(dog, spotBehind(you, dog), seconds);
      dog.wag(now);
      dog.hop(now);
      this.bump(dog, you);
      return;
    }
    const goingThere = pet.doing === "walkingThere" || pet.doing === "busy";
    const arrived = this.walkTo(dog, goingThere ? ERRAND_SPOTS[pet.errand] : BED_SPOT, seconds);
    if (!(pet.doing === "busy" && pet.errand === "sleep")) dog.wag(now);
    const eatingOrDrinking = pet.errand === "food" || pet.errand === "water";
    if (!arrived) dog.hop(now);
    else if (pet.doing === "busy" && eatingOrDrinking) dog.nom(now);
    else if (pet.doing === "busy" && pet.errand === "sleep") dog.snooze(now);
    else dog.keepStill();
    if (arrived && pet.doing === "busy") dog.faceTowards(ERRAND_LOOK_AT[pet.errand]);
    if (arrived && pet.doing === "resting") dog.faceTowards(YOUR_BED_MIDDLE); // on her bed, she looks at yours
    if (!arrived) this.bump(dog, you);
  }

  // this stops her going through walls, furniture, you, or into the pool
  bump(dog: Dog3D, you: Person3D): void {
    bumpOffWalls(dog.model.position, dog.bumpSize(), HOME_WALLS);
    bumpOffBlocks(dog.model.position, dog.bumpSize(), BLOCKS_EVERYONE);
    bumpOffBlocks(dog.model.position, dog.bumpSize(), [POOL_BLOCK]);
    bumpOff(dog.model.position, dog.bumpSize(), you.model.position, PERSON_SIZE);
  }

  // this walks her after you: she only works out the doors again when you go into a different room,
  // so she doesn't turn back halfway through a doorway. She isn't allowed in the play room, so she waits outside,
  // and she waits at the edge of the pool while you swim
  followYou(dog: Dog3D, behindYou: Vector3, seconds: number): void {
    const yourRoom = roomOf(behindYou);
    let target = behindYou;
    if (yourRoom === "playroom") target = WAIT_BY_THE_PLAYROOM;
    else if (inThePool(behindYou)) target = besideThePool(behindYou).setY(ON_FLOOR);
    if (this.goal != null || this.yourRoom !== yourRoom || this.stops.length === 0) {
      this.goal = null;
      this.yourRoom = yourRoom;
      this.stops = routeBetween(dog.model.position, target);
    }
    this.stops[this.stops.length - 1] = target;
    this.walkAlongStops(dog, seconds);
  }

  // this makes her work out her way again, like after she comes out of the bad guys' tunnel
  forgetTheWay(): void {
    this.goal = null;
    this.stops = [];
  }

  // this walks her along the stops to a goal (or runs her, if you give a faster speed),
  // working out new stops when the goal changes, and says if she's there
  walkTo(dog: Dog3D, goal: Vector3, seconds: number, speed: number = DOG_SPEED): boolean {
    if (this.goal !== goal) {
      this.goal = goal;
      this.yourRoom = null;
      this.stops = routeBetween(dog.model.position, goal);
    }
    return this.walkAlongStops(dog, seconds, speed);
  }

  // this walks her to the next stop, and on to the one after when she gets there, and says if she's at the end
  walkAlongStops(dog: Dog3D, seconds: number, speed: number = DOG_SPEED): boolean {
    while (this.stops.length > 1 && dog.walkTowards(this.stops[0], speed, seconds)) this.stops.shift();
    return dog.walkTowards(this.stops[0], speed, seconds);
  }
}
