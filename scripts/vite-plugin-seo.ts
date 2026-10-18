// Vite plugin: what search engines and link previews see.
// - Every public page gets a canonical URL (the site is also reachable at
//   learnbash.pages.dev) and Open Graph tags, so a shared link shows a title,
//   a summary and a picture. Challenge pages get theirs from the challenges
//   plugin, which writes them after the build (withHeadTags below).
// - The build writes sitemap.xml with every page and robots.txt pointing to it.
import type { Plugin } from "vite";
import { challengeUrl, HOME_URL, LICENSES_URL, PRIVACY_URL, SITE_ORIGIN } from "../src/site/routes.ts";
import { loadChallenges } from "./lib/challenges.ts";

/** Made by scripts/make-icons.ts. */
export const OG_IMAGE = { path: "/og-image.png", width: 1200, height: 630 };

/** Built page (path in the project) → its public URL. challenge.html and 404.html aren't listed. */
const PAGES: Record<string, string> = {
  "/index.html": HOME_URL,
  "/licenses/index.html": LICENSES_URL,
  "/privacy/index.html": PRIVACY_URL,
};

/**
 * Adds the canonical link and preview tags to a page, using its own <title>
 * and meta description (already HTML-escaped, so they are reused as they are).
 */
export function withHeadTags(html: string, url: string): string {
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  const description = /<meta name="description" content="([^"]*)">/.exec(html)?.[1];
  if (!title || !description) throw new Error(`${url}: a page needs a <title> and a meta description`);
  const tags = [
    `<link rel="canonical" href="${SITE_ORIGIN}${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="learnbash.dev">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${SITE_ORIGIN}${url}">`,
    `<meta property="og:image" content="${SITE_ORIGIN}${OG_IMAGE.path}">`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}">`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}">`,
    `<meta property="og:image:alt" content="A terminal running grep: learn Bash in a real Linux terminal, in your browser.">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ];
  return html.replace("</head>", () => tags.map((t) => `  ${t}\n`).join("") + "</head>");
}

export function sitemap(urls: string[]): string {
  const entries = urls.map((u) => `  <url><loc>${SITE_ORIGIN}${u}</loc></url>\n`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}</urlset>\n`;
}

export function seoPlugin(): Plugin {
  return {
    name: "learnbash-seo",
    transformIndexHtml(html, ctx) {
      const url = PAGES[ctx.path];
      return url ? withHeadTags(html, url) : html;
    },
    generateBundle() {
      const urls = [HOME_URL, ...loadChallenges().challenges.map((c) => challengeUrl(c.meta.id)), LICENSES_URL, PRIVACY_URL];
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap(urls) });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
      });
    },
  };
}
