// settings.ts – the knobs for Pet Me. Mia designed this game.
// Change a number, save, then press Play to see what happens!

export const GAME_NAME: string = "pet-me"; // the name of this game's folder
export const TICK_MS: number = 1000; // how often the game moves, in thousandths of a second
export const PET_NAME: string = "Saydee"; // your dog's name
export const PET_EMOJI: string = "🐶"; // what your dog looks like
export const SHADOW_SIZE: number = 20; // how far down the shadow under Saydee falls
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
