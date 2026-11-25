#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Static site generator for Kingdom Assembly Missions. No dependencies.

     node build.mjs            build into dist/
     node build.mjs --serve    build, then serve dist/ on :4500 and rebuild
                               on every request

   Every page is a plain object { path, title, description, body }. The layout
   wraps it. One nav, one footer, one head, five pages plus privacy and 404.
   ------------------------------------------------------------------------- */

import { mkdir, writeFile, readdir, copyFile, rm, stat } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createServer } from "node:http";
import { dirname, join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const STATIC = join(ROOT, "static");

/* Where the site is served from.
   BASE_PATH is "" for a site at the root of its own domain, and "/kam-live"
   (no trailing slash) for a GitHub project Pages URL. Every page is authored
   with root-absolute paths; the prefix is applied once here rather than being
   threaded through every page module. */
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");

/* Rewrite root-absolute internal URLs. Leaves //host, http(s):, mailto:, tel:
   and #anchors alone. */
function rebase(html) {
  if (!BASE) return html;
  return html.replace(/\b(href|src|content)="\/(?!\/)/g, `$1="${BASE}/`);
}

const run = promisify(execFile);

/* In serve mode every rebuild runs in a FRESH child process.
   Cache-busting the top-level imports with a query string is not enough: those
   modules statically import config/layout/mending, and Node caches THOSE, so a
   long-running server keeps rendering the first version of anything one level
   down. It fails silently, which is the worst kind. A child process cannot. */
async function rebuild() {
  await run(process.execPath, [new URL(import.meta.url).pathname], { cwd: ROOT });
}

async function collect() {
  const bust = `?t=${Date.now()}`;
  const { render, redirectPage } = await import("./src/layout.mjs" + bust);
  const { site } = await import("./src/config.mjs" + bust);
  const { home } = await import("./src/pages/home.mjs" + bust);
  const inner = await import("./src/pages/inner.mjs" + bust);

  // Five pages (Selvin 2026-11-25), plus the privacy policy and the 404.
  const pages = [
    home(),
    inner.about(),
    inner.outreach(),
    inner.getInvolved(),
    inner.donate(),
    inner.privacy(),
    inner.notFound(),
  ];

  return { pages, render, redirectPage, site };
}

/* Retired addresses (the pre-2026-11-25 site). Each becomes a tiny noindex
   stub that forwards to the page that replaced it, so an old link or search
   result lands somewhere real and none of the old content stays reachable. */
const REDIRECTS = {
  "/mission/": "/about/",
  "/stories/": "/about/",
  "/programs/": "/outreach/",
  "/programs/homelessness/": "/outreach/",
  "/programs/mental-health/": "/outreach/",
  "/programs/youth/": "/outreach/",
  "/programs/womens-support/": "/outreach/",
  "/programs/recovery/": "/outreach/",
  "/events/": "/outreach/",
  "/gallery/": "/outreach/#photos",
  "/discipleship/": "/#bible-study",
  "/bible-study/": "/#bible-study",
  "/news/": "/",
  "/need-help/": "/",
  "/give/": "/donate/",
  "/volunteer/": "/get-involved/#volunteer",
  "/partner/": "/get-involved/#contact",
  "/prayer/": "/get-involved/#contact",
  "/contact/": "/get-involved/#contact",
};

function outPath(p) {
  if (p === "/") return join(DIST, "index.html");
  if (p.endsWith(".html")) return join(DIST, p.replace(/^\//, ""));
  return join(DIST, p.replace(/^\//, "").replace(/\/$/, ""), "index.html");
}

async function copyDir(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const a = join(from, entry.name);
    const b = join(to, entry.name);
    if (entry.isDirectory()) await copyDir(a, b);
    else await copyFile(a, b);
  }
}

async function build() {
  const { pages, render, redirectPage, site } = await collect();

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  for (const page of pages) {
    const file = outPath(page.path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, rebase(render(page)), "utf8");
  }

  for (const [from, to] of Object.entries(REDIRECTS)) {
    const file = outPath(from);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, rebase(redirectPage(from, to)).replace(/(url=|location\.replace\(")\//g, `$1${BASE}/`), "utf8");
  }

  await copyDir(STATIC, DIST);

  const origin = site.origin.replace(/\/$/, "");
  const urls = pages
    .filter((p) => !p.noindex && !p.path.endsWith(".html"))
    .map(
      (p) =>
        `  <url><loc>${origin}${p.path}</loc><changefreq>${p.path === "/" ? "weekly" : "monthly"}</changefreq><priority>${p.path === "/" ? "1.0" : "0.7"}</priority></url>`
    )
    .join("\n");

  await writeFile(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    "utf8"
  );

  /* A preview served from a project Pages URL must not be indexed: it would
     compete with the real domain for the same content. */
  await writeFile(
    join(DIST, "robots.txt"),
    BASE
      ? `# Preview build. Not the live site.\nUser-agent: *\nDisallow: /\n`
      : `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
    "utf8"
  );

  // GitHub Pages must not run Jekyll over this.
  await writeFile(join(DIST, ".nojekyll"), "", "utf8");

  return pages;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

async function serve(port) {
  createServer(async (req, res) => {
    let url = decodeURIComponent(req.url.split("?")[0]);

    // Rebuild on navigation so an edit shows on refresh.
    if (!extname(url)) {
      try { await rebuild(); }
      catch (e) {
        res.writeHead(500, { "content-type": "text/plain" });
        return res.end("Build failed:\n\n" + (e && e.stack ? e.stack : e));
      }
    }

    let file = join(DIST, url.replace(/^\//, ""));
    if (url.endsWith("/") || !extname(url)) file = join(DIST, url.replace(/^\//, ""), "index.html");

    if (!resolve(file).startsWith(resolve(DIST))) {
      res.writeHead(403); return res.end("no");
    }
    if (!existsSync(file)) {
      const nf = join(DIST, "404.html");
      res.writeHead(404, { "content-type": MIME[".html"] });
      return existsSync(nf) ? createReadStream(nf).pipe(res) : res.end("404");
    }
    const s = await stat(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] || "application/octet-stream",
      "content-length": s.size,
      "cache-control": "no-store",
    });
    createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`kam-site on http://localhost:${port}`));
}

const pages = await build();
console.log(`built ${pages.length} pages into dist/`);
for (const p of pages) console.log("  " + p.path);

if (process.argv.includes("--serve")) {
  const i = process.argv.indexOf("--port");
  await serve(i > -1 ? Number(process.argv[i + 1]) : 4500);
}
