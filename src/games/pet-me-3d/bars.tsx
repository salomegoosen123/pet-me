// bars.tsx – Saydee's bars, drawn on the screen under her 3D home. Mia designed this game.
import type { CSSProperties, ReactNode } from "react";
import { FULL_COLOUR, LOW_AT, LOW_COLOUR } from "./settings";

const BAR_STYLE: CSSProperties = {
  width: 320, height: 36, margin: "0 auto", background: "white",
  border: "4px solid #22335B", borderRadius: 20, overflow: "hidden",
  boxShadow: "inset 0 6px 8px rgba(0, 0, 0, 0.25), 0 5px 0 #22335B", // this makes the bar look deep
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
