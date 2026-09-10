import { chromium } from "playwright-core";
const BASE = "http://localhost:4500";
const PATHS = ["/", "/about/", "/mission/", "/programs/", "/programs/mental-health/",
  "/programs/homelessness/", "/programs/youth/", "/programs/womens-support/",
  "/programs/recovery/", "/discipleship/", "/events/", "/give/",
  "/get-involved/", "/volunteer/", "/partner/", "/stories/", "/prayer/",
  "/contact/", "/need-help/", "/404.html"];
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });

/* ---- 1. horizontal overflow at 390 and 1440, plus dup ids, meta, lang ---- */
for (const W of [390, 1440]) {
  console.log("\n######## viewport " + W);
  const p = await b.newPage({ viewport: { width: W, height: W === 390 ? 844 : 900 } });
  for (const path of PATHS) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    await p.waitForSelector("html.sc-ready", { timeout: 12000 }).catch(() => {});
    await p.evaluate(() => document.fonts.ready);
    // scroll through so everything lays out
    await p.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y=0;y<h;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,18));} scrollTo(0,0); });
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const over = [];
      if (de.scrollWidth > innerWidth + 1) {
        // find the culprits
        document.querySelectorAll("*").forEach((el) => {
          const b = el.getBoundingClientRect();
          if (b.width > 0 && (b.right > innerWidth + 2 || b.left < -2)) {
            over.push(el.tagName.toLowerCase() + "." + String(el.className).slice(0,34) + " L" + Math.round(b.left) + " R" + Math.round(b.right) + " W" + Math.round(b.width));
          }
        });
      }
      const ids = {}; const dups = [];
      document.querySelectorAll("[id]").forEach(e => { ids[e.id] = (ids[e.id]||0)+1; });
      for (const k in ids) if (ids[k] > 1) dups.push(k + " x" + ids[k]);
      const m = (s) => document.querySelector(s)?.getAttribute("content") || document.querySelector(s)?.getAttribute("href") || null;
      return {
        scrollW: de.scrollWidth, inner: innerWidth,
        culprits: [...new Set(over)].slice(0, 8),
        dups,
        title: document.title,
        desc: m('meta[name=description]'),
        descLen: (m('meta[name=description]')||"").length,
        ogt: m('meta[property="og:title"]'),
        ogi: m('meta[property="og:image"]'),
        canon: document.querySelector('link[rel=canonical]')?.href,
        icon: document.querySelector('link[rel=icon]')?.getAttribute('href'),
        h1count: document.querySelectorAll("h1").length,
        h1: document.querySelector("h1")?.textContent.trim().slice(0,60),
        imgsNoAlt: [...document.querySelectorAll("img:not([alt])")].map(i=>i.src.split("/").pop()),
        emptyLinks: [...document.querySelectorAll("a")].filter(a=>!a.textContent.trim() && !a.getAttribute("aria-label") && !a.querySelector("img[alt]:not([alt=''])")).length,
      };
    });
    const flag = r.scrollW > r.inner + 1 ? "  *** H-OVERFLOW " + r.scrollW + ">" + r.inner : "";
    console.log(`${path}${flag}`);
    if (r.culprits.length) r.culprits.forEach(c => console.log("      " + c));
    if (r.dups.length) console.log("      DUP IDS: " + r.dups.join(", "));
    if (r.h1count !== 1) console.log("      H1 COUNT = " + r.h1count);
    if (r.imgsNoAlt.length) console.log("      IMG NO ALT: " + r.imgsNoAlt);
    if (r.emptyLinks) console.log("      EMPTY LINKS: " + r.emptyLinks);
    if (W === 1440) console.log(`      title="${r.title}" (${r.title.length})\n      desc=${r.descLen}ch canon=${r.canon} icon=${r.icon}\n      ogi=${r.ogi}`);
  }
  await p.close();
}
await b.close();
