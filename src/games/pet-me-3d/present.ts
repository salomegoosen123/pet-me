// present.ts – the present in your wardrobe, and the toy car inside it. Mia designed this game.
import { BoxGeometry, CylinderGeometry, Group, SphereGeometry } from "three";
import { makePart } from "./paint";
import { PRESENT_COLOUR, RIBBON_COLOUR, TOY_CAR_COLOUR } from "./settings";

const SIDEWAYS: number = Math.PI / 2; // turns a wheel to stand up on its edge

// this makes the present: a box wrapped in paper, with a ribbon round it and a bow on top
export function makePresent(): Group {
  const present = new Group();
  present.add(
    makePart(new BoxGeometry(0.3, 0.25, 0.3), PRESENT_COLOUR, 0, 0, 0),
    makePart(new BoxGeometry(0.32, 0.26, 0.05), RIBBON_COLOUR, 0, 0, 0),
    makePart(new BoxGeometry(0.05, 0.26, 0.32), RIBBON_COLOUR, 0, 0, 0),
    makePart(new SphereGeometry(0.06, 10, 8), RIBBON_COLOUR, -0.05, 0.15, 0),
    makePart(new SphereGeometry(0.06, 10, 8), RIBBON_COLOUR, 0.05, 0.15, 0),
  );
  present.visible = false; // it's hidden in the wardrobe
  return present;
}

// this makes the toy car that's inside the present: a red body, a little cabin on top, and four black wheels
export function makeToyCar(): Group {
  const car = new Group();
  car.add(
    makePart(new BoxGeometry(0.34, 0.08, 0.18), TOY_CAR_COLOUR, 0, 0.06, 0),
    makePart(new BoxGeometry(0.16, 0.07, 0.15), TOY_CAR_COLOUR, -0.02, 0.13, 0),
  );
  for (const x of [-0.11, 0.11]) {
    for (const z of [-0.09, 0.09]) {
      const wheel = makePart(new CylinderGeometry(0.04, 0.04, 0.03, 12), "black", x, 0.04, z);
      wheel.rotation.x = SIDEWAYS;
      car.add(wheel);
    }
  }
  car.visible = false; // it's inside the present
  return car;
}
