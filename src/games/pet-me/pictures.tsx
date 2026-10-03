// pictures.tsx – the bars and the places, drawn on the screen. Mia designed this game.
import type { CSSProperties, ReactNode } from "react";
import type { Place } from "./Game";
import {
  FULL_COLOUR, GRASS_COLOUR, LOW_AT, LOW_COLOUR, PARK_THINGS, PET_EMOJI,
  POOL_COLOUR, POOL_THINGS, SHADOW_SIZE, SKY_COLOUR, TICK_MS,
} from "./settings";

// the shadow under Saydee, so she looks 3D
const PET_SHADOW: string = "drop-shadow(0 " + SHADOW_SIZE + "px 6px rgba(0, 0, 0, 0.35))";

const BAR_STYLE: CSSProperties = {
  width: 320, height: 36, margin: "0 auto", background: "white",
  border: "4px solid #22335B", borderRadius: 20, overflow: "hidden",
  boxShadow: "inset 0 6px 8px rgba(0, 0, 0, 0.25), 0 5px 0 #22335B", // this makes the bar look deep
};
const HOME_STYLE: CSSProperties = { fontSize: "9rem", filter: PET_SHADOW };
const PLACE_STYLE: CSSProperties = {
  position: "relative", height: 280, maxWidth: 700, margin: "0 auto 16px",
  borderRadius: 24, overflow: "hidden",
};
const THINGS_STYLE: CSSProperties = {
  position: "absolute", left: 0, right: 0, top: 90,
  display: "flex", justifyContent: "space-around", fontSize: "4rem",
};

// this picks the bar colour: green when full, red when low
function barColour(value: number): string {
  return value > LOW_AT ? FULL_COLOUR : LOW_COLOUR;
}

// this draws one bar: its name, its number, and how full it is
export function showBar(label: string, value: number, full: number): ReactNode {
  const rounded = Math.round(value);
  const fillStyle: CSSProperties = {
    height: "100%",
    width: (rounded / full) * 100 + "%",
    background: barColour(rounded),
    transition: "width 0.4s",
    boxShadow: "inset 0 -8px 0 rgba(0, 0, 0, 0.15), inset 0 6px 0 rgba(255, 255, 255, 0.4)", // a shiny top
  };
  return (
    <div>
      <p>{label} {rounded}</p>
      <div style={BAR_STYLE}>
        <div style={fillStyle}></div>
      </div>
    </div>
  );
}

// this draws one thing in a place, like a tree or a duck
function showThing(thing: string, position: number): ReactNode {
  return <span key={position}>{thing}</span>;
}

// this draws a place: the sky, the grass or water, its things, and Saydee moving about
function showPlace(petX: number, groundColour: string, things: string[]): ReactNode {
  const placeStyle: CSSProperties = {
    ...PLACE_STYLE,
    background: "linear-gradient(" + SKY_COLOUR + " 55%, " + groundColour + " 55%)",
  };
  const petStyle: CSSProperties = {
    position: "absolute", bottom: 10, left: petX + "%", fontSize: "6rem",
    transition: "left " + TICK_MS + "ms linear", filter: PET_SHADOW,
  };
  return (
    <div style={placeStyle}>
      <div style={THINGS_STYLE}>{things.map(showThing)}</div>
      <div style={petStyle}>{PET_EMOJI}</div>
    </div>
  );
}

// this draws wherever Saydee is: at home, at the park or in the pool
export function showWhereSheIs(place: Place, petX: number): ReactNode {
  if (place === "park") return showPlace(petX, GRASS_COLOUR, PARK_THINGS);
  if (place === "pool") return showPlace(petX, POOL_COLOUR, POOL_THINGS);
  return <div style={HOME_STYLE}>{PET_EMOJI}</div>;
}
