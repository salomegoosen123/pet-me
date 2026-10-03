// settings.ts – Mia's knobs for Popcorn Land. Change a number, a colour or an emoji, save, and press Play.
// Mia designed this game.
export const GAME_NAME: string = "popcorn-land"; // the game's folder
export const TICK_MS: number = 30; // how often the game moves, in thousandths of a second
export const YOU: string = "👧"; // you!
export const YOU_SIZE: number = 40; // how big you are
export const WALK_SPEED: number = 5; // how fast you walk with the arrow keys
export const JUMP_SPEED: number = 14; // how hard you jump when you press space
export const GRAVITY: number = 0.8; // how fast you come back down (smaller is floatier)
export const CLOUDS: { across: number; high: number; wide: number }[] = [ // the clouds in the sky (copy a line to add one)
  { across: 120, high: 140, wide: 120 }, // across: how far from the left. high: how high up. wide: how wide
  { across: 340, high: 140, wide: 120 },
  { across: 220, high: 230, wide: 120 },
  { across: 470, high: 230, wide: 110 },
  { across: 50, high: 310, wide: 110 },
  { across: 380, high: 320, wide: 120 },
];
export const CLOUD_GAP: number = 85; // how far above each other the new clouds are, as you climb up forever
export const CLOUD_WIDE: number = 110; // how wide the new clouds are
export const BALLOON: string = "🎈"; // what floats up through the sky
export const BALLOON_SIZE: number = 36; // how big the balloons are
export const BALLOON_SPEED: number = 1.2; // how fast the balloons float up
export const BALLOON_SECONDS: number = 1.5; // how often a new balloon comes (it's a bit random)
export const WIN_AT: number = 10; // pop this many balloons to win
export const LIVES: number = 3; // how many times you can fall off the bottom before it's Game Over
export const SKY_COLOUR: string = "lightskyblue"; // the colour of the sky in Popcorn Land
export const CLOUD_COLOUR: string = "white"; // the colour of the clouds
