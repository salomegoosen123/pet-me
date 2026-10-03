// routes.ts – the way Saydee walks from room to room, through the doors and not through the walls. Mia designed this game.
import { Vector3 } from "three";
import { ON_FLOOR, ROOM_WALL } from "./homeSpots";
import { BACK, BACK_DOOR_X } from "./house";
import { PARENTS_DOOR_X } from "./parentsRoom";
import { PLAYROOM_DOOR_Z } from "./playRoom";

// the rooms in the house: the middle room, the three rooms off it, the yard out the back of your bedroom,
// your parents' room behind the kitchen, and the play room next to your bedroom
export type Room = "middle" | "kitchen" | "bathroom" | "bedroom" | "yard" | "parents" | "playroom";
type SideRoom = "kitchen" | "bathroom" | "bedroom";

const STEP_THROUGH: number = 0.8; // how far past each door she aims, so she walks right through it

// each door: a spot just inside the room, and a spot just outside it in the middle room
const INSIDE_DOOR: Record<SideRoom, Vector3> = {
  kitchen: new Vector3(ROOM_WALL + STEP_THROUGH, ON_FLOOR, 0),
  bathroom: new Vector3(-ROOM_WALL - STEP_THROUGH, ON_FLOOR, 0),
  bedroom: new Vector3(0, ON_FLOOR, -ROOM_WALL - STEP_THROUGH),
};
const OUTSIDE_DOOR: Record<SideRoom, Vector3> = {
  kitchen: new Vector3(ROOM_WALL - STEP_THROUGH, ON_FLOOR, 0),
  bathroom: new Vector3(-ROOM_WALL + STEP_THROUGH, ON_FLOOR, 0),
  bedroom: new Vector3(0, ON_FLOOR, -ROOM_WALL + STEP_THROUGH),
};

// the back door: a spot on the yard side, and a spot on the bedroom side
const YARD_SIDE: Vector3 = new Vector3(BACK_DOOR_X, ON_FLOOR, BACK - STEP_THROUGH);
const BEDROOM_SIDE: Vector3 = new Vector3(BACK_DOOR_X, ON_FLOOR, BACK + STEP_THROUGH);

// your parents' door: a spot on their side, and a spot on the kitchen side
const PARENTS_SIDE: Vector3 = new Vector3(PARENTS_DOOR_X, ON_FLOOR, -ROOM_WALL - STEP_THROUGH);
const KITCHEN_SIDE: Vector3 = new Vector3(PARENTS_DOOR_X, ON_FLOOR, -ROOM_WALL + STEP_THROUGH);

// the play room door: a spot on the play room side, and a spot on your bedroom side
const PLAYROOM_SIDE: Vector3 = new Vector3(-ROOM_WALL - STEP_THROUGH, ON_FLOOR, PLAYROOM_DOOR_Z);
const BY_YOUR_BED: Vector3 = new Vector3(-ROOM_WALL + STEP_THROUGH, ON_FLOOR, PLAYROOM_DOOR_Z);

// this says if a room is one of the three rooms with a door to the middle room
function offTheMiddle(room: Room): room is SideRoom {
  return room === "kitchen" || room === "bathroom" || room === "bedroom";
}

// this says which room a spot is in
export function roomOf(spot: Vector3): Room {
  if (spot.z < BACK) return "yard";
  if (spot.x > ROOM_WALL && spot.z < -ROOM_WALL) return "parents";
  if (spot.x < -ROOM_WALL && spot.z < -ROOM_WALL) return "playroom";
  if (spot.x > ROOM_WALL) return "kitchen";
  if (spot.x < -ROOM_WALL) return "bathroom";
  if (spot.z < -ROOM_WALL) return "bedroom";
  return "middle";
}

// this works out the stops on the way from one spot to another: out of one door, in through the next
export function routeBetween(from: Vector3, to: Vector3): Vector3[] {
  const fromRoom = roomOf(from);
  const toRoom = roomOf(to);
  if (fromRoom === "yard" && toRoom !== "yard") return [YARD_SIDE, BEDROOM_SIDE, ...routeBetween(BEDROOM_SIDE, to)];
  if (toRoom === "yard" && fromRoom !== "yard") return [...routeBetween(from, BEDROOM_SIDE), YARD_SIDE, to];
  if (fromRoom === "parents" && toRoom !== "parents") return [PARENTS_SIDE, KITCHEN_SIDE, ...routeBetween(KITCHEN_SIDE, to)];
  if (toRoom === "parents" && fromRoom !== "parents") return [...routeBetween(from, KITCHEN_SIDE), PARENTS_SIDE, to];
  if (fromRoom === "playroom" && toRoom !== "playroom") return [PLAYROOM_SIDE, BY_YOUR_BED, ...routeBetween(BY_YOUR_BED, to)];
  if (toRoom === "playroom" && fromRoom !== "playroom") return [...routeBetween(from, BY_YOUR_BED), PLAYROOM_SIDE, to];
  const stops: Vector3[] = [];
  if (fromRoom !== toRoom) {
    if (offTheMiddle(fromRoom)) stops.push(INSIDE_DOOR[fromRoom], OUTSIDE_DOOR[fromRoom]);
    if (offTheMiddle(toRoom)) stops.push(OUTSIDE_DOOR[toRoom], INSIDE_DOOR[toRoom]);
  }
  stops.push(to);
  return stops;
}
