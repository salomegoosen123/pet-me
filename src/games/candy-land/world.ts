// world.ts – how big the candy world is, and where your family runs in it. Mia designed this game.
export const WORLD_WIDTH: number = 640;
export const WORLD_HEIGHT: number = 320;
export const GROUND_HEIGHT: number = 60;
const BACK_OF_THE_LINE: number = 60; // how far from the left the back of your line is
const SPACE_BETWEEN: number = 34; // how far apart you all run (close together, so you can all jump a rock at once)

// this says how far from the left one of your family runs: the first is at the back of the line
export function placeInLine(which: number): number {
  return BACK_OF_THE_LINE + which * SPACE_BETWEEN;
}
