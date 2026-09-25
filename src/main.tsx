// Salomé's. Starts the arcade. Claude never changes this file.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Arcade } from "./Arcade";

// this starts the page again after every save, so a new knob always counts
if (import.meta.hot) {
  import.meta.hot.on("vite:beforeUpdate", function reloadThePage(): void {
    window.location.reload();
  });
}

const root = document.getElementById("root");
if (root != null) {
  createRoot(root).render(
    <StrictMode>
      <Arcade />
    </StrictMode>,
  );
}
