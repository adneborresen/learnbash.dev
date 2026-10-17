// Generates public/favicon.ico and public/apple-touch-icon.png from
// public/favicon.svg (the one source of the design), and public/og-image.png,
// the picture shown when a link to the site is shared. Run after changing the
// SVG or the preview design: node scripts/make-icons.ts
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { ROOT } from "./lib/paths.ts";
import { OG_IMAGE } from "./vite-plugin-seo.ts";

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

/** The link preview: the landing page's headline and sample terminal. */
async function renderPreview(): Promise<Buffer> {
  await page.setViewportSize({ width: OG_IMAGE.width, height: OG_IMAGE.height });
  await page.setContent(`<!doctype html><style>
    html,body{margin:0;width:${OG_IMAGE.width}px;height:${OG_IMAGE.height}px;background:#121417;color:#e8e8e6;
      font-family:system-ui,"Segoe UI",Roboto,sans-serif}
    main{box-sizing:border-box;height:100%;padding:64px 72px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
    .brand{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:700}
    .brand img{width:56px;height:56px}
    .brand span span{color:#9ba1a8}
    h1{font-size:62px;line-height:1.1;margin:40px 0 24px;letter-spacing:-0.5px}
    p{font-size:28px;color:#9ba1a8;margin:0}
    .term{background:#0b0d10;border:1px solid #2e333a;border-radius:16px;padding:28px 30px;
      font:24px/1.65 "Cascadia Mono",Consolas,"DejaVu Sans Mono",monospace;white-space:pre}
    .p{color:#6fdc8c;font-weight:700}.d{color:#6d9bff;font-weight:700}.c{background:#e8e8e6}
    .ok{margin-top:18px;padding:10px 16px;border-radius:10px;background:#16281d;color:#6fdc8c;font-size:24px}
  </style><main>
    <div>
      <div class="brand"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"><span>learnbash<span>.dev</span></span></div>
      <h1>Learn Bash in a real Linux terminal</h1>
      <p>Right in your browser. Free, nothing to install, no sign-up.</p>
    </div>
    <div><div class="term"><span class="p">$</span> ls
<span class="d">logs</span>  <span class="d">projects</span>  todo.txt
<span class="p">$</span> grep ERROR app.log | wc -l
71
<span class="p">$</span> <span class="c"> </span></div><div class="ok">✔ Correct! 71 errors.</div></div>
  </main>`);
  return page.screenshot({ type: "png" });
}

fs.writeFileSync(path.join(ROOT, "public/favicon.ico"), ico(await render(32, false), 32));
fs.writeFileSync(path.join(ROOT, "public/apple-touch-icon.png"), await render(180, true));
fs.writeFileSync(path.join(ROOT, `public${OG_IMAGE.path}`), await renderPreview());
await browser.close();
console.log(`wrote public/favicon.ico, public/apple-touch-icon.png and public${OG_IMAGE.path}`);
