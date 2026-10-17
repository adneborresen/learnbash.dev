import { resolve } from "node:path";
import { defineConfig } from "vite";
import { challengesPlugin } from "./scripts/vite-plugin-challenges.ts";

export default defineConfig({
  plugins: [challengesPlugin()],
  build: {
    rollupOptions: {
      // dev/engine.html (the engine playground) is dev-only and not built.
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        challenge: resolve(import.meta.dirname, "challenge.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: [".trycloudflare.com"],
  },
});
