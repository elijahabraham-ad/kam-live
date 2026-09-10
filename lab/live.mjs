import { chromium } from "playwright-core";
const ROOT = process.argv[2];
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("pageerror", e => errs.push("pageerror: " + e.message));
p.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
p.on("requestfailed", r => errs.push("failed: " + r.url() + " " + (r.failure()?.errorText||"")));

await p.goto(ROOT, { waitUntil: "networkidle" });
await p.waitForSelector("html.sc-ready", { timeout: 20000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);

// Crawl every internal link found on the homepage and confirm each resolves.
const hrefs = await p.$$eval("a[href]", as => [...new Set(as.map(a => a.href))]);
const internal = hrefs.filter(h => h.startsWith("https://elijahabraham-ad.github.io/"));
let broken = [];
for (const h of internal) { const r = await p.request.get(h); if (!r.ok()) broken.push(h + " " + r.status()); }

const info = await p.evaluate(() => ({
  fontLoaded: document.fonts.check('16px Fraunces'),
  h1: document.querySelector("h1")?.textContent.trim(),
  emblemNatural: document.querySelector(".title-page__seal img")?.naturalWidth || 0,
  shards: document.querySelectorAll(".mend__frag").length,
  seams: document.querySelectorAll(".mend__seam").length,
  seamDash: document.querySelector(".mend__seam")?.style.strokeDasharray || "",
  acts: [...document.querySelectorAll("[data-sc-act]")].map(a => a.getAttribute("data-sc-act")).join(" > "),
  vh: (document.documentElement.scrollHeight / innerHeight).toFixed(1),
}));
console.log(JSON.stringify(info, null, 2));
console.log("internal links checked:", internal.length, broken.length ? "BROKEN: " + broken.join(", ") : "all ok");

// Scroll the peak and photograph the finished vessel from the live site.
const act = await p.evaluate(() => { const r = document.querySelector("#mending").getBoundingClientRect(); return { top: r.top + scrollY, height: r.height }; });
await p.evaluate(v => scrollTo(0, v), Math.round(act.top + (act.height - 900) * 0.82));
await p.waitForTimeout(900);
await p.screenshot({ path: "lab/live-peak.png" });
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(700);
await p.screenshot({ path: "lab/live-home.png" });

console.log(errs.length ? "ERRORS:\n  " + errs.join("\n  ") : "no page errors, no failed requests");
await b.close();
