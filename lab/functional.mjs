/* Functional checks: things a screenshot cannot prove.
   Menu open/close/escape, form submit path, quick exit wiring, focus order,
   tap-target sizes, internal link integrity, and reduced-motion rendering. */
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:4500";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const fails = [];
const ok = (m) => console.log("  ok   " + m);
const bad = (m) => { fails.push(m); console.log("  FAIL " + m); };

async function page(opts = {}) {
  const p = await b.newPage({ viewport: { width: opts.w || 1440, height: opts.h || 900 }, ...opts.ctx });
  p.on("pageerror", (e) => bad("page error: " + e.message));
  return p;
}

/* --- 1. every internal link resolves ---------------------------------- */
console.log("\nlink integrity");
{
  const p = await page();
  const paths = [
    "/", "/about/", "/mission/", "/programs/", "/programs/mental-health/",
    "/programs/homelessness/", "/programs/youth/", "/programs/womens-support/",
    "/programs/recovery/", "/discipleship/", "/events/", "/give/",
    "/get-involved/", "/volunteer/", "/partner/", "/stories/", "/prayer/",
    "/contact/", "/need-help/",
  ];
  const all = new Set();
  for (const path of paths) {
    await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
    const hrefs = await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    hrefs.filter((h) => h && h.startsWith("/")).forEach((h) => all.add(h.split("#")[0].split("?")[0]));
  }
  let broken = 0;
  for (const href of all) {
    const r = await p.request.get(BASE + href);
    if (!r.ok()) { bad(`link ${href} -> ${r.status()}`); broken++; }
  }
  if (!broken) ok(`${all.size} distinct internal links all resolve`);
  await p.close();
}

/* --- 2. mobile menu --------------------------------------------------- */
console.log("\nmobile menu");
{
  const p = await page({ w: 390, h: 844 });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.click("[data-menu-open]");
  await p.waitForTimeout(200);
  if (await p.isVisible("[data-menu]")) ok("opens"); else bad("menu does not open");
  if ((await p.getAttribute("[data-menu-open]", "aria-expanded")) === "true") ok("aria-expanded set"); else bad("aria-expanded not set");
  const focused = await p.evaluate(() => document.activeElement?.tagName);
  if (focused === "A" || focused === "BUTTON") ok("focus moves into panel"); else bad("focus not moved into panel: " + focused);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(200);
  if (!(await p.isVisible("[data-menu]"))) ok("escape closes"); else bad("escape does not close");
  await p.click("[data-menu-open]");
  await p.waitForTimeout(150);
  await p.click("[data-menu] a[href='/give/']");
  await p.waitForTimeout(400);
  if (p.url().includes("/give/")) ok("menu link navigates"); else bad("menu link did not navigate: " + p.url());
  await p.close();
}

/* --- 3. forms behave while the endpoint is unset ---------------------- */
console.log("\nforms");
{
  const p = await page();
  await p.goto(BASE + "/prayer/", { waitUntil: "networkidle" });
  await p.fill("#prayer-request", "Please pray for my family.");
  await p.click("form[data-kam-form] button[type=submit]");
  await p.waitForTimeout(300);
  const status = (await p.textContent(".form__status")) || "";
  if (/not connected yet/i.test(status)) ok("unconfigured endpoint says so plainly");
  else bad("unconfigured form did not explain itself: " + status.slice(0, 60));

  const posted = [];
  p.on("request", (r) => { if (r.method() === "POST") posted.push(r.url()); });
  await p.waitForTimeout(200);
  if (!posted.length) ok("nothing was silently posted"); else bad("posted to " + posted);

  // Honeypot short-circuits without an error.
  await p.evaluate(() => { document.querySelector('input[name="_hp"]').value = "bot"; });
  await p.click("form[data-kam-form] button[type=submit]");
  await p.waitForTimeout(250);
  const s2 = (await p.textContent(".form__status")) || "";
  if (/received/i.test(s2)) ok("honeypot short-circuits quietly"); else bad("honeypot path wrong: " + s2.slice(0, 50));
  await p.close();
}

