// hobby.ts – something someone in your family loves doing in one spot, like Mum cooking or Dad watching rugby. Mia designed this game.
import type { Vector3 } from "three";
import type { Person3D } from "./Person3D";

// a Hobby has a spot where it's done, what happens while they do it, and sometimes somewhere it sends them next
export interface Hobby {
  spot: Vector3; // where they walk to, to do it
  update(person: Person3D, doingIt: boolean, now: number, seconds: number): void; // every picture, doing it or not
  errand(): Vector3 | null; // somewhere they need to go now, like the table with a plate of food (or null)
  keepsThemBusy(): boolean; // must they stay until it's finished, like Mum until the food is ready
}
