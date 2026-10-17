// Vite plugin: `import challenges from "virtual:challenges"` gives the
// compiled challenges. Invalid content fails the build with a clear list.
// It also gives every challenge its own page, /challenges/<id>/: rewritten to
// challenge.html by the dev server, and written as real files by the build
// (any static host can serve them, and each has its own title).
import fs from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";
import type { ChallengeSummary, CompiledChallenge } from "../src/content/schema.ts";
import { challengeIdFromPath, challengeUrl } from "../src/site/routes.ts";
import { CHALLENGES_DIR, compileChallenge, loadChallenges } from "./lib/challenges.ts";

const ID = "virtual:challenges";
const RESOLVED = "\0" + ID;
const INDEX_ID = "virtual:challenge-index";
const INDEX_RESOLVED = "\0" + INDEX_ID;
const PAGE = "challenge.html";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

const rewriteChallengeUrls: Connect.NextHandleFunction = (req, _res, next) => {
  const pathname = (req.url ?? "").split("?")[0];
  if (challengeIdFromPath(pathname)) req.url = `/${PAGE}`;
  next();
};

export function challengesPlugin(): Plugin {
  let outDir = "dist";
  return {
    name: "learnbash-challenges",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    resolveId(id) {
      if (id === ID) return RESOLVED;
      if (id === INDEX_ID) return INDEX_RESOLVED;
      return undefined;
    },
    load(id) {
      if (id !== RESOLVED && id !== INDEX_RESOLVED) return undefined;
      // No this.addWatchFile(CHALLENGES_DIR): the dev server would treat the
      // folder as an import and fail. configureServer below handles reloads.
      const { challenges, errors } = loadChallenges();
      if (errors.length > 0) {
        this.error(`Invalid challenges:\n  - ${errors.join("\n  - ")}`);
      }
      const compiled = challenges.map(compileChallenge);
      const data: Array<ChallengeSummary | CompiledChallenge> =
        id === RESOLVED ? compiled : compiled.map(({ id, order, title, module, concept }) => ({ id, order, title, module, concept }));
      return `export default ${JSON.stringify(data)};`;
    },
    configureServer(server) {
      server.middlewares.use(rewriteChallengeUrls);
      // Editing any challenge file reloads the page with fresh content.
      server.watcher.add(CHALLENGES_DIR);
      server.watcher.on("all", (_event, file) => {
        if (!file.startsWith(CHALLENGES_DIR)) return;
        for (const resolved of [RESOLVED, INDEX_RESOLVED]) {
          const mod = server.moduleGraph.getModuleById(resolved);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      });
    },
    writeBundle() {
      const template = path.join(outDir, PAGE);
      if (!fs.existsSync(template)) return;
      const html = fs.readFileSync(template, "utf8");
      for (const c of loadChallenges().challenges) {
        const page = html
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(c.meta.title)} · learnbash.dev</title>`)
          .replace(
            /<meta name="description" content="[^"]*">/,
            `<meta name="description" content="${escapeHtml(`${c.meta.concept}. A Bash challenge in a real Linux terminal in your browser.`)}">`,
          );
        const file = path.join(outDir, challengeUrl(c.meta.id), "index.html");
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, page);
      }
      fs.rmSync(template); // only reachable through the per-challenge pages
    },
  };
}
