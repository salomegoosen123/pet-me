// WatchingRugby.ts – Dad watching rugby: he sits on the sofa, and the TV shows the match. Mia designed this game.
import { Vector3 } from "three";
import type { Hobby } from "./hobby";
import type { Chair } from "./kitchen";
import { SOFA_SEATS } from "./livingRoom";
import type { Person3D } from "./Person3D";

const DADS_SEAT: Chair = SOFA_SEATS[1]; // the end of the sofa nearer the front door
export const WATCHING_SPOT: Vector3 = DADS_SEAT.spot.clone().add(new Vector3(0.85, 0, 0)); // he walks here, then sits

// WatchingRugby sits Dad on the sofa while he watches, and gets him up again when he goes
export class WatchingRugby implements Hobby {
  spot: Vector3;
  watching: boolean; // is Dad watching the rugby right now

  constructor() {
    this.spot = WATCHING_SPOT;
    this.watching = false;
  }

  // this sits Dad down when he gets to the sofa, and stands him up when he leaves
  // (only from the sofa: if he's sitting at the dinner table, that's not the rugby's business)
  update(person: Person3D, doingIt: boolean): void {
    if (doingIt && !this.watching) person.sitDown(DADS_SEAT.spot, DADS_SEAT.facing);
    if (!doingIt && this.watching) {
      person.standUp();
      person.model.position.copy(WATCHING_SPOT);
    }
    this.watching = doingIt;
  }

  // watching rugby never sends Dad anywhere
  errand(): Vector3 | null {
    return null;
  }

  // Dad can get up whenever he likes
  keepsThemBusy(): boolean {
    return false;
  }
}
