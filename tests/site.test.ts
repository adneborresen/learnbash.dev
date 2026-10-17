// Site logic that needs no VM: URLs, saved progress and HTTP headers.
import fs from "node:fs";
import { describe, expect, test } from "vitest";
import { headersFor, parseHeaders } from "../scripts/vite-plugin-headers.ts";
import { ProgressStore, STORAGE_KEY } from "../src/site/progress.ts";
import { challengeIdFromPath, challengeUrl } from "../src/site/routes.ts";

class MemoryStorage {
  items = new Map<string, string>();
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
}

describe("routes", () => {
  test("challenge URLs round-trip", () => {
    expect(challengeUrl("look-around")).toBe("/challenges/look-around/");
    expect(challengeIdFromPath("/challenges/look-around/")).toBe("look-around");
    expect(challengeIdFromPath("/challenges/look-around")).toBe("look-around");
  });

  test("other paths are not challenges", () => {
    for (const p of ["/", "/challenges/", "/challenges/a/b/", "/challenges/Bad_Id/", "/challenge.html"]) {
      expect(challengeIdFromPath(p)).toBeUndefined();
    }
  });
});

describe("progress", () => {
  test("is saved and loaded again", () => {
    const storage = new MemoryStorage();
    const p = new ProgressStore(storage);
    p.markSolved("look-around", new Date("2026-01-02T03:04:05Z"));
    p.setHintsShown("find-your-desk", 2);
    const again = new ProgressStore(storage);
    expect(again.isSolved("look-around")).toBe(true);
    expect(again.isSolved("find-your-desk")).toBe(false);
    expect(again.hintsShown("find-your-desk")).toBe(2);
    expect(again.solvedCount(["look-around", "find-your-desk"])).toBe(1);
  });

  test("keeps the first solve date and never hides opened hints", () => {
    const storage = new MemoryStorage();
    const p = new ProgressStore(storage);
    p.markSolved("x", new Date("2026-01-01T00:00:00Z"));
    p.markSolved("x", new Date("2026-02-01T00:00:00Z"));
    p.setHintsShown("x", 3);
    p.setHintsShown("x", 1);
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual({
      solved: { x: "2026-01-01T00:00:00.000Z" },
      hints: { x: 3 },
    });
  });

  test("ignores corrupt saved data", () => {
    for (const raw of ["not json", "[]", '{"solved": [1], "hints": {"x": -1}}']) {
      const storage = new MemoryStorage();
      storage.setItem(STORAGE_KEY, raw);
      const p = new ProgressStore(storage);
      expect(p.solvedCount(["x"])).toBe(0);
      expect(p.hintsShown("x")).toBe(0);
    }
  });

  test("works without storage (private mode, blocked site data)", () => {
    const broken = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    const p = new ProgressStore(broken);
    p.markSolved("x");
    expect(p.isSolved("x")).toBe(true);
    expect(new ProgressStore(undefined).isSolved("x")).toBe(false);
  });
});

describe("_headers (Cloudflare Pages format)", () => {
  const rules = parseHeaders(fs.readFileSync("public/_headers", "utf8"));

  test("every page gets the security headers", () => {
    for (const p of ["/", "/challenges/look-around/", "/licenses/"]) {
      expect(headersFor(rules, p).get("content-security-policy")).toContain("default-src 'self'");
    }
  });

  test("hashed files are cached forever, vm.json never, pages by default", () => {
    expect(headersFor(rules, "/assets/challenge-abc123.js").get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(headersFor(rules, "/vm/state/291b7f762371.bin.zst").get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(headersFor(rules, "/vm/vm.json").get("cache-control")).toBe("no-cache");
    expect(headersFor(rules, "/challenges/look-around/").has("cache-control")).toBe(false);
  });
});
