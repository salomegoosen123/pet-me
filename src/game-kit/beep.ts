// Salomé's. Short beeps made by the browser, no sound files. Claude never changes this file.
//   beep(440, 0.1)  a boop.   beep(880, 0.1)  a bloop.   beep(200, 0.3)  a bonk.
let speaker: AudioContext | null = null;

// this plays one short note: how high (in hertz) and how long (in seconds)
export function beep(pitch: number, seconds: number): void {
  try {
    if (speaker == null) speaker = new AudioContext();
    if (speaker.state === "suspended") void speaker.resume();
    const note = speaker.createOscillator();
    const volume = speaker.createGain();
    note.frequency.value = pitch;
    volume.gain.value = 0.1;
    note.connect(volume);
    volume.connect(speaker.destination);
    note.start();
    note.stop(speaker.currentTime + seconds);
  } catch {
    // the browser said no to sound; the game keeps going without it
  }
}
