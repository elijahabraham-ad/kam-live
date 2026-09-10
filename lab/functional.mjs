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
  await p.fill("#request", "Please pray for my family.");
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
