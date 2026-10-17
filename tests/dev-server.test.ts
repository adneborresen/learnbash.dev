// `npm run dev` must work: start the real Vite dev server and load every page
// and the modules they import. (The browser tests only cover the production
// build, so dev-only breakage would otherwise go unnoticed.)
import { afterAll, beforeAll, expect, test } from "vitest";
import { createServer, type ViteDevServer } from "vite";

let server: ViteDevServer;
let base: string;

beforeAll(async () => {
  server = await createServer({ logLevel: "silent", server: { port: 0, host: "127.0.0.1" } });
  await server.listen();
  base = server.resolvedUrls!.local[0];
});
afterAll(async () => {
  await server?.close();
});

const PAGES: Array<[string, string]> = [
  ["/", "/src/pages/home.ts"],
  ["/challenges/look-around/", "/src/pages/challenge.ts"],
  ["/licenses/", "/src/pages/licenses.ts"],
];

for (const [url, entry] of PAGES) {
  test(`dev server serves ${url}`, async () => {
    const html = await fetch(new URL(url, base));
    expect(html.status).toBe(200);
    expect(await html.text()).toContain(entry);
  });
}

test("dev server transforms the pages' modules, including the virtual ones", async () => {
  for (const id of [...PAGES.map(([, entry]) => entry), "virtual:challenges", "virtual:challenge-index", "virtual:licenses"]) {
    const result = await server.transformRequest(id);
    expect(result?.code, id).toBeTruthy();
  }
});
