// bathroom.ts – the bathroom in Saydee's 3D home: tiles, a wall with a door, a toilet and a sink. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, TorusGeometry } from "three";
import type { Vector3 } from "three";
import { makeTiles, makeWallWithDoor } from "./furniture";
import { ROOM_WALL, spreadSpot } from "./homeSpots";
import { makePart } from "./paint";
import { BATH_FLOOR_COLOUR, BATH_WALL_COLOUR, TOILET_COLOUR } from "./settings";

const FLAT: number = -Math.PI / 2;
export const TOILET_SPOT: Vector3 = spreadSpot(-9.2, 2.6);
export const SINK_SPOT: Vector3 = spreadSpot(-6, 3.6);

// this makes the toilet: a bowl, a seat and a tank behind
function makeToilet(): Group {
  const toilet = new Group();
  const seat = makePart(new TorusGeometry(0.26, 0.05, 10, 24), TOILET_COLOUR, 0, 0.47, 0);
  seat.rotation.x = FLAT;
  toilet.add(
    makePart(new CylinderGeometry(0.3, 0.22, 0.45, 20), TOILET_COLOUR, 0, 0.23, 0),
    seat,
    makePart(new BoxGeometry(0.25, 0.6, 0.6), TOILET_COLOUR, -0.35, 0.7, 0),
  );
  toilet.position.copy(TOILET_SPOT);
  return toilet;
}

// this makes the sink: a stand, a basin and a shiny tap
function makeSink(): Group {
  const sink = new Group();
  sink.add(
    makePart(new CylinderGeometry(0.1, 0.14, 0.8, 16), TOILET_COLOUR, 0, 0.4, 0),
    makePart(new CylinderGeometry(0.35, 0.25, 0.2, 24), TOILET_COLOUR, 0, 0.9, 0),
    makePart(new CylinderGeometry(0.03, 0.03, 0.2, 8), "silver", 0, 1.05, 0.25),
  );
  sink.position.copy(SINK_SPOT);
  return sink;
}

// this makes the whole bathroom (the bath itself is Bath3D, because it has bubbles)
export function makeBathroom(): Group {
  const bathroom = new Group();
  bathroom.add(makeTiles(-ROOM_WALL, -1, BATH_FLOOR_COLOUR), ...makeWallWithDoor(-ROOM_WALL, BATH_WALL_COLOUR));
  bathroom.add(makeToilet(), makeSink());
  return bathroom;
}
