// settings.ts – Mia's knobs for Candy Land. Change a number, a colour or an emoji, save, and press Play.
// Mia designed this game.
export const GAME_NAME: string = "candy-land"; // the game's folder
export const TICK_MS: number = 30; // how often the game moves, in thousandths of a second
export const FAMILY: string[] = [ // you and your family, running in a line, from the back to the front
  "👨",
  "👩",
  "👦",
  "👧",
];
export const FAMILY_SIZE: number = 40; // how big you and your family are
export const JUMP_SPEED: number = 13; // how hard you all jump when you press space
export const GRAVITY: number = 0.7; // how fast you come back down (smaller is floatier)
export const ROCK: string = "🪨"; // what rolls towards you
export const ROCK_SIZE: number = 40; // how big the rocks are
export const ROCK_SPEED: number = 6; // how fast the rocks roll
export const ROCK_SECONDS: number = 2; // how often a new rock comes (it's a bit random)
export const SKY_COLOUR: string = "pink"; // the colour of the candy sky
export const GROUND_COLOUR: string = "hotpink"; // the colour of the candy ground
