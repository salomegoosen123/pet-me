// pictures.tsx – the bars, the places and the toy, drawn on the screen. Mia designed this game.
import type { CSSProperties, ReactNode } from "react";
import type { Game } from "./Game";
import type { Toy, ToyState } from "./Toy";
import {
  BED_COLOUR, FULL_COLOUR, GRASS_COLOUR, LOW_AT, LOW_COLOUR, PARK_THINGS, PET_EMOJI,
  POOL_COLOUR, POOL_THINGS, SHADOW_SIZE, SKY_COLOUR, SLEEP_TEXT, TICK_MS, YOU_EMOJI,
} from "./settings";

// the shadow under Saydee, so she looks 3D
const PET_SHADOW: string = "drop-shadow(0 " + SHADOW_SIZE + "px 6px rgba(0, 0, 0, 0.35))";

const BAR_STYLE: CSSProperties = {
  width: 320, height: 36, margin: "0 auto", background: "white",
  border: "4px solid #22335B", borderRadius: 20, overflow: "hidden",
  boxShadow: "inset 0 6px 8px rgba(0, 0, 0, 0.25), 0 5px 0 #22335B", // this makes the bar look deep
};
const HOME_STYLE: CSSProperties = { position: "relative", height: 200, maxWidth: 400, margin: "0 auto" };
const BED_STYLE: CSSProperties = {
  position: "absolute", left: "50%", bottom: 0, width: 260, height: 80,
  transform: "translateX(-50%)", borderRadius: "50%", background: BED_COLOUR,
  boxShadow: "inset 0 -14px 0 rgba(0, 0, 0, 0.2), 0 12px 10px rgba(0, 0, 0, 0.25)", // a soft, round cushion
};
const ON_BED_STYLE: CSSProperties = {
  position: "absolute", left: "50%", bottom: 30, transform: "translateX(-50%)",
  lineHeight: 1, filter: PET_SHADOW, transition: "font-size 1s",
};
const ZZZ_STYLE: CSSProperties = {
  position: "absolute", bottom: "90%", left: "60%", fontSize: "1.8rem", fontWeight: "bold",
  whiteSpace: "nowrap", animation: "floatUp 2s ease-in-out infinite",
};
// this makes the Zzz float up and down
const FLOAT_UP: string =
  "@keyframes floatUp { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(-12px); opacity: 0.5; } }";
const BIG_AT_HOME: number = 9; // how big a grown-up Saydee is at home, in rem
const BIG_OUTSIDE: number = 6; // how big a grown-up Saydee is at the park and pool, in rem

// this works out how big to draw her, so a puppy looks small
function petFontSize(game: Game, grownUpSize: number): string {
  return (grownUpSize * game.pet.size()) / 100 + "rem";
}
const PLACE_STYLE: CSSProperties = {
  position: "relative", height: 280, maxWidth: 700, margin: "0 auto 16px",
  borderRadius: 24, overflow: "hidden",
};
const THINGS_STYLE: CSSProperties = {
  position: "absolute", left: 0, right: 0, top: 90,
  display: "flex", justifyContent: "space-around", fontSize: "4rem",
};
const YOU_STYLE: CSSProperties = { position: "absolute", bottom: 10, left: 0, fontSize: "5rem" };
const TOY_HEIGHT: Record<ToyState, number> = { flying: 180, lying: 15, carried: 60 }; // how high the toy is
const MOUTH: number = 4; // how far into Saydee's face the toy sits when she carries it

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

// this draws the toy: up in the air, on the grass, or in Saydee's mouth
function showToy(toy: Toy): ReactNode {
  const inMouth = toy.state === "carried" ? MOUTH : 0;
  const toyStyle: CSSProperties = {
    position: "absolute", bottom: TOY_HEIGHT[toy.state], left: toy.x + inMouth + "%", fontSize: "3rem",
    transition: "left " + TICK_MS + "ms linear, bottom " + TICK_MS + "ms ease-out",
  };
  return <div style={toyStyle}>{toy.emoji}</div>;
}

// this draws a place: the sky, the grass or water, its things, and Saydee moving about
function showPlace(game: Game, groundColour: string, things: string[]): ReactNode {
  const placeStyle: CSSProperties = {
    ...PLACE_STYLE,
    background: "linear-gradient(" + SKY_COLOUR + " 55%, " + groundColour + " 55%)",
  };
  const petStyle: CSSProperties = {
    position: "absolute", bottom: 10, left: game.pet.x + "%", fontSize: petFontSize(game, BIG_OUTSIDE),
    transition: "left " + TICK_MS + "ms linear, font-size 1s", filter: PET_SHADOW,
  };
  return (
    <div style={placeStyle}>
      <div style={THINGS_STYLE}>{things.map(showThing)}</div>
      {game.place === "park" ? <div style={YOU_STYLE}>{YOU_EMOJI}</div> : null}
      <div style={petStyle}>{PET_EMOJI}</div>
      {game.toy != null ? showToy(game.toy) : null}
    </div>
  );
}

// this draws wherever Saydee is: on her bed at home, at the park or in the pool
export function showWhereSheIs(game: Game): ReactNode {
  if (game.place === "park") return showPlace(game, GRASS_COLOUR, PARK_THINGS);
  if (game.place === "pool") return showPlace(game, POOL_COLOUR, POOL_THINGS);
  return (
    <div style={HOME_STYLE}>
      <div style={BED_STYLE}></div>
      <style>{FLOAT_UP}</style>
      <div style={{ ...ON_BED_STYLE, fontSize: petFontSize(game, BIG_AT_HOME) }}>
        <div style={ZZZ_STYLE}>{SLEEP_TEXT}</div>
        {PET_EMOJI}
      </div>
    </div>
  );
}
