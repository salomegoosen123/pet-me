// Salomé's. How the game server runs. Claude never changes this file.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // never move to another port: the best scores live on this one
    open: true, // open the arcade in the browser when the server starts
  },
});
