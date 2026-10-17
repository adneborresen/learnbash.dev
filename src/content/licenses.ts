// Data for the licenses page, assembled at build time by
// scripts/vite-plugin-licenses.ts.

/** One Alpine source package (several binary packages can come from one). */
export interface LinuxSourcePackage {
  origin: string;
  version: string;
  license: string;
  url: string;
  binaries: string[];
}

/** Third-party code that runs in the browser. */
export interface WebComponent {
  name: string;
  version: string;
  license: string;
  homepage: string;
  /** Full license text. */
  text: string;
}

export interface LicensesData {
  alpineVersion: string;
  /** GitHub release with the complete source code of the VM image. */
  sourcesUrl: string;
  /** How the image is assembled (Dockerfile etc.). */
  recipeUrl: string;
  linux: LinuxSourcePackage[];
  web: WebComponent[];
}