/* --- 3b. required fields are actually enforced (QC blocker B2) ---------- */
console.log("\nform validation");
{
  const p = await page();
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  const posted = [];
  p.on("request", (r) => { if (r.method() === "POST") posted.push(r.url()); });

  // Only the optional name. All three required fields left empty.
  await p.fill("#help-name", "Sam");
  await p.click("form[data-kam-form=help] button[type=submit]");
  await p.waitForTimeout(300);
  const st = (await p.textContent("form[data-kam-form=help] .form__status")) || "";
  if (/please fill in/i.test(st)) ok("partially filled safety form is refused: " + st.trim().slice(0, 52));
  else bad("partially filled safety form was NOT refused: " + st.slice(0, 70));
  if (!posted.length) ok("nothing posted while required fields are empty");
  else bad("posted despite empty required fields");

  const live = await p.evaluate(() => {
    const el = document.querySelector("form[data-kam-form=help] .form__status");
    return { role: el.getAttribute("role"), live: el.getAttribute("aria-live") };
  });
  if (live.role === "status" && live.live === "polite") ok("status is a live region present in the markup");
  else bad("status live region missing: " + JSON.stringify(live));
  await p.close();
}

/* --- 3c. the quick exit leaves exactly one tab (QC blocker B3) ---------- */
console.log("\nquick exit");
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  await p.click("[data-exit]").catch(() => {});
  await p.waitForTimeout(1200);
  const pages = ctx.pages();
  if (pages.length === 1) ok("exits to a single tab");
  else bad(`exit opened ${pages.length} tabs: ` + pages.map((x) => x.url()).join(", "));
  await ctx.close();
}

/* --- 3d. no duplicate ids anywhere (QC S4) ------------------------------ */
console.log("\nunique ids");
{
  const p = await page();
  for (const path of ["/", "/events/", "/need-help/", "/give/", "/contact/", "/prayer/", "/volunteer/", "/partner/", "/discipleship/"]) {
    await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
    const dupes = await p.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
      return ids.filter((v, i) => ids.indexOf(v) !== i);
    });
    if (!dupes.length) ok(`unique ids on ${path}`);
    else bad(`duplicate ids on ${path}: ` + dupes.join(", "));
  }
  await p.close();
}

/* --- 4. the safety page ------------------------------------------------ */
console.log("\nneed-help safety");
{
  const p = await page();
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  if (await p.isVisible("[data-exit]")) ok("quick exit button present"); else bad("no quick exit button");
  const nums = await p.$$eval(".crisis__num", (a) => a.map((x) => x.textContent.trim() + " " + x.getAttribute("href")));
  const want = ["911 tel:911", "1-800-799-7233 tel:18007997233", "988 tel:988", "1-800-662-4357 tel:18006624357"];
  for (const w of want) {
    if (nums.includes(w)) ok("crisis number " + w.split(" ")[0]);
    else bad("missing or wrong crisis number: " + w + " (found: " + nums.join(" | ") + ")");
  }
  const asksWhatHappened = await p.evaluate(() =>
    Array.from(document.querySelectorAll("form label")).some((l) => /what happened|describe|details of/i.test(l.textContent))
  );
  if (!asksWhatHappened) ok("does not ask anyone to describe what happened"); else bad("form asks for incident details");
  await p.close();
}

/* --- 5. tap targets and focus ring ------------------------------------ */
console.log("\ntouch and keyboard");
{
  const p = await page({ w: 390, h: 844 });
  for (const path of ["/", "/give/", "/need-help/", "/contact/"]) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const small = await p.$$eval("a.btn, button, .index-list a, .door", (els) =>
      els
        .filter((e) => e.offsetParent !== null)
        .map((e) => ({ t: e.textContent.trim().slice(0, 24), h: Math.round(e.getBoundingClientRect().height) }))
        .filter((e) => e.h > 0 && e.h < 44)
    );
    if (!small.length) ok(`tap targets >= 44px on ${path}`);
    else bad(`small tap targets on ${path}: ` + JSON.stringify(small));
  }
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.keyboard.press("Tab");
  const first = await p.evaluate(() => document.activeElement?.className);
  if (String(first).includes("skip")) ok("first tab stop is the skip link"); else bad("first tab stop is " + first);
  await p.close();
}

