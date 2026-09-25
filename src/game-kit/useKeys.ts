// Salomé's. Which keys are held down right now. Claude never changes this file.
// In a screen:   const keys = useKeys();   then give it to the game: new Game(keys)
// In the game:   if (this.keys.isDown("ArrowLeft")) { … }
import { useEffect, useState } from "react";

// the keys that are held down
export class Keys {
  private held: Set<string> = new Set();

  // is this key held down? Names: "ArrowLeft", "ArrowRight", " " for space, "a" for A
  isDown(key: string): boolean {
    return this.held.has(key);
  }

  press(key: string): void {
    this.held.add(key);
  }

  release(key: string): void {
    this.held.delete(key);
  }
}

// this makes a new, empty set of keys
function makeKeys(): Keys {
  return new Keys();
}

// this listens to the keyboard while the game is open
export function useKeys(): Keys {
  const [keys] = useState<Keys>(makeKeys);

  useEffect(function listenForKeys(): VoidFunction {
    function onKeyDown(event: KeyboardEvent): void {
      keys.press(event.key);
      // arrows and space must move the game, not scroll the page
      if (event.key.startsWith("Arrow") || event.key === " ") event.preventDefault();
    }

    function onKeyUp(event: KeyboardEvent): void {
      keys.release(event.key);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // this stops listening when the game closes
    return function stopListening(): void {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [keys]);

  return keys;
}
