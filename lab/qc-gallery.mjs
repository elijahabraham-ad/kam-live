/* QC for the photos-and-video round (2026-11-16).
   Run with the dev server up (node build.mjs --serve) and SCROLLCRAFT_CHROME
   pointed at the LINUX chromium:
     SCROLLCRAFT_CHROME=~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome node lab/qc-gallery.mjs lab/gal
   Checks every gallery image decodes, every media URL answers 200, nothing
   scrolls sideways on a phone, the reel plays only on screen and never under
   reduced motion, and no file published carries GPS (checked separately with
   exiftool, see the session log). Screenshots land in the out dir. */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const OUT = process.argv[2] || "lab/gal";
const BASE = "http://localhost:4500";
await mkdir(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const fails = [];
const note = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) fails.push(msg); };

async function walk(p) {
  await p.waitForSelector("html.sc-ready", { timeout: 12000 }).catch(() => {});
  await p.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 350) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
  });
  await p.waitForTimeout(900);
}

async function checkPage(p, path, tag) {
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  await walk(p);
  const r = await p.evaluate(async () => {
    // Only images actually rendered at this width (the strip hides its third photo on phones).
    const imgs = [...document.querySelectorAll(".shots img, .reel-strip img")].filter((i) => i.getClientRects().length);
    // Bring each lazy image on screen and make the browser actually decode it.
    for (const i of imgs) {
      i.scrollIntoView({ block: "center" });
      await Promise.race([i.decode().catch(() => {}), new Promise((r) => setTimeout(r, 4000))]);
    }
    const broken = imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.currentSrc || i.src);
    const urls = [...new Set([
      ...[...document.querySelectorAll("video source")].map((s) => s.src),
      ...[...document.querySelectorAll("video[poster]")].map((v) => v.poster),
      ...imgs.flatMap((i) => (i.srcset ? i.srcset.split(",").map((x) => new URL(x.trim().split(" ")[0], location.href).href) : [i.src])),
    ])];
    const bad = [];
    for (const u of urls) { const res = await fetch(u, { method: "HEAD" }); if (!res.ok) bad.push(`${res.status} ${u}`); }
    const noAlt = imgs.filter((i) => !i.alt).length + [...document.querySelectorAll(".shots video")].filter((v) => !v.getAttribute("aria-label")).length;
    return { n: imgs.length, vids: document.querySelectorAll("video").length, broken, bad, urls: urls.length, noAlt,
      overflow: document.documentElement.scrollWidth - innerWidth, footer: !!document.querySelector('.foot a[href="/gallery/"]') };
  });
  note(r.broken.length === 0, `${tag} ${path}: ${r.n} images decode${r.broken.length ? " BROKEN " + r.broken.join(", ") : ""}`);
  note(r.bad.length === 0, `${tag} ${path}: ${r.urls} media URLs answer 200${r.bad.length ? " BAD " + r.bad.join(", ") : ""}`);
  note(r.noAlt === 0, `${tag} ${path}: every image and clip has alt text`);
  note(r.overflow <= 0, `${tag} ${path}: no sideways scroll (overflow ${r.overflow}px)`);
  note(r.footer, `${tag} ${path}: footer links to /gallery/`);
  note(errs.length === 0, `${tag} ${path}: no page errors${errs.length ? " " + errs.join(" | ") : ""}`);
  return r;
}

for (const [tag, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: tag === "mobile" ? 2 : 1 });
  const p = await ctx.newPage();
  for (const path of ["/gallery/", "/programs/homelessness/", "/about/"]) {
    await checkPage(p, path, tag);
    const name = `${tag}${path.replace(/\//g, "_")}`.replace(/_$/, "");
    if (path === "/gallery/") await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    else await p.locator("#gallery").screenshot({ path: `${OUT}/${name}-gallery.png` });
  }

  // Homepage: the reel under the tabling promise.
  await checkPage(p, "/", tag);
  const can = await p.evaluate(() => document.createElement("video").canPlayType('video/mp4; codecs="avc1.640028"'));
  await p.locator("#tabling").scrollIntoViewIfNeeded();
  await p.waitForTimeout(2500);
  const rv = await p.evaluate(() => { const v = document.querySelector(".reel__v"); return { t: v.currentTime, paused: v.paused, controls: v.controls, muted: v.muted }; });
  if (can) note(rv.t > 0 && !rv.paused && rv.muted, `${tag} reel plays muted when on screen (t=${rv.t.toFixed(2)})`);
  else console.log(`SKIP  ${tag} reel playback: this chromium has no H.264 (canPlayType=""), check in real Chrome`);
  await p.locator("#tabling").screenshot({ path: `${OUT}/${tag}_home-tabling.png` });
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  const off = await p.evaluate(() => document.querySelector(".reel__v").paused);
  note(off, `${tag} reel pauses once scrolled away`);
  await ctx.close();
}

// Reduced motion: poster and controls, never autoplay.
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.locator("#tabling").scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  const rv = await p.evaluate(() => { const v = document.querySelector(".reel__v"); return { paused: v.paused, controls: v.controls }; });
  note(rv.paused && rv.controls, "reduced motion: reel stays still and shows controls");
  await ctx.close();
}

await b.close();
console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
