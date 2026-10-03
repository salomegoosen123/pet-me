// Game kit. Draws a 3D world on a canvas, again and again, and cleans up when the game closes.
// In a screen:   const drawWorldOn = useWorld3D(makeWorld, game);   then   <canvas ref={drawWorldOn} />
import { useEffect, useRef, useState } from "react";

// a 3D world: something that can be built on a canvas, shown, and thrown away
export interface World3D<G> {
  start(canvas: HTMLCanvasElement): void; // builds the world on the canvas
  show(game: G): void; // draws one picture of the world, with the game as it is now
  stop(): void; // throws the world away
}

// a function that makes a brand new 3D world
export interface WorldMaker<G> {
  (): World3D<G>;
}

// what the screen puts on its canvas, so the world knows where to draw
export interface CanvasCatcher {
  (canvas: HTMLCanvasElement | null): void;
}

// this runs one 3D world: builds it once the canvas is there, draws it every frame, and stops it
export function useWorld3D<G>(makeWorld: WorldMaker<G>, game: G): CanvasCatcher {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const latestGame = useRef<G>(game);

  useEffect(function rememberTheGame(): void {
    latestGame.current = game;
  });

  useEffect(function startTheWorld(): VoidFunction | undefined {
    if (canvas == null) return undefined;
    const world = makeWorld();
    world.start(canvas);
    let frameId = 0;

    // this draws one picture, then asks for the next one
    function drawNextFrame(): void {
      world.show(latestGame.current);
      frameId = window.requestAnimationFrame(drawNextFrame);
    }

    frameId = window.requestAnimationFrame(drawNextFrame);

    // this stops drawing and throws the world away when the game closes
    return function stopTheWorld(): void {
      window.cancelAnimationFrame(frameId);
      world.stop();
    };
  }, [canvas, makeWorld]);

  return setCanvas;
}
