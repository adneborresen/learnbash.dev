// The image's package list and where its source code is published.
// The source archive is named after a hash of the exact package list, so the
// licenses page of every deployed build links to the matching sources.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./paths.ts";

/** Where the source archives are published (GitHub Releases of this repo). */
export const SOURCES_REPO = "https://github.com/adneborresen/learnbash.dev";
export const PACKAGES_FILE = path.join(ROOT, "build/image/packages.tsv");
const RELEASE_FILE = path.join(ROOT, "build/image/alpine-release");

export interface ImagePackage {
  name: string;
  version: string;
  origin: string;
  license: string;
  url: string;
  commit: string;
}

export function readPackages(file = PACKAGES_FILE): ImagePackage[] {
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const [name, version, origin, license, url, commit] = line.split("\t");
      return { name, version, origin, license, url, commit };
    });
}

export function alpineVersion(): string {
  return fs.readFileSync(RELEASE_FILE, "utf8").trim();
}

/** e.g. "image-sources-3f2a9c1b7d0e": a GitHub release tag. */
export function sourcesTag(file = PACKAGES_FILE): string {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 12);
  return `image-sources-${hash}`;
}

export function sourcesUrl(): string {
  return `${SOURCES_REPO}/releases/tag/${sourcesTag()}`;
}

// `node scripts/lib/image-sources.ts tag` prints the release tag (used by CI).
if (import.meta.filename === process.argv[1] && process.argv[2] === "tag") {
  console.log(sourcesTag());
}
