import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        engine: resolve(import.meta.dirname, "dev/engine.html"),
      },
    },
  },
  server: { port: 5173 },
});
