// The other pages and the HTTP headers they are served with.
import { expect, test } from "@playwright/test";

test("landing page lists the course and continues where you left off", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn Bash in a real Linux terminal");
  const items = page.locator("#list li");
  await expect(items).toHaveCount(12);
  await expect(page.getByRole("link", { name: "Start the first challenge →" })).toHaveAttribute("href", "/challenges/look-around/");

  await page.evaluate(() =>
    localStorage.setItem("learnbash:progress:v1", JSON.stringify({ solved: { "look-around": "2026-01-01T00:00:00Z" }, hints: {} })),
  );
  await page.reload();
  await expect(page.getByText("You've solved 1 of 12.")).toBeVisible();
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
