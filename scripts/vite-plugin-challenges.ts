// Vite plugin: `import challenges from "virtual:challenges"` gives the
// compiled challenges. Invalid content fails the build with a clear list.
import type { Plugin } from "vite";
import { CHALLENGES_DIR, compileChallenge, loadChallenges } from "./lib/challenges.ts";

const ID = "virtual:challenges";
const RESOLVED = "\0" + ID;

export function challengesPlugin(): Plugin {
  return {
    name: "learnbash-challenges",
    resolveId(id) {
      return id === ID ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      this.addWatchFile(CHALLENGES_DIR);
      const { challenges, errors } = loadChallenges();
      if (errors.length > 0) {
        this.error(`Invalid challenges:\n  - ${errors.join("\n  - ")}`);
      }
      return `export default ${JSON.stringify(challenges.map(compileChallenge))};`;
    },
    configureServer(server) {
      // Editing any challenge file reloads the page with fresh content.
      server.watcher.add(CHALLENGES_DIR);
      server.watcher.on("all", (_event, file) => {
        if (!file.startsWith(CHALLENGES_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      });
    },
  };
}
