// outfits.ts – what you wear: your everyday clothes, your swimming costume, your PJs, or your school uniform.
// (Your brother's costume is in family.ts, next to how he looks.) Mia designed this game.
import type { Outfit } from "./Game";
import { YOUR_LOOK } from "./Person3D";
import type { PersonLook } from "./Person3D";
import { PJS_COLOUR, SCHOOL_UNIFORM_BOTTOMS, SCHOOL_UNIFORM_TOP, SKIN_COLOUR, SWIMSUIT_COLOUR } from "./settings";

// this puts someone in the school uniform
export function inUniform(look: PersonLook): PersonLook {
  return { ...look, shirt: SCHOOL_UNIFORM_TOP, pants: SCHOOL_UNIFORM_BOTTOMS };
}

// your swimming costume: a bright costume, with bare legs
export const YOUR_COSTUME: PersonLook = { ...YOUR_LOOK, shirt: SWIMSUIT_COLOUR, pants: SKIN_COLOUR };

// your PJs: a soft top and bottoms that match
export const YOUR_PJS: PersonLook = { ...YOUR_LOOK, shirt: PJS_COLOUR, pants: PJS_COLOUR };

// how you look in each outfit
const OUTFIT_LOOKS: Record<Outfit, PersonLook> = {
  clothes: YOUR_LOOK, costume: YOUR_COSTUME, pjs: YOUR_PJS, uniform: inUniform(YOUR_LOOK),
};

// this says how you look in what you're wearing
export function yourOutfit(outfit: Outfit): PersonLook {
  return OUTFIT_LOOKS[outfit];
}
