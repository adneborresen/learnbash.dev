// Generates public/favicon.ico and public/apple-touch-icon.png from
// public/favicon.svg (the one source of the design). Run after changing the
// SVG: node scripts/make-icons.ts
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { ROOT } from "./lib/paths.ts";

const svg = fs.readFileSync(path.join(ROOT, "public/favicon.svg"), "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();

async function render(size: number, fullBleed: boolean): Promise<Buffer> {
  // iOS rounds the corners of home-screen icons itself, so that one is square.
  const source = fullBleed ? svg.replace(/ rx="14"/, "") : svg;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}img{display:block;width:${size}px;height:${size}px}</style>` +
      `<img src="data:image/svg+xml;base64,${Buffer.from(source).toString("base64")}">`,
  );
  return page.screenshot({ omitBackground: true, type: "png" });
}

/** An .ico file holding one PNG image (supported by every current browser). */
function ico(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6); // width
  header.writeUInt8(size, 7); // height
  header.writeUInt8(0, 8); // no palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([header, png]);
}

fs.writeFileSync(path.join(ROOT, "public/favicon.ico"), ico(await render(32, false), 32));
fs.writeFileSync(path.join(ROOT, "public/apple-touch-icon.png"), await render(180, true));
await browser.close();
console.log("wrote public/favicon.ico and public/apple-touch-icon.png");
