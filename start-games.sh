#!/bin/bash
# Salomé's. Starts Mia's game server and opens the arcade.
# Double-click "Mia's Games" on the desktop to run it.
cd "$(dirname "$0")" || exit 1

if curl -s -o /dev/null http://localhost:5173; then
  echo "The game server is already on. Opening the arcade..."
  xdg-open http://localhost:5173
  sleep 3
else
  echo "Starting Mia's games. Keep this window open while you play!"
  npm run dev
fi
