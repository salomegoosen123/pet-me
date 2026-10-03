// livingRoom.ts – the living room by the front door: a soft rug and a sofa that faces the TV. Mia designed this game.
import { BoxGeometry, Group, Mesh, PlaneGeometry, Vector3 } from "three";
import { spreadSpot } from "./homeSpots";
import type { Chair } from "./kitchen";
import { makePart, paint } from "./paint";
import { RUG_COLOUR, SOFA_COLOUR } from "./settings";

const FLAT: number = -Math.PI / 2;
const FACING_THE_TV: number = Math.PI / 2; // the sofa faces across the room, towards the TV
export const SOFA_SPOT: Vector3 = spreadSpot(-3, 3); // on the left as you come in the front door
export const TV_SPOT: Vector3 = spreadSpot(3.7, 3); // on the right, facing the sofa
export const SOFA_DEPTH: number = 1;
export const SOFA_LENGTH: number = 2.4;
const SEAT_HEIGHT: number = 0.45;

// the two places to sit on the sofa
export const SOFA_SEATS: Chair[] = [
  { spot: SOFA_SPOT.clone().add(new Vector3(0.1, 0, -0.55)), facing: FACING_THE_TV },
  { spot: SOFA_SPOT.clone().add(new Vector3(0.1, 0, 0.55)), facing: FACING_THE_TV },
];

// this makes the rug in the middle of the living room
function makeRug(): Mesh {
  const rug = new Mesh(new PlaneGeometry(7, 3.4), paint(RUG_COLOUR));
  rug.rotation.x = FLAT;
  rug.position.copy(SOFA_SPOT).setX((SOFA_SPOT.x + TV_SPOT.x) / 2).setY(0.006);
  rug.receiveShadow = true;
  return rug;
}

// this makes the sofa: a seat, a back and two arms
function makeSofa(): Group {
  const sofa = new Group();
  sofa.add(
    makePart(new BoxGeometry(SOFA_DEPTH, SEAT_HEIGHT, SOFA_LENGTH), SOFA_COLOUR, 0, SEAT_HEIGHT / 2, 0),
    makePart(new BoxGeometry(0.25, 0.9, SOFA_LENGTH), SOFA_COLOUR, -SOFA_DEPTH / 2 + 0.12, 0.45, 0),
    makePart(new BoxGeometry(SOFA_DEPTH, 0.65, 0.2), SOFA_COLOUR, 0, 0.33, -SOFA_LENGTH / 2),
    makePart(new BoxGeometry(SOFA_DEPTH, 0.65, 0.2), SOFA_COLOUR, 0, 0.33, SOFA_LENGTH / 2),
  );
  sofa.position.copy(SOFA_SPOT);
  return sofa;
}

// this makes the living room (the TV is TV3D, because it plays cartoons)
export function makeLivingRoom(): Group {
  const livingRoom = new Group();
  livingRoom.add(makeRug(), makeSofa());
  return livingRoom;
}
