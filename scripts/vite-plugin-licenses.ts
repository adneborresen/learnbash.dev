// Vite plugin: `import data from "virtual:licenses"` gives the licenses page
// everything it lists: the Linux packages in the VM image (from
// build/image/packages.tsv) and the third-party code shipped to browsers.
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import type { LicensesData, LinuxSourcePackage, WebComponent } from "../src/content/licenses.ts";
import { alpineVersion, PACKAGES_FILE, readPackages, SOURCES_REPO, sourcesUrl } from "./lib/image-sources.ts";
import { ROOT } from "./lib/paths.ts";

const ID = "virtual:licenses";
const RESOLVED = "\0" + ID;

/**
 * npm packages whose code ends up in the pages. The build fails if code from
 * any other package is bundled, so the licenses page can't silently go stale.
 */
export const SHIPPED_NPM_PACKAGES = ["v86", "@xterm/xterm", "@xterm/addon-fit", "vite"];

function npmComponent(name: string): WebComponent {
  const dir = path.join(ROOT, "node_modules", name);
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
  const licenseFile = fs.readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(f));
  if (!licenseFile) throw new Error(`no license file in node_modules/${name}`);
  return {
    name,
    version: pkg.version,
    license: pkg.license,
    homepage: typeof pkg.homepage === "string" ? pkg.homepage : `https://www.npmjs.com/package/${name}`,
    text: fs.readFileSync(path.join(dir, licenseFile), "utf8").trim(),
  };
}

const SEABIOS: WebComponent = {
  name: "SeaBIOS and SeaVGABIOS",
  version: "1.16.2",
  license: "LGPL-3.0",
  homepage: "https://www.seabios.org/",
  text: [
    "The emulated PC's BIOS (seabios.bin) and video BIOS (vgabios.bin) are SeaBIOS rel-1.16.2,",
    "built by v86's bios/fetch-and-build-seabios.sh with v86's bios/seabios.config:",
    "https://github.com/copy/v86/tree/2d6f9aa/bios",
    "",
    "Source code: https://git.seabios.org/seabios.git (tag rel-1.16.2)",
    "License: GNU Lesser General Public License v3.0, https://www.gnu.org/licenses/lgpl-3.0.html",
  ].join("\n"),
};

export function loadLicensesData(): LicensesData {
  const byOrigin = new Map<string, LinuxSourcePackage>();
  for (const p of readPackages()) {
    const entry = byOrigin.get(p.origin);
    if (entry) entry.binaries.push(p.name);
    else byOrigin.set(p.origin, { origin: p.origin, version: p.version, license: p.license, url: p.url, binaries: [p.name] });
  }
  return {
    alpineVersion: alpineVersion(),
    sourcesUrl: sourcesUrl(),
    recipeUrl: `${SOURCES_REPO}/tree/main/image`,
    linux: [...byOrigin.values()].sort((a, b) => a.origin.localeCompare(b.origin)),
    web: [...SHIPPED_NPM_PACKAGES.map(npmComponent), SEABIOS],
  };
}

export function licensesPlugin(): Plugin {
  return {
    name: "learnbash-licenses",
    resolveId(id) {
      return id === ID ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      if (!fs.existsSync(PACKAGES_FILE)) this.error("build/image/packages.tsv is missing: run npm run build:image first");
      this.addWatchFile(PACKAGES_FILE);
      return `export default ${JSON.stringify(loadLicensesData())};`;
    },
    generateBundle(_options, bundle) {
      const unlisted = new Set<string>();
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        for (const id of chunk.moduleIds) {
          const m = /node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/.exec(id);
          const name = m ? m[1].replace(/\\/g, "/") : id.startsWith("\0vite/") ? "vite" : undefined;
          if (name && !SHIPPED_NPM_PACKAGES.includes(name)) unlisted.add(name);
        }
      }
      if (unlisted.size > 0) {
        this.error(
          `code from ${[...unlisted].join(", ")} is shipped to browsers but not listed on the licenses page: ` +
            "add it to SHIPPED_NPM_PACKAGES in scripts/vite-plugin-licenses.ts",
        );
      }
    },
  };
}
