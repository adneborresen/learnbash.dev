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
  return ((await page.locator("#term .xterm-rows").textContent()) ?? "").replace(/\u00a0/g, " ");
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

  await answer.fill("\u00a0 todo-for-new-hire.txt \u00a0"); // e.g. pasted, with non-breaking spaces
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

test.describe("course controls on a touch screen", () => {
  test.use({ viewport: { width: 375, height: 740 }, hasTouch: true });

  test("Ctrl-C key stops a waiting cat before the recovery answer passes", async ({ page }) => {
    await openChallenge(page, "get-your-prompt-back");
    await typeCommand(page, "cat");
    await page.getByLabel("Recovery code").fill("6318");
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(feedback(page)).toHaveClass(/fail/);
    await expect(feedback(page)).toContainText("Ctrl+C");
    await page.getByRole("button", { name: "Control C (stop command)", exact: true }).click();
    await expect.poll(() => screenText(page)).toMatch(/learner@learnbash:~\$ *$/m);
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(feedback(page)).toHaveClass(/pass/);
  });

  test("nano saves and edits through the key bar, and Check reads the saved file", async ({ page }) => {
    await openChallenge(page, "leave-a-note");
    const check = page.getByRole("button", { name: "Check", exact: true });
    const save = page.getByRole("button", { name: "Control O (save in nano)", exact: true });
    const exit = page.getByRole("button", { name: "Control X (exit nano)", exact: true });
    await typeCommand(page, "nano ~/note.txt");
    // nano shortens its shortcut labels on narrow terminals ("^O Write Ou"), but not "Exit".
    await expect.poll(() => screenText(page)).toContain("^X Exit");
    await page.keyboard.type("Team: website");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Status: draft");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Next: review logs");
    await check.click();
    await expect(feedback(page)).toHaveClass(/fail/);
    await expect(feedback(page)).toContainText("No ~/note.txt");
    await save.click();
    await expect.poll(() => screenText(page)).toContain("Write to File:");
    await page.keyboard.press("Enter");
    await expect.poll(() => screenText(page)).toContain("Wrote 3 lines");
    await check.click();
    await expect(feedback(page)).toHaveClass(/fail/);
    await page.locator("#term").click();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("End");
    for (let i = 0; i < 5; i++) await page.keyboard.press("Backspace");
    await page.keyboard.type("ready");
    await check.click();
    await expect(feedback(page)).toHaveClass(/fail/); // The correction is still unsaved.
    await save.click();
    await expect.poll(() => screenText(page)).toContain("Write to File:");
    await page.keyboard.press("Enter");
    await expect.poll(() => screenText(page)).toContain("Wrote 3 lines");
    await check.click();
    await expect(feedback(page)).toHaveClass(/pass/); // Nano is still open.
    await expect.poll(() => screenText(page)).toContain("^X Exit");
    await exit.click();
    await expect.poll(() => screenText(page)).toContain("learner@learnbash:~$");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe("on a phone", () => {
  const { defaultBrowserType: _, ...phone } = devices["Pixel 7"];
  test.use(phone);
  test.skip(({ browserName }) => browserName !== "chromium", "touch input is sent through the Chrome DevTools Protocol");

  test("swiping the terminal scrolls back through long output", async ({ page }) => {
    await openChallenge(page, "ask-for-help");
    await page.locator("#term").tap();
    await page.keyboard.type("cat --help");
    await page.keyboard.press("Enter");
    await expect.poll(() => screenText(page)).toContain("cat invocation");
    expect(await screenText(page)).not.toContain("Usage: cat");

    // Drag a finger down over the terminal, as when scrolling up on a phone.
    // Even cat's shorter help wraps and scrolls on a phone.
    const box = (await page.locator("#term").boundingBox())!;
    const x = box.x + box.width / 2;
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y === undefined ? [] : [{ x, y }] });
    for (let i = 0; i < 40 && !(await screenText(page)).includes("Usage: cat"); i++) {
      await touch("touchStart", box.y + 20);
      for (let step = 1; step <= 10; step++) await touch("touchMove", box.y + 20 + step * 30);
      await touch("touchEnd");
    }
    expect(await screenText(page)).toContain("Usage: cat");
  });
});

test("feedback: report a problem, and rate a solved challenge", async ({ page }) => {
  const sent: Array<Record<string, unknown>> = [];
  await page.route("/api/feedback", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ status: 204 });
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "learnbash:progress:v1",
      JSON.stringify({ solved: { "look-around": "2026-01-01T00:00:00Z" }, hints: { "look-around": 2 } }),
    ),
  );
  await page.goto("/challenges/look-around/");

  // While working on it.
  await page.getByText("Something wrong or confusing?").click();
  await page.getByLabel("What happened? What did you expect?").fill("The hint mentions a folder I don't have.");
  await page.locator("#report-form").getByRole("button", { name: "Send" }).click();
  await expect(page.locator("#report-status")).toHaveText("Thanks! Your feedback was sent.");
  await expect(page.locator("#report-form")).toBeHidden();
  expect(sent[0]).toEqual({
    challenge: "look-around",
    kind: "problem",
    comment: "The hint mentions a folder I don't have.",
    hints: 2,
    device: "computer",
    website: "",
  });

  // After solving: one tap sends the rating, a comment can follow.
  await page.getByRole("button", { name: "Not good" }).click();
  await expect(page.locator("#rate-status")).toHaveText("Thanks! Your feedback was sent.");
  expect(sent[1]).toMatchObject({ challenge: "look-around", kind: "rating", rating: "down" });
  await page.getByLabel("Anything to add? (optional)").fill("Too easy.");
  await page.locator("#rate-form").getByRole("button", { name: "Send" }).click();
  await expect.poll(() => sent.length).toBe(3);
  expect(sent[2]).toMatchObject({ kind: "comment", rating: "down", comment: "Too easy." });
});

