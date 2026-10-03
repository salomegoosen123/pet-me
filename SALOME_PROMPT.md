# Prompt for Salomé's session

Paste this into a Claude Code session that has terminal access (this one doesn't).

---

Commit and push the current changes, then help me turn Mia's Games into a mobile app:

1. Stage and commit everything currently changed/untracked in this repo (responsive CSS fixes
   for Candy Land and Popcorn Land so they fit a phone screen, plus two new files:
   `capacitor.config.ts` and `NATIVE_APP.md`). Write a clear commit message. Push to the current
   branch's remote.

2. Then walk me through `NATIVE_APP.md` in this repo root — it's the step-by-step guide for
   wrapping the app with Capacitor so it can run as a native Android/iOS app. Run the commands
   with me, and make the two small edits it calls for in `package.json` (and optionally
   `index.html`) yourself, since those files are reserved for me under `CLAUDE.md` and Claude
   won't touch them unprompted.

3. Once that's running on a device/emulator, I may also want a plain PWA (Progressive Web App)
   version — installable from the browser via "Add to Home Screen," no app store needed. That's
   a separate, smaller task (a `manifest.json` plus one `<link>` tag in `index.html`) — ask me
   if I want it done at the same time or later.

---

**One correction for your own notes, not Mia's:** earlier I asked for "WPA" — the correct term is
**PWA** (Progressive Web App). WPA is a Wi-Fi security standard, unrelated.
