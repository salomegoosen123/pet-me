// obstacles.ts – the things at home nobody can walk through: furniture, the doghouse and the tree. Mia designed this game.
import { TOILET_SPOT, SINK_SPOT } from "./bathroom";
import { BED_LENGTH, BED_WIDTH, BROTHER_BED_MIDDLE, LAMP_SPOT, WARDROBE_SPOT } from "./bedroom";
import { blockAround } from "./bumping";
import type { Block } from "./bumping";
import { GRANDPARENTS_BLOCKS } from "./grandparents";
import { BATH_SPOT, FOOD_BOWL_SPOT, WATER_BOWL_SPOT, YOUR_BED_MIDDLE } from "./homeSpots";
import { COUNTER_SPOT, FRIDGE_SPOT, TABLE_SPOT } from "./kitchen";
import { SOFA_DEPTH, SOFA_LENGTH, SOFA_SPOT, TV_SPOT } from "./livingRoom";
import { PARENTS_BED_LENGTH, PARENTS_BED_SPOT, PARENTS_BED_WIDTH, PARENTS_LAMP_SPOTS } from "./parentsRoom";
import { BALL_PIT_SIZE, BALL_PIT_SPOT, TENT_SIZE, TENT_SPOT, TOY_BOX_SPOT } from "./playRoom";
import { DOGHOUSE_SPOT, YARD_TREE_SPOT } from "./yard";

// the ball pit: nobody can walk through it, but your brother jumps in, so it has its own name
export const BALL_PIT_BLOCK: Block = blockAround(BALL_PIT_SPOT, BALL_PIT_SIZE, BALL_PIT_SIZE);

// things that stop both you and Saydee
export const BLOCKS_EVERYONE: Block[] = [
  blockAround(COUNTER_SPOT, 5, 0.7),
  blockAround(FRIDGE_SPOT, 1.1, 0.9),
  blockAround(TABLE_SPOT, 1.6, 1.1),
  blockAround(TOILET_SPOT, 0.9, 0.7),
  blockAround(SINK_SPOT, 0.7, 0.7),
  blockAround(YOUR_BED_MIDDLE, BED_WIDTH + 0.2, BED_LENGTH + 0.2),
  blockAround(BROTHER_BED_MIDDLE, BED_WIDTH + 0.2, BED_LENGTH + 0.2),
  blockAround(WARDROBE_SPOT, 1.4, 0.7),
  blockAround(LAMP_SPOT, 0.6, 0.6),
  blockAround(DOGHOUSE_SPOT, 1.5, 1.5),
  blockAround(SOFA_SPOT, SOFA_DEPTH, SOFA_LENGTH),
  blockAround(TV_SPOT, 0.5, 1.9),
  blockAround(PARENTS_BED_SPOT, PARENTS_BED_WIDTH + 0.2, PARENTS_BED_LENGTH + 0.2),
  blockAround(PARENTS_LAMP_SPOTS[0], 0.6, 0.6),
  blockAround(PARENTS_LAMP_SPOTS[1], 0.6, 0.6),
  blockAround(TOY_BOX_SPOT, 1.2, 0.7),
  BALL_PIT_BLOCK,
  blockAround(TENT_SPOT, TENT_SIZE * 2, TENT_SIZE * 2),
  blockAround(YARD_TREE_SPOT, 0.5, 0.5),
  ...GRANDPARENTS_BLOCKS,
];

// things that only stop you: Saydee gets into her bath, and puts her nose in her bowls
export const BLOCKS_ONLY_YOU: Block[] = [
  blockAround(BATH_SPOT, 2.2, 1.1),
  blockAround(FOOD_BOWL_SPOT, 1.1, 1.1),
  blockAround(WATER_BOWL_SPOT, 1.1, 1.1),
];
