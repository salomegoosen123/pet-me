// capacitor.config.ts – turns the built arcade (dist/) into a native Android/iOS app shell.
// Not part of Mia's games: this is Salomé's build tooling, written to support her own setup.
// Run `npx cap sync` after any change here.
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.miasgames.arcade",
  appName: "Mia's Games",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