test("feedback: says so when sending fails", async ({ page }) => {
  await page.route("/api/feedback", (route) => route.fulfill({ status: 503 }));
  await page.goto("/challenges/look-around/");
  await page.getByText("Something wrong or confusing?").click();
  await page.getByLabel("What happened? What did you expect?").fill("Something broke.");
  await page.locator("#report-form").getByRole("button", { name: "Send" }).click();
  await expect(page.locator("#report-status")).toHaveText("Sorry, that didn't work. Please try again later.");
  await expect(page.locator("#report-form")).toBeVisible();
});

test("usage: the page reports anonymous counts of what happens", async ({ page }) => {
  // Watched, not intercepted: intercepting requests in WebKit stalls the VM's
  // own downloads. (The preview server has no /api, so they get a 404.)
  const events: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname !== "/api/usage") return;
    const body = request.postDataJSON();
    expect(Object.keys(body).sort()).toEqual(["challenge", "device", "event"]); // nothing else
    events.push(`${body.challenge} ${body.event} ${body.device}`);
  });
  await openChallenge(page, "look-around");
  await page.getByRole("button", { name: /Show a hint/ }).click();
  const answer = page.getByLabel("Name of the file");
  await answer.fill("projects");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(feedback(page)).toHaveClass(/fail/);
  await answer.fill("todo-for-new-hire.txt");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(feedback(page)).toHaveClass(/pass/);
  await page.getByRole("button", { name: "Check" }).click(); // solved before: not counted again
  await expect(feedback(page)).toHaveClass(/pass/);
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("button", { name: "Click again to start over" }).click();
  await expect.poll(() => events.length).toBe(8);
  expect(events).toEqual([
    "look-around opened computer",
    "look-around started computer",
    "look-around hint-1 computer",
    "look-around checked computer",
    "look-around checked computer",
    "look-around solved computer",
    "look-around checked computer",
    "look-around reset computer",
  ]);
});