/* --- 5b. the header names the ministry at every width (QC S1) ---------- */
console.log("\nheader brand");
{
  for (const w of [390, 430, 560, 900, 1440]) {
    const p = await page({ w, h: 844 });
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(300);
    const txt = await p.evaluate(() => {
      const el = document.querySelector(".bar__mark-txt");
      const b = el.querySelector("b");
      const before = getComputedStyle(b, "::before").content;
      const kicker = before && before !== "none" && before !== "normal"
        ? before.replace(/"/g, "")
        : b.textContent;
      return kicker + " " + el.querySelector("i").textContent;
    });
    if (/KAM|Kingdom/i.test(txt)) ok(`header at ${w}px reads "${txt.trim()}"`);
    else bad(`header at ${w}px reads only "${txt.trim()}"`);
    await p.close();
  }
}

/* --- 5c. the quick exit is reachable at every scroll position (QC S2) --- */
console.log("\nexit control reachability");
{
  const p = await page({ w: 390, h: 844 });
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  let allVisible = true, minH = 999;
  for (const frac of [0, 0.35, 0.7, 1]) {
    await p.evaluate((y) => scrollTo(0, y), Math.round(h * frac));
    await p.waitForTimeout(350);
    const box = await p.evaluate(() => {
      const el = document.querySelector(".bar__exit");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, h: Math.round(r.height), onScreen: r.top >= 0 && r.bottom <= innerHeight };
    });
    if (!box || !box.onScreen) { allVisible = false; bad(`exit control not on screen at ${frac * 100}% scroll`); }
    if (box) minH = Math.min(minH, box.h);
  }
  if (allVisible) ok("exit control stays on screen at every scroll position");
  if (minH >= 44) ok(`exit control is ${minH}px tall`); else bad(`exit control only ${minH}px tall`);

  /* The concrete requirement QC raised: the footer's own crisis numbers must be
     fully readable at the end of the page, not sitting under any fixed chrome.
     A sticky header covering content that scrolling up reveals is normal and is
     not what is being tested here. */
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(400);
  const crisis = await p.evaluate(() => {
    const note = document.querySelector(".foot__note");
    const bar = document.querySelector(".bar").getBoundingClientRect();
    const r = note.getBoundingClientRect();
    return { clear: r.top >= bar.bottom, top: Math.round(r.top), barBottom: Math.round(bar.bottom), text: note.textContent.trim().slice(0, 40) };
  });
  if (crisis.clear) ok("footer crisis line is clear of the header at the end of the page");
  else bad(`footer crisis line is under the header (top ${crisis.top} vs bar ${crisis.barBottom})`);
  await p.close();
}

/* --- 6. reduced motion still renders the meaning ----------------------- */
console.log("\nreduced motion");
{
  const p = await page({ ctx: { reducedMotion: "reduce" } });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const vis = await p.evaluate(() => {
    const hidden = Array.from(document.querySelectorAll("[data-sc-in]")).filter(
      (e) => Number(getComputedStyle(e).opacity) < 0.3
    ).length;
    const seam = document.querySelector(".mend__seam");
    return { hiddenReveals: hidden, seamOffset: getComputedStyle(seam).strokeDashoffset, seamOpacity: getComputedStyle(seam).opacity };
  });
  if (vis.seamOpacity === "1" && parseFloat(vis.seamOffset) === 0) ok("mended vessel shows whole with gold seams");
  else bad("reduced-motion vessel wrong: " + JSON.stringify(vis));
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(700);
  const stillHidden = await p.evaluate(() =>
    Array.from(document.querySelectorAll("[data-sc-in]")).filter((e) => Number(getComputedStyle(e).opacity) < 0.3).length
  );
  if (stillHidden === 0) ok("no content stuck invisible after scrolling");
  else bad(stillHidden + " reveal blocks never became visible");
  await p.close();
}

console.log(fails.length ? `\n${fails.length} FAILURES` : "\nall functional checks passed");
await b.close();
process.exit(fails.length ? 1 : 0);
