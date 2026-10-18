// End-to-end: the built site in a real browser, with the real VM.
import { devices, expect, test, type Page } from "@playwright/test";

/** Opens a challenge and waits until Linux is running and Check is enabled. */
async function openChallenge(page: Page, id: string) {
  await page.goto(`/challenges/${id}/`);
  await expect(page.locator("#loading")).toBeHidden({ timeout: 90_000 });
  await expect(page.getByRole("button", { name: "Check" })).toBeEnabled();
}

/** What the terminal currently shows (xterm renders text into DOM rows). */
async function screenText(page: Page) {
  return ((await page.locator("#term .xterm-rows").textContent()) ?? "").replace(/ /g, " ");
}

async function typeCommand(page: Page, line: string) {
  await page.locator("#term").click();
  await page.keyboard.type(line);
  await page.keyboard.press("Enter");
}

const feedback = (page: Page) => page.locator("#feedback");

// The pages run under the Content-Security-Policy from public/_headers
// (applied by `vite preview`). Any violation means something would break in
// production, so every test fails on one.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const seen: string[] = ((window as unknown as { cspViolations: string[] }).cspViolations = []);
    document.addEventListener("securitypolicyviolation", (e) => seen.push(`${e.violatedDirective}: ${e.blockedURI}`));
  });
});
test.afterEach(async ({ page }) => {
  const violations = await page.evaluate(() => (window as unknown as { cspViolations?: string[] }).cspViolations ?? []);
  expect(violations, "Content-Security-Policy violations").toEqual([]);
});

test("answer challenge: wrong answer, explore, right answer, progress kept", async ({ page }) => {
  await openChallenge(page, "look-around");
  await expect.poll(() => screenText(page)).toContain("learner@learnbash:~$");

  const answer = page.getByLabel("Name of the file");
  await answer.fill("projects");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(feedback(page)).toHaveClass(/fail/);
  await expect(page.locator("#solved")).toBeHidden();

  await typeCommand(page, "ls");
  await expect.poll(() => screenText(page)).toContain("todo-for-new-hire.txt");

  await answer.fill("  todo-for-new-hire.txt ");
  await answer.press("Enter"); // Enter in the answer box checks too
  await expect(feedback(page)).toHaveClass(/pass/);
  await expect(page.locator("#solved")).toBeVisible();
  await expect(page.locator("#explanation")).toBeVisible();
  await expect(page.locator("#solved-next")).toHaveAttribute("href", "/challenges/find-your-desk/");

  // Reloading restarts the challenge but remembers that it was solved.
  await page.reload();
  await expect(page.locator("#solved")).toBeVisible();
  await expect(page.locator("#explanation")).toBeHidden(); // collapsed on later visits
  await expect(page.locator("#loading")).toBeHidden({ timeout: 90_000 });
  await page.goto("/");
  await expect(page.getByText("You've solved 1 of")).toBeVisible();
});

test("state challenge: check, solve in the terminal, reset", async ({ page }) => {
  await openChallenge(page, "find-your-desk");
  const check = page.getByRole("button", { name: "Check" });

  await check.click();
  await expect(feedback(page)).toHaveClass(/fail/);

  await typeCommand(page, "cd projects/website/assets");
  await expect.poll(() => screenText(page)).toContain("learner@learnbash:~/projects/website/assets$");
  await check.click();
  await expect(feedback(page)).toHaveClass(/pass/);

  // Reset needs a second click, then puts back a fresh machine.
  const reset = page.locator("#reset");
  await reset.click();
  await expect(reset).toHaveText("Click again to start over");
  await reset.click();
  await expect(check).toBeEnabled();
  await expect.poll(() => screenText(page)).toMatch(/learner@learnbash:~\$ *$/m);
  expect(await screenText(page)).not.toContain("assets$");
  await check.click();
  await expect(feedback(page)).toHaveClass(/fail/);
});

test("hints open one at a time and stay open", async ({ page }) => {
  await page.goto("/challenges/find-your-desk/");
  const button = page.locator("#hint-button");
  await expect(button).toHaveText("Show a hint (1 of 3)");
  await button.click();
  await button.click();
  await expect(page.locator("#hint-list li")).toHaveCount(2);
  await page.reload();
  await expect(page.locator("#hint-list li")).toHaveCount(2);
  await button.click();
  await expect(page.locator("#hint-list li")).toHaveCount(3);
  await expect(button).toBeHidden();
});

test.describe("phone-sized screen", () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test("fits without sideways scrolling", async ({ page }) => {
    await openChallenge(page, "look-around");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    for (const id of ["#title", "#goal", "#term", "#check"]) await expect(page.locator(id)).toBeVisible();
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe("on a phone", () => {
  const { defaultBrowserType: _, ...phone } = devices["Pixel 7"];
  test.use(phone);

  test("swiping the terminal scrolls back through long output", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "touch input is sent through the Chrome DevTools Protocol");
    await openChallenge(page, "find-your-desk");
    await page.locator("#term").tap();
    await page.keyboard.type("ls --help");
    await page.keyboard.press("Enter");
    await expect.poll(() => screenText(page)).toContain("ls invocation");
    expect(await screenText(page)).not.toContain("Usage: ls");

    // Drag a finger down over the terminal, as when scrolling up on a phone.
    // Narrow lines wrap, so the help text is a few hundred lines long.
    const box = (await page.locator("#term").boundingBox())!;
    const x = box.x + box.width / 2;
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y === undefined ? [] : [{ x, y }] });
    for (let i = 0; i < 40 && !(await screenText(page)).includes("Usage: ls"); i++) {
      await touch("touchStart", box.y + 20);
      for (let step = 1; step <= 10; step++) await touch("touchMove", box.y + 20 + step * 30);
      await touch("touchEnd");
    }
    expect(await screenText(page)).toContain("Usage: ls");
  });
});
