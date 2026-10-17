// Makes `vite preview` send the headers from public/_headers (the Cloudflare
// Pages format), so the browser tests exercise the real Content-Security-Policy
// and caching rules before anything is deployed.
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export interface HeaderRule {
  pattern: RegExp;
  headers: Array<[string, string]>;
}

/** Parses the _headers format: a path line, then indented "Name: value" lines. */
export function parseHeaders(text: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      const source = line
        .trim()
        .split("*")
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/:\w+/g, "[^/]+"))
        .join(".*");
      rules.push({ pattern: new RegExp(`^${source}$`), headers: [] });
      continue;
    }
    const m = /^\s+([^:]+):\s*(.*)$/.exec(line);
    if (!m || rules.length === 0) throw new Error(`_headers: can't parse line: ${line}`);
    rules[rules.length - 1].headers.push([m[1].trim(), m[2].trim()]);
  }
  return rules;
}

/** Like Cloudflare Pages: every matching rule applies; repeated headers are joined. */
export function headersFor(rules: HeaderRule[], pathname: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const rule of rules) {
    if (!rule.pattern.test(pathname)) continue;
    for (const [name, value] of rule.headers) {
      const key = name.toLowerCase();
      out.set(key, out.has(key) ? `${out.get(key)}, ${value}` : value);
    }
  }
  return out;
}

export function headersPlugin(): Plugin {
  return {
    name: "learnbash-headers",
    configurePreviewServer(server) {
      const file = path.resolve(server.config.root, server.config.build.outDir, "_headers");
      const rules = fs.existsSync(file) ? parseHeaders(fs.readFileSync(file, "utf8")) : [];
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
        for (const [name, value] of headersFor(rules, pathname)) res.setHeader(name, value);
        next();
      });
    },
  };
}
