// homeSpots.ts – where everything is in Saydee's 3D home, and how big the house is. Mia designed this game.
import { Vector3 } from "three";
import type { Errand } from "./Pet";
import { HOUSE_SIZE, PUPPY_SIZE } from "./settings";

// this spreads a distance out to fit the house size, so a bigger house has bigger rooms
export function spread(distance: number): number {
  return distance * HOUSE_SIZE;
}

// this makes a spot on the floor, spread out to fit the house size
export function spreadSpot(x: number, z: number): Vector3 {
  return new Vector3(spread(x), 0, spread(z));
}

export const BED_TOP: number = 0.3; // how high the top of her bed is
const STOP_SHORT: number = 0.9; // she stops this far from a bowl, so her face is over it
const BATH_BOTTOM: number = 0.15; // how high the inside bottom of the bath is
const HER_BOTTOM: number = BED_TOP * PUPPY_SIZE; // how far her tummy is above her feet

export const ROOM_WALL: number = spread(4); // the kitchen, bathroom and bedroom walls are this far from the middle
export const DOOR_HALF: number = 1; // every door is this wide on each side of its middle
const KITCHEN_SIDE_WALL: number = spread(10); // the outside wall on the kitchen side of the house
const FRONT_WALL: number = spread(5); // the front wall of the house
export const FOOD_BOWL_SPOT: Vector3 = new Vector3(KITCHEN_SIDE_WALL - 0.7, 0, FRONT_WALL - 2.1); // in the kitchen corner, behind the table
export const WATER_BOWL_SPOT: Vector3 = new Vector3(KITCHEN_SIDE_WALL - 0.7, 0, FRONT_WALL - 0.9); // right next to it, in the corner
export const BATH_SPOT: Vector3 = spreadSpot(-7.2, -0.9); // in the bathroom
export const YOUR_BED_MIDDLE: Vector3 = spreadSpot(0, -8); // your big bed, in your bedroom
export const DOG_BED_MIDDLE: Vector3 = YOUR_BED_MIDDLE.clone().add(new Vector3(2.7, 0, 2.6)); // her bed, by yours
export const DOG_BED_SIZE: number = 0.7; // her bed is a bit smaller, so it fits in your room

export const TRAPDOOR: Vector3 = new Vector3(0, 0, -1.5); // the bad guys' secret trapdoor, in the middle room floor

// where she lies on her bed, and how low she stands on the floor
export const BED_SPOT: Vector3 = DOG_BED_MIDDLE.clone().setY(BED_TOP - HER_BOTTOM);
export const ON_FLOOR: number = -HER_BOTTOM;

// where she goes for each errand: just to the left of a bowl, sitting in the bath, or on her bed
export const ERRAND_SPOTS: Record<Errand, Vector3> = {
  food: FOOD_BOWL_SPOT.clone().add(new Vector3(-STOP_SHORT, 0, 0)).setY(ON_FLOOR),
  water: WATER_BOWL_SPOT.clone().add(new Vector3(-STOP_SHORT, 0, 0)).setY(ON_FLOOR),
  bath: BATH_SPOT.clone().setY(BATH_BOTTOM - HER_BOTTOM),
  sleep: BED_SPOT,
};

// what she looks at while she's busy: her bowl, straight ahead in the bath, or your bed when she sleeps
export const ERRAND_LOOK_AT: Record<Errand, Vector3> = {
  food: FOOD_BOWL_SPOT,
  water: WATER_BOWL_SPOT,
  bath: BATH_SPOT.clone().add(new Vector3(-2, 0, 0)),
  sleep: YOUR_BED_MIDDLE,
};
