// settings.ts – the knobs for Pet Me level 2. Mia designed this game.
// Change a number, save, then press Play to see what happens!

export const GAME_NAME: string = "pet-me-level-2"; // the name of this game's folder
export const TICK_MS: number = 1000; // how often the game moves, in thousandths of a second
export const PET_NAME: string = "Saydee"; // your dog's name
export const PET_EMOJI: string = "🐶"; // what your dog looks like
export const SHADOW_SIZE: number = 20; // how far down the shadow under Saydee falls
export const BED_COLOUR: string = "mediumorchid"; // the colour of Saydee's bed at home
export const SLEEP_TEXT: string = "Zzzzzzz"; // what floats above her head on her bed
export const PUPPY_SIZE: number = 40; // how big she is as a tiny puppy (100 is all grown up)
export const GROW_SPEED: number = 10; // how much she grows every minute when all her bars are green
export const GROWN_UP: number = 100; // how much growing she needs to be all grown up
export const HUNGER_START: number = 100; // how full her tummy is at the start
export const HUNGER_DROP: number = 30; // how much hunger goes down every minute
export const FEED_AMOUNT: number = 20; // how much one Feed fills her tummy
export const WATER_START: number = 100; // how much water she has at the start
export const WATER_DROP: number = 30; // how much water goes down every minute
export const DRINK_AMOUNT: number = 20; // how much one Water fills her up
export const SLEEP_START: number = 100; // how rested she is at the start
export const SLEEP_DROP: number = 15; // how much sleep goes down every minute
export const SLEEP_AMOUNT: number = 30; // how much one Sleep rests her
export const HAPPY_START: number = 100; // how happy she is at the start
export const HAPPY_DROP: number = 15; // how much happiness goes down every minute
export const HUNGRY_SADNESS: number = 30; // extra sadness every minute when she is hungry
export const PET_AMOUNT: number = 15; // how much one Pet makes her happier
export const LOW_AT: number = 30; // below this, a bar turns red
export const FULL_COLOUR: string = "limegreen"; // the bar colour when it is full
export const LOW_COLOUR: string = "tomato"; // the bar colour when it is low
export const RUN_SPEED: number = 15; // how far Saydee runs every second in the park
export const PARK_HUNGER_DROP: number = 90; // how much hunger goes down every minute at the park
export const PARK_WATER_DROP: number = 90; // how much water goes down every minute at the park
export const PARK_JOY: number = 30; // how much happiness goes up every minute at the park
export const SWIM_SPEED: number = 10; // how far Saydee swims every second in the pool
export const POOL_COLOUR: string = "dodgerblue"; // the colour of the water in the pool
export const SKY_COLOUR: string = "lightskyblue"; // the colour of the sky in the park
export const GRASS_COLOUR: string = "yellowgreen"; // the colour of the grass in the park
export const YOU_EMOJI: string = "👱‍♀️"; // you, standing in the park
export const FETCH_SPEED: number = 25; // how fast Saydee runs to fetch a toy
export const FETCH_JOY: number = 20; // how much happier she gets when she catches a toy
export const TOY_LANDS_NEAR: number = 40; // the nearest a toy can land
export const TOY_LANDS_FAR: number = 85; // the farthest a toy can land

// the toys you can throw at the park. Copy a line to add one more!
export const TOYS: string[] = [
  "🎾",
  "🥏",
];

// the trees and flowers in the park. Copy a line to add one more!
export const PARK_THINGS: string[] = [
  "🌳",
  "🌷",
  "🌳",
  "🌼",
  "🌳",
];

// the things floating in the pool. Copy a line to add one more!
export const POOL_THINGS: string[] = [
  "🦆",
  "🛟",
  "🦆",
];
