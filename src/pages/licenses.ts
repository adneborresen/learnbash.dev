// The licenses page, filled from build-time data (virtual:licenses).
import "../site/site.css";
import "./doc.css";
import data from "virtual:licenses";

const $ = (id: string) => document.getElementById(id)!;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) => {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
};
const link = (href: string, text: string) => {
  const a = el("a", text);
  a.href = href;
  a.rel = "noopener";
  return a;
};

$("alpine-version").textContent = data.alpineVersion;
($("sources-link") as HTMLAnchorElement).href = data.sourcesUrl;
($("recipe-link") as HTMLAnchorElement).href = data.recipeUrl;

const rows = $("linux-packages");
for (const p of data.linux) {
  const tr = el("tr");
  const name = el("td");
  name.append(link(p.url, p.origin));
  const parts = el("td", p.binaries.join(", "));
  parts.className = "parts";
  tr.append(name, el("td", p.version), el("td", p.license), parts);
  rows.append(tr);
}

const web = $("web-components");
for (const c of data.web) {
  const details = el("details");
  const summary = el("summary");
  summary.append(el("strong", c.name), ` ${c.version} · ${c.license} · `, link(c.homepage, "website"));
  details.append(summary, el("pre", c.text));
  web.append(details);
}
