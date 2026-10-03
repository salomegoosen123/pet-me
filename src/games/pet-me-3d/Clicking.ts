// Clicking.ts – finds out which pop-up button you clicked on the 3D picture. Mia designed this game.
import { Raycaster, Vector2 } from "three";
import type { Camera } from "three";
import type { PopUpButton3D } from "./PopUpButton3D";

const WOBBLE: number = 6; // the mouse can move this many dots and still be a click, not a drag to spin

// Clicking listens for clicks on the 3D picture, but not for drags that spin the camera
export class Clicking {
  downAt: Vector2; // where the mouse went down
  clickedAt: Vector2 | null; // where you clicked (-1 to 1 across and up the picture), until it is used
  listening: AbortController; // this stops the listening when the game closes

  constructor() {
    this.downAt = new Vector2();
    this.clickedAt = null;
    this.listening = new AbortController();
  }

  // this starts listening to the mouse on the canvas
  listen(canvas: HTMLCanvasElement): void {
    const clicking = this;

    // this remembers where the mouse went down
    function pressDown(event: PointerEvent): void {
      clicking.downAt.set(event.clientX, event.clientY);
    }

    // this counts it as a click if the mouse hardly moved
    function letGo(event: PointerEvent): void {
      if (clicking.downAt.distanceTo(new Vector2(event.clientX, event.clientY)) > WOBBLE) return;
      const box = canvas.getBoundingClientRect();
      const across = ((event.clientX - box.left) / box.width) * 2 - 1;
      const up = -((event.clientY - box.top) / box.height) * 2 + 1;
      clicking.clickedAt = new Vector2(across, up);
    }

    canvas.addEventListener("pointerdown", pressDown, { signal: this.listening.signal });
    canvas.addEventListener("pointerup", letGo, { signal: this.listening.signal });
  }

  // this finds the button you just clicked, if it's popped up
  clickedButton(camera: Camera, buttons: PopUpButton3D[]): PopUpButton3D | null {
    const spot = this.clickedAt;
    this.clickedAt = null;
    if (spot == null) return null;
    const ray = new Raycaster();
    ray.setFromCamera(spot, camera);
    for (const button of buttons) {
      if (button.isUp() && ray.intersectObject(button.model).length > 0) return button;
    }
    return null;
  }

  // this stops listening when the game closes
  stop(): void {
    this.listening.abort();
    this.listening = new AbortController();
  }
}
