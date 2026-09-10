/* QC: things screenshots and the existing functional.mjs do not prove.
   Empty-form submission, a simulated live endpoint, quick-exit history
   behaviour, exit-button geometry, and focus-ring visibility. */
import { chromium } from "playwright-core";

const BASE = "http://localhost:4500";
const CHROME = process.env.SCROLLCRAFT_CHROME;
const FAKE = "https://kam-qc-endpoint.invalid/submit";

const b = await chromium.launch({ executablePath: CHROME });

/* ---- A. submit the need-help form completely empty -------------------- */
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const posted = [];
  p.on("request", (r) => { if (r.method() === "POST") posted.push(r.url()); });
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  console.log("A) EMPTY SUBMIT on /need-help/ (endpoint unset)");
  console.log("   form has novalidate :", (await p.getAttribute("form[data-kam-form]", "novalidate")) !== null);
  await p.click("form[data-kam-form] button[type=submit]");
  await p.waitForTimeout(400);
  console.log("   required fields left empty :", await p.evaluate(() =>
    [...document.querySelectorAll("form [required]")].filter((e) => !e.value).map((e) => e.name)));
  console.log("   form.checkValidity()       :", await p.evaluate(() =>
    document.querySelector("form[data-kam-form]").checkValidity()));
  console.log("   native bubble appeared     :", await p.evaluate(() =>
    document.activeElement?.matches("[required]")));
  console.log("   status text                :", JSON.stringify((await p.textContent(".form__status") || "").trim().slice(0, 130)));
  console.log("   POSTs                      :", posted);
  await p.close();
}

/* ---- B. the same, with the endpoint pretending to be live ------------- */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  // Set data-endpoint before kam.js reads it, then stub the network.
  await ctx.addInitScript(`
    new MutationObserver(function (m, o) {
      if (document.documentElement) {
        document.documentElement.setAttribute("data-endpoint", ${JSON.stringify(FAKE)});
        o.disconnect();
      }
    }).observe(document, { childList: true, subtree: true });
  `);
  await ctx.route(FAKE, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  const p = await ctx.newPage();
  const sent = [];
  p.on("request", (r) => { if (r.method() === "POST") sent.push(r.url()); });
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  console.log("\nB) EMPTY SUBMIT on /need-help/ with a LIVE endpoint");
  console.log("   endpoint the page saw :", await p.getAttribute("html", "data-endpoint"));
  await p.click("form[data-kam-form] button[type=submit]");
  await p.waitForTimeout(1200);
  console.log("   POSTed an empty form  :", sent);
  console.log("   message to the user   :", JSON.stringify((await p.textContent(".form__status") || "").trim().slice(0, 150)));
  await ctx.close();
}

/* ---- C. quick exit ---------------------------------------------------- */
{
  console.log("\nC) QUICK EXIT");
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  const popups = [];
  ctx.on("page", (pg) => popups.push(pg));
  await p.click("[data-exit]").catch((e) => console.log("   click threw: " + e.message));
  await p.waitForTimeout(3000);
  console.log("   url of the original tab after exit :", p.url());
  console.log("   extra tabs opened                  :", popups.length);
  console.log("   all pages now open in the context  :", ctx.pages().length);
  for (const pg of ctx.pages()) console.log("      - " + pg.url());
  await p.goBack().catch(() => {});
  await p.waitForTimeout(1500);
  console.log("   url after pressing BACK once       :", p.url());
  await ctx.close();
}

/* ---- C2. three Escapes ------------------------------------------------ */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  for (let i = 0; i < 3; i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(120); }
  await p.waitForTimeout(2500);
  console.log("   url after three Escapes            :", p.url());
  // and with the menu open first, which also listens for Escape
  const p2 = await ctx.newPage();
  await p2.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  await p2.click("[data-menu-open]");
  await p2.waitForTimeout(200);
  for (let i = 0; i < 3; i++) { await p2.keyboard.press("Escape"); await p2.waitForTimeout(120); }
  await p2.waitForTimeout(2500);
  console.log("   url after three Escapes, menu open :", p2.url());
  await ctx.close();
}

/* ---- D. exit button geometry ------------------------------------------ */
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  const geo = await p.evaluate(() => {
    const e = document.querySelector("[data-exit]");
    const r = e.getBoundingClientRect();
    const under = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      viewport: { w: innerWidth, h: innerHeight },
      topmostAtCentre: under?.tagName + "." + String(under?.className).slice(0, 30),
      parentPosition: getComputedStyle(e.parentElement).position,
    };
  });
  console.log("\nD) exit button @390 :", JSON.stringify(geo));
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(600);
  const covered = await p.evaluate(() => {
    const r = document.querySelector("[data-exit]").getBoundingClientRect();
    const hits = [];
    document.querySelectorAll("a[href], button").forEach((a) => {
      if (a.matches("[data-exit]") || a.closest(".exit-bar")) return;
      const q = a.getBoundingClientRect();
      if (q.width && q.bottom > r.top && q.top < r.bottom && q.right > r.left && q.left < r.right)
        hits.push((a.textContent || "").trim().slice(0, 28) + " -> " + a.getAttribute("href"));
    });
    return hits;
  });
  console.log("   controls the exit button sits on top of at page bottom:", covered.length ? covered : "none");
  await p.close();
}

/* ---- E. focus rings --------------------------------------------------- */
{
  console.log("\nE) FOCUS VISIBILITY");
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const path of ["/", "/need-help/", "/give/", "/events/"]) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const bad = [];
    for (let i = 0; i < 30; i++) {
      await p.keyboard.press("Tab");
      const r = await p.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return null;
        const cs = getComputedStyle(a);
        return {
          tag: a.tagName, cls: String(a.className).slice(0, 22),
          txt: (a.textContent || a.name || "").trim().slice(0, 20),
          ow: cs.outlineWidth, os: cs.outlineStyle, bs: cs.boxShadow.slice(0, 34),
          bc: cs.borderColor,
        };
      });
      if (!r) continue;
      const ring = (parseFloat(r.ow) > 0 && r.os !== "none") || (r.bs && r.bs !== "none");
      if (!ring) bad.push(`${r.tag}.${r.cls} "${r.txt}" outline=${r.os}/${r.ow} shadow=${r.bs}`);
    }
    console.log(`   ${path}: ${bad.length ? bad.length + " tab stops with NO visible ring" : "every tab stop shows a ring"}`);
    [...new Set(bad)].slice(0, 6).forEach((x) => console.log("      " + x));
  }
  await p.close();
}

await b.close();
