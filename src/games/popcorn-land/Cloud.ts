// Cloud.ts – one cloud in the sky, that you can stand on and jump from. Mia designed this game.

// a Cloud is where it is, and how wide it is
export class Cloud {
  across: number; // how far from the left side its left end is
  top: number; // how high its top is, from the bottom of the sky (you stand on the top)
  width: number;

  constructor(across: number, top: number, width: number) {
    this.across = across;
    this.top = top;
    this.width = width;
  }

  // this says if a spot (how far from the left) is over this cloud, so you could stand on it
  isUnder(spot: number): boolean {
    return spot >= this.across && spot <= this.across + this.width;
  }
}
