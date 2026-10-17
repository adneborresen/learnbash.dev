import { resolve } from "node:path";
import { defineConfig } from "vite";
import { challengesPlugin } from "./scripts/vite-plugin-challenges.ts";
import { headersPlugin } from "./scripts/vite-plugin-headers.ts";
import { licensesPlugin } from "./scripts/vite-plugin-licenses.ts";

const page = (file: string) => resolve(import.meta.dirname, file);

export default defineConfig({
  plugins: [challengesPlugin(), licensesPlugin(), headersPlugin()],
  build: {
    rollupOptions: {
      // dev/engine.html (the engine playground) is dev-only and not built.
      input: {
        home: page("index.html"),
        challenge: page("challenge.html"),
        licenses: page("licenses/index.html"),
        notFound: page("404.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: [".trycloudflare.com"],
  },
});
