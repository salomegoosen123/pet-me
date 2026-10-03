// Toy.ts – a toy you throw for Saydee at the park. Mia designed this game.

// what the toy is doing
export type ToyState = "flying" | "lying" | "carried";

// a Toy flies across the park, lands on the grass, and Saydee carries it back
export class Toy {
  emoji: string;
  x: number; // where it is, from the left side (0) to the right side (100)
  landsAt: number; // where it will land
  state: ToyState;

  constructor(emoji: string, from: number, landsAt: number) {
    this.emoji = emoji;
    this.x = from;
    this.landsAt = landsAt;
    this.state = "flying";
  }

  // this makes it land on the grass
  land(): void {
    this.x = this.landsAt;
    this.state = "lying";
  }

  // this is Saydee picking it up in her mouth
  pickUp(): void {
    this.state = "carried";
  }

  // this moves it along with Saydee
  carryTo(spot: number): void {
    this.x = spot;
  }
}
