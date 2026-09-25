// Salomé's. The best score, saved in the browser, so she can beat herself next time.
// Claude never changes this file.
//   loadBestScore(GAME_NAME)   and   saveBestScore(GAME_NAME, score)

// this reads the best score ever for one game
export function loadBestScore(gameName: string): number {
  try {
    const saved = localStorage.getItem(gameName + "-best");
    return saved == null ? 0 : Number(saved);
  } catch {
    return 0; // the browser said no; start from zero
  }
}

// this keeps the score if it beats the best one
export function saveBestScore(gameName: string, score: number): void {
  try {
    if (score > loadBestScore(gameName)) localStorage.setItem(gameName + "-best", String(score));
  } catch {
    // the browser said no; the score is still on the screen
  }
}
