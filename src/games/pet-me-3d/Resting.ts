// Resting.ts – sitting on a chair or the sofa, or lying in bed, in the 3D home. Mia designed this game.
import { LYING_SPOT, onBigBed } from "./bedroom";
import type { Person3D } from "./Person3D";
import { nearestSeat, seatUnder } from "./seats";

// Resting sits you down or lies you down when you walk up to a seat or your bed
export class Resting {
  wasOnSeat: boolean; // were you at a seat a moment ago
  wasOnBed: boolean; // were you at your bed a moment ago

  constructor() {
    this.wasOnSeat = false;
    this.wasOnBed = false;
  }

  // this sits you down or lies you in bed when you walk up to one (but not again until you walk off)
  checkWhereYouAre(you: Person3D): void {
    if (you.isDown()) return;
    const seat = seatUnder(you.model.position);
    if (seat != null && !this.wasOnSeat) you.sitDown(seat.spot, seat.facing, seat.seatTop);
    this.wasOnSeat = seat != null;
    const onBed = onBigBed(you.model.position);
    if (onBed && !this.wasOnBed) you.lieDown(LYING_SPOT);
    this.wasOnBed = onBed;
  }

  // this takes you straight to your big bed and lies you down
  goToBed(you: Person3D): void {
    you.lieDown(LYING_SPOT);
    this.wasOnBed = true;
  }

  // this remembers you're already on a seat (like at dinner), so getting up doesn't sit you straight back down
  alreadySitting(): void {
    this.wasOnSeat = true;
  }

  // this takes you straight to the closest seat and sits you down
  sitAtNearestSeat(you: Person3D): void {
    const seat = nearestSeat(you.model.position);
    you.sitDown(seat.spot, seat.facing, seat.seatTop);
    this.wasOnSeat = true;
  }
}
