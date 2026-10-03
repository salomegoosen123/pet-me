// bumping.ts – stops Saydee walking through walls, people and other dogs: she bumps into them instead. Mia designed this game.
import type { Vector3 } from "three";
import type { Wall } from "./walls";

const WALL_THICKNESS: number = 0.1; // half a wall's thickness

// this finds how far a spot is from a wall, and the closest point on the wall
function closestOnWall(x: number, z: number, wall: Wall): { x: number; z: number } {
  const alongX = wall.toX - wall.fromX;
  const alongZ = wall.toZ - wall.fromZ;
  const lengthSquared = alongX * alongX + alongZ * alongZ;
  const part = lengthSquared === 0 ? 0 : ((x - wall.fromX) * alongX + (z - wall.fromZ) * alongZ) / lengthSquared;
  const clamped = Math.min(1, Math.max(0, part));
  return { x: wall.fromX + alongX * clamped, z: wall.fromZ + alongZ * clamped };
}

// this pushes a spot back out of any wall it has walked into
export function bumpOffWalls(spot: Vector3, size: number, walls: Wall[]): void {
  const room = size + WALL_THICKNESS;
  for (const wall of walls) {
    const closest = closestOnWall(spot.x, spot.z, wall);
    const awayX = spot.x - closest.x;
    const awayZ = spot.z - closest.z;
    const distance = Math.hypot(awayX, awayZ);
    if (distance >= room || distance === 0) continue;
    spot.x = closest.x + (awayX / distance) * room;
    spot.z = closest.z + (awayZ / distance) * room;
  }
}

// a block on the floor that nobody can walk through, like the table or the fridge
export interface Block {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// this makes a block around a spot, as wide and as deep as the thing standing there
export function blockAround(middle: Vector3, width: number, depth: number): Block {
  return {
    minX: middle.x - width / 2, maxX: middle.x + width / 2,
    minZ: middle.z - depth / 2, maxZ: middle.z + depth / 2,
  };
}

// this says if a spot is inside a block
export function insideBlock(spot: Vector3, block: Block): boolean {
  return spot.x > block.minX && spot.x < block.maxX && spot.z > block.minZ && spot.z < block.maxZ;
}

// this pushes a spot back out of any block it has walked into
export function bumpOffBlocks(spot: Vector3, size: number, blocks: Block[]): void {
  for (const block of blocks) {
    const closestX = Math.min(block.maxX, Math.max(block.minX, spot.x));
    const closestZ = Math.min(block.maxZ, Math.max(block.minZ, spot.z));
    const awayX = spot.x - closestX;
    const awayZ = spot.z - closestZ;
    const distance = Math.hypot(awayX, awayZ);
    if (distance >= size) continue;
    if (distance > 0) {
      spot.x = closestX + (awayX / distance) * size;
      spot.z = closestZ + (awayZ / distance) * size;
      continue;
    }
    pushOutOfTheMiddle(spot, size, block);
  }
}

// this pushes a spot that is right inside a block out through the nearest side
function pushOutOfTheMiddle(spot: Vector3, size: number, block: Block): void {
  const toLeft = spot.x - block.minX;
  const toRight = block.maxX - spot.x;
  const toBack = spot.z - block.minZ;
  const toFront = block.maxZ - spot.z;
  const nearest = Math.min(toLeft, toRight, toBack, toFront);
  if (nearest === toLeft) spot.x = block.minX - size;
  else if (nearest === toRight) spot.x = block.maxX + size;
  else if (nearest === toBack) spot.z = block.minZ - size;
  else spot.z = block.maxZ + size;
}

// this pushes a spot away from someone or something it has walked into
export function bumpOff(spot: Vector3, size: number, other: Vector3, otherSize: number): void {
  const awayX = spot.x - other.x;
  const awayZ = spot.z - other.z;
  const distance = Math.hypot(awayX, awayZ);
  const room = size + otherSize;
  if (distance >= room || distance === 0) return;
  spot.x = other.x + (awayX / distance) * room;
  spot.z = other.z + (awayZ / distance) * room;
}
