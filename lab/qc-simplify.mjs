/* QC for the 2026-11-25 simplification. Never emails KAM: the forms endpoint
   is stubbed. Usage: node lab/qc-simplify.mjs http://localhost:4500 outdir */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASE = process.argv[2] || "http://localhost:4500";
const OUT = process.argv[3] || "lab/simplify";
mkdirSync(OUT, { recursive: true });
const PAGES = ["/", "/about/", "/outreach/", "/get-involved/", "/donate/", "/privacy/", "/404.html"];
const fails = [], notes = [];
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const posted = [];
async function ctx(vp, opts = {}) {
  const c = await b.newContext({ viewport: vp, deviceScaleFactor: 1, ...opts });
  await c.route("https://kam-forms.adova.workers.dev/**", async (r) => { posted.push(r.request().postData() || ""); await r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  await c.route("https://kam-forms.adova.workers.dev", async (r) => { posted.push(r.request().postData() || ""); await r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  return c;
}
const links = new Set();
for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const c = await ctx(vp);
  const p = await c.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  for (const path of PAGES) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    // scroll through to trigger reveals
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(60); }
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(1400);
    const r = await p.evaluate(() => {
      const ow = document.documentElement.scrollWidth - innerWidth;
      const hidden = [...document.querySelectorAll("[data-sc-in], [data-sc-stagger] > *")].filter((e) => +getComputedStyle(e).opacity < 0.2).length;
      const hrefs = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
      const imgsBroken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== "lazy").map((i) => i.src);
      return { ow, hidden, hrefs, imgsBroken };
    });
    r.hrefs.forEach((h) => links.add(h));
    if (r.ow > 1) fails.push(`${name} ${path}: horizontal overflow ${r.ow}px`);
    if (r.hidden) fails.push(`${name} ${path}: ${r.hidden} reveal blocks still invisible`);
    if (r.imgsBroken.length) fails.push(`${name} ${path}: broken images ${r.imgsBroken.join(", ")}`);
    await p.evaluate(() => scrollTo(0, 0));
    const slug = path === "/" ? "home" : path.replace(/\W+/g, "-").replace(/^-|-$/g, "");
    await p.screenshot({ path: `${OUT}/${name}_${slug}.png`, fullPage: true });
  }
  // header buttons visible in the bar at this width
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const bar = await p.evaluate(() => [".bar__bible", ".bar__give"].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { s, ok: r.width > 0 && r.right <= innerWidth && r.left >= 0, h: r.height }; }));
  bar.forEach((x) => { if (!x.ok) fails.push(`${name}: ${x.s} not fully visible in the bar`); if (x.h < 44) fails.push(`${name}: ${x.s} tap target ${x.h}px`); });
  if (name === "mobile") {
    await p.click("[data-menu-open]");
    const items = await p.$$eval(".menu__nav a", (a) => a.map((x) => x.textContent.trim()));
    if (items.join("|") !== "Home|About Us|Our Outreach|Get Involved|Donate") fails.push("mobile menu items: " + items.join("|"));
    const bs = await p.isVisible(".menu__foot .btn");
    if (!bs) fails.push("mobile menu: Join Bible Study button not visible");
    await p.screenshot({ path: `${OUT}/mobile_menu.png` });
    await p.click("[data-menu-close]");
  } else {
    const nav = await p.$$eval(".bar__nav a", (a) => a.map((x) => x.textContent.trim()));
    notes.push("desktop bar nav: " + nav.join(" | ") + " + Join Bible Study + Donate");
  }
  if (errs.length) fails.push(`${name} console: ${[...new Set(errs)].join(" / ")}`);
  await c.close();
}
// every internal link resolves
const c = await ctx({ width: 1200, height: 800 });
const p = await c.newPage();
for (const h of links) {
  if (!h.startsWith("/")) { notes.push("external link: " + h); continue; }
  const res = await p.request.get(BASE + h.split("#")[0]);
  if (res.status() !== 200) fails.push(`link ${h} -> ${res.status()}`);
}
// Bible study fallback preselects the topic
const bib = [...links].find((h) => h.includes("topic="));
if (bib) {
  await p.goto(BASE + bib, { waitUntil: "networkidle" });
  const v = await p.$eval('#contact select[name="topic"]', (s) => s.value);
  const m = await p.$eval('#contact textarea[name="message"]', (s) => s.value);
  if (v !== "Join the Bible study") fails.push("bible fallback: topic = " + v);
  notes.push(`bible fallback ${bib}: topic="${v}", message="${m}"`);
} else notes.push("Bible study links go straight to the Zoom URL");
// forms submit (stubbed)
for (const id of ["contact", "volunteer"]) {
  await p.goto(BASE + "/get-involved/", { waitUntil: "networkidle" });
  const f = `form[data-kam-form="${id}"]`;
  await p.click(`${f} button[type=submit]`);
  const err = await p.textContent(`${f} .form__status`);
  if (!/fill in/i.test(err)) fails.push(`${id}: empty submit not blocked (${err})`);
  await p.fill(`${f} input[name=name]`, "QC Test");
  await p.fill(`${f} input[name=email]`, "qc@example.com");
  if (id === "contact") { await p.selectOption(`${f} select[name=topic]`, "General question"); await p.fill(`${f} textarea[name=message]`, "QC test, please ignore."); }
  else await p.check(`${f} input[value="Monthly feeding outreach"]`);
  const before = posted.length;
  await p.click(`${f} button[type=submit]`);
  await p.waitForTimeout(600);
  const ok = await p.textContent(`${f} .form__status`);
  if (posted.length !== before + 1 || !/thank/i.test(ok)) fails.push(`${id}: submit failed (${ok})`);
  else if (!posted[posted.length - 1].includes(`name="_form"\r\n\r\n${id}`)) fails.push(`${id}: _form not ${id}`);
}
// retired URLs forward
for (const [from, to] of [["/need-help/", "/"], ["/give/", "/donate/"], ["/programs/recovery/", "/outreach/"], ["/prayer/", "/get-involved/"], ["/gallery/", "/outreach/"]]) {
  await p.goto(BASE + from, { waitUntil: "networkidle" });
  const u = new URL(p.url());
  if (u.pathname !== to) fails.push(`redirect ${from} landed on ${u.pathname}`);
}
await b.close();
console.log(notes.join("\n"));
console.log(fails.length ? "FAIL\n" + fails.join("\n") : "ALL PASS");
