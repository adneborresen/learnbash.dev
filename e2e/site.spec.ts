// The other pages and the HTTP headers they are served with.
import { expect, test } from "@playwright/test";
import { loadChallenges } from "../scripts/lib/challenges.ts";

const { challenges } = loadChallenges();
const inFirstPart = challenges.filter((c) => c.meta.module === challenges[0].meta.module).length;

test("landing page lists the course and continues where you left off", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn Bash in a real Linux terminal");
  const parts = page.locator("#parts .part");
  await expect(parts).toHaveCount(2);
  await expect(parts.first().locator("h3")).toHaveText("Part 1: Find your way and work with files");
  const items = page.locator("#parts li");
  await expect(items).toHaveCount(challenges.length);
  await expect(page.getByRole("link", { name: "Start the first challenge →" })).toHaveAttribute("href", "/challenges/look-around/");

  await page.evaluate(() =>
    localStorage.setItem("learnbash:progress:v1", JSON.stringify({ solved: { "look-around": "2026-01-01T00:00:00Z" }, hints: {} })),
  );
  await page.reload();
  await expect(page.getByText(`You've solved 1 of ${challenges.length}.`)).toBeVisible();
  await expect(parts.first()).toContainText(`1 of ${inFirstPart} solved.`);
  await expect(page.locator("#start")).toHaveText("Continue: Find your desk →");
  await expect(items.first()).toHaveClass(/solved/);
});

test("every page links icons that exist", async ({ page, request }) => {
  for (const url of ["/", "/challenges/look-around/", "/licenses/"]) {
    await page.goto(url);
    const hrefs = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((links) =>
      links.map((l) => l.getAttribute("href")!),
    );
    expect(hrefs).toEqual(["/favicon.svg", "/favicon.ico", "/apple-touch-icon.png"]);
    for (const href of hrefs) expect((await request.get(href)).ok(), href).toBe(true);
  }
});

test("licenses page lists the Linux packages and links to their source code", async ({ page }) => {
  await page.goto("/licenses/");
  await expect(page.locator("#alpine-version")).toHaveText(/^3\.\d+\.\d+$/);
  for (const pkg of ["bash", "coreutils", "linux-lts", "busybox"]) {
    await expect(page.locator("#linux-packages tr", { hasText: pkg }).first()).toBeVisible();
  }
  await expect(page.locator("#linux-packages")).toContainText("GPL-3.0-or-later");
  await expect(page.locator("#sources-link")).toHaveAttribute(
    "href",
    /^https:\/\/github\.com\/adneborresen\/learnbash\.dev\/releases\/tag\/image-sources-[0-9a-f]{12}$/,
  );
  for (const name of ["v86", "@xterm/xterm", "SeaBIOS and SeaVGABIOS"]) {
    await expect(page.locator("#web-components summary", { hasText: name })).toBeVisible();
  }
});

test("challenge pages show their story without JavaScript (what search engines see)", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/challenges/top-visitor/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Top visitor");
  await expect(page.locator("#story")).not.toBeEmpty();
  await expect(page.locator("#goal")).not.toBeEmpty();
  await expect(page.locator("#explanation")).toBeEmpty(); // spoiler: only shown once solved
  await context.close();
});

test("link previews, canonical URLs and the sitemap", async ({ page, request }) => {
  const pages = { "/": "learnbash.dev: learn Bash", "/challenges/look-around/": "Look around", "/licenses/": "Licenses" };
  for (const [url, title] of Object.entries(pages)) {
    await page.goto(url);
    const head = page.locator("head");
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://learnbash.dev${url}`);
    await expect(head.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://learnbash.dev${url}`);
    await expect(head.locator('meta[property="og:title"]')).toHaveAttribute("content", new RegExp(`^${title}`));
    await expect(head.locator('meta[property="og:description"]')).toHaveAttribute("content", /\w/);
    await expect(head.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://learnbash.dev/og-image.png");
  }
  const image = await request.get("/og-image.png");
  expect(image.headers()["content-type"]).toBe("image/png");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs).toHaveLength(1 + challenges.length + 1);
  expect(locs).toContain("https://learnbash.dev/challenges/permission-denied/");
  for (const loc of locs) expect((await request.get(new URL(loc).pathname)).ok(), loc).toBe(true);
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://learnbash.dev/sitemap.xml");
});

test("headers: security policy everywhere, long caching only for hashed files", async ({ page, request }) => {
  const res = (await page.goto("/challenges/look-around/"))!;
  expect(res.headers()["content-security-policy"]).toContain("script-src 'self' 'wasm-unsafe-eval'");
  expect(res.headers()["x-frame-options"]).toBe("DENY");

  const vm = await request.get("/vm/vm.json");
  expect(vm.headers()["cache-control"]).toBe("no-cache");
  const { state } = await vm.json();
  const snapshot = await request.head(`/vm/${state}`);
  expect(snapshot.ok()).toBe(true);
  expect(snapshot.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
});
