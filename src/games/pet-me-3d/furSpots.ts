// furSpots.ts – the pink spots on Saydee's fur. Mia designed this game.
import { Mesh, SphereGeometry, Vector3 } from "three";
import { paint } from "./paint";
import { SPOT_COLOUR, SPOT_SIZE } from "./settings";

// one spot on her fur: the middle of the body part it sits on, how round that part is, and which way it points
interface Spot {
  centre: Vector3;
  roundness: number;
  pointing: Vector3;
}

// where her spots are: on her back, her sides, her head and her hip
const SPOTS: Spot[] = [
  { centre: new Vector3(0, 0.8, 0.1), roundness: 0.5, pointing: new Vector3(0, 1, 0) },
  { centre: new Vector3(0, 0.8, -0.3), roundness: 0.5, pointing: new Vector3(0.8, 0.6, 0) },
  { centre: new Vector3(0, 0.8, 0.3), roundness: 0.5, pointing: new Vector3(-0.7, 0.7, 0) },
  { centre: new Vector3(0, 0.8, -0.2), roundness: 0.5, pointing: new Vector3(-0.95, 0.3, 0) },
  { centre: new Vector3(0, 0.8, 0.25), roundness: 0.5, pointing: new Vector3(0.95, 0.3, 0) },
  { centre: new Vector3(0, 1.42, 0.85), roundness: 0.48, pointing: new Vector3(-0.4, 0.8, 0.2) },
  { centre: new Vector3(0.38, 0.65, -0.45), roundness: 0.32, pointing: new Vector3(0.7, 0.7, -0.2) },
];
const SPOT_FLAT: number = 0.3; // how flat a spot is, so it lies on her fur

// this makes one pink spot, lying flat on her fur
function makeSpot(spot: Spot): Mesh {
  const outwards = spot.pointing.clone().normalize();
  const where = spot.centre.clone().addScaledVector(outwards, spot.roundness * 0.97);
  const mark = new Mesh(new SphereGeometry(SPOT_SIZE, 16, 8), paint(SPOT_COLOUR));
  mark.scale.set(1, 1, SPOT_FLAT);
  mark.position.copy(where);
  mark.lookAt(where.clone().add(outwards));
  return mark;
}

// this makes all her spots
export function makeFurSpots(): Mesh[] {
  return SPOTS.map(makeSpot);
}
