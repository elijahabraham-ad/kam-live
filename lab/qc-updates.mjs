/* QC for the 2026-10-22 content round (Selvin's updates): the prayer hotline,
   the Call. Connect. Restore. framework, the retired Open Mic, and the email
   fallback on unconnected forms. Hotline-aware: it reads site.hotline.live from
   config, so run it with the same KAM_HOTLINE_LIVE as the server it tests.
     node lab/qc-updates.mjs http://localhost:4500
     node lab/qc-updates.mjs https://kingdomassemblymissions.org */
import { chromium } from "playwright-core";
import { site } from "../src/config.mjs";

const BASE = (process.argv[2] || "http://localhost:4500").replace(/\/$/, "");
const LIVE = site.hotline.live;
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const fails = [];
const ok = (m) => console.log("  ok   " + m);
const bad = (m) => { fails.push(m); console.log("  FAIL " + m); };
console.log(`hotline mode: ${LIVE ? "LIVE (tap to call)" : "launching soon (no call links)"}`);

const PATHS = [
  "/", "/about/", "/mission/", "/programs/", "/programs/mental-health/", "/programs/homelessness/",
  "/programs/youth/", "/programs/womens-support/", "/programs/recovery/", "/discipleship/", "/events/",
  "/give/", "/get-involved/", "/volunteer/", "/partner/", "/stories/", "/prayer/", "/contact/",
  "/need-help/", "/404.html",
];
const HOTLINE_TEL = "tel:+18883377294";
const CRISIS_TEL = ["tel:911", "tel:18007997233", "tel:988", "tel:18006624357"];
const ALLOWED_TEL = new Set([...(LIVE ? [HOTLINE_TEL] : []), ...CRISIS_TEL]);
const RETIRED = [
  "Reach. Restore", "Empower. Disciple", "Love. Serve. Impact", "Reaching the broken",
  "Advancing the Kingdom", "October 9", "Open Mic", "Six stations", "six stations",
  "not reachable yet", "TBD", "\u2014", "\u200b", "\u200c", "\u200d", "\ufeff",
];

async function page(w, h) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => bad(`page error at ${p.url()}: ${e.message}`));
  return p;
}

console.log("\nevery page, five widths");
for (const [w, h] of [[320, 640], [390, 844], [820, 1180], [1100, 800], [1440, 900]]) {
  const p = await page(w, h);
  for (const path of PATHS) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const r = await p.evaluate(() => ({
      overflow: document.scrollingElement.scrollWidth - window.innerWidth,
      tels: Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute("href")),
      text: document.body.innerText + " " +
        Array.from(document.querySelectorAll("meta[content], [alt], [aria-label], title"))
          .map((e) => e.getAttribute("content") || e.getAttribute("alt") || e.getAttribute("aria-label") || e.textContent).join(" "),
      hotlineShown: (document.body.innerText.match(/1-888-33-PRAY-4YOU/g) || []).length,
      bar: (() => { const a = document.querySelector(".bar__pray"); return a && getComputedStyle(a).display !== "none" ? a.getAttribute("href") : null; })(),
      grounds: Array.from(document.querySelectorAll("main > section")).map((s) => ({
        g: (s.className.match(/ground--(\w+)/) || [])[1], tight: s.classList.contains("sec--tight"), head: s.classList.contains("phead"),
      })),
    }));
    const tag = `${path} @${w}`;
    if (r.overflow > 1) bad(`${tag} scrolls sideways by ${r.overflow}px`);
    const wrong = r.tels.filter((t) => !ALLOWED_TEL.has(t));
    if (wrong.length) bad(`${tag} unexpected tel links: ${wrong.join(", ")}`);
    const hits = RETIRED.filter((s) => r.text.includes(s));
    if (hits.length) bad(`${tag} still says: ${hits.map((x) => JSON.stringify(x)).join(", ")}`);
    if (path === "/need-help/") {
      // The safety page is crisis numbers first. The prayer line is not a crisis resource.
      if (r.bar || r.hotlineShown) bad(`${tag} shows the prayer line on the safety page`);
    } else {
      if (!r.hotlineShown) bad(`${tag} never shows the hotline`);
      const want = LIVE ? HOTLINE_TEL : "/prayer/#prayer-line";
      if (r.bar !== want) bad(`${tag} header prayer link is ${r.bar}, want ${want}`);
      if (LIVE && !r.tels.includes(HOTLINE_TEL)) bad(`${tag} has no tap-to-call hotline link`);
    }
    // Hard cuts: two sections on the same ground back to back only when a
    // page head runs into its own tight opening section. Two pages already
    // did this on the live site before this round (checked 2026-10-22) and
    // were left as built: get-involved (head into the doors) and recovery.
    const KNOWN = { "/get-involved/": [1], "/programs/recovery/": [3] };
    for (let i = 1; i < r.grounds.length; i++) {
      const [a, c] = [r.grounds[i - 1], r.grounds[i]];
      if ((KNOWN[path] || []).includes(i)) continue;
      if (a.g && a.g === c.g && !(a.head && c.tight)) bad(`${tag} sections ${i} and ${i + 1} are both ${c.g}`);
    }
  }
  ok(`${PATHS.length} pages checked at ${w}px`);
  await p.close();
}

console.log("\nhotline placement Selvin asked for");
{
  const p = await page(1440, 900);
  for (const [path, sel, what] of [
    ["/", ".title-page .title-page__pray", "homepage hero"],
    ["/", "#prayer-line .pray-band__num", "homepage prayer band"],
    ["/prayer/", "#prayer-line .pray-band__num", "prayer page"],
    ["/give/", "#prayer-line-partner .pray-band__num", "give page"],
    ["/", ".foot .foot__pray-num", "footer"],
    ["/contact/", ".event__meta", "contact page"],
  ]) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const el = await p.$(sel);
    const txt = el ? await el.innerText() : "";
    if (!/1-888-33-PRAY-4YOU/.test(txt)) { bad(`${what}: number missing in ${sel}`); continue; }
    if (LIVE) {
      const tel = await p.$eval(sel, (e) => (e.matches("a") ? e : e.querySelector('a[href^="tel:+1888"]'))?.getAttribute("href")).catch(() => null);
      if (tel === HOTLINE_TEL) ok(`${what} dials ${HOTLINE_TEL}`); else bad(`${what} href=${tel}`);
    } else {
      const near = await p.$eval(sel, (e) => (e.closest(".pray-band__call, .foot__pray, .title-page__foot, dd") || e).innerText);
      if (/Launching soon/i.test(near)) ok(`${what} shows the number, marked launching soon`); else bad(`${what} not marked launching soon`);
    }
  }
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const ld = await p.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent).join(""));
  if (LIVE === /contactPoint/.test(ld)) ok(`JSON-LD contactPoint ${LIVE ? "present" : "absent"}`); else bad("JSON-LD contactPoint does not match hotline mode");
  const h1 = (await p.innerText("h1")).replace(/\s+/g, " ").trim();
  if (h1 === "Call. Connect. Restore.") ok("homepage h1 is the pathway"); else bad("homepage h1: " + h1);
  const steps = await p.$$eval("#model .model__step h3", (n) => n.map((x) => x.textContent.trim()));
  if (steps.join() === "Call,Connect,Restore") ok("pathway has three steps"); else bad("pathway steps: " + steps);
  const tag = await p.textContent(".title-page__tag");
  if (/Feeding People Spiritually, Emotionally, and Physically\./.test(tag)) ok("tagline under the name"); else bad("tagline: " + tag);
  const nav = await p.$$eval(".bar__nav a", (n) => n.map((x) => x.textContent.trim()));
  if (nav.join("|") === "Our Mission|Programs|Events|Prayer|Get Involved") ok("simplified nav: " + nav.join(", "));
  else bad("nav: " + nav.join(", "));
  const chapters = await p.$$eval(".rule-label", (n) => n.map((x) => x.textContent).filter((t) => /^Chapter/.test(t)).map((t) => t.split(/\s/)[1]));
  if (chapters.join() === ["one", "two", "three", "four", "five", "six"].slice(0, chapters.length).join()) ok("chapter labels count up: " + chapters.join(", "));
  else bad("chapter labels: " + chapters.join(", "));
  await p.goto(BASE + "/events/", { waitUntil: "networkidle" });
  if (!(await p.$("article.event"))) ok("no expired event on the calendar"); else bad("an event card is still listed");
  await p.goto(BASE + "/give/", { waitUntil: "networkidle" });
  const opt = await p.$$eval("form[data-kam-form=give] select[name=gift_type] option", (n) => n.map((x) => x.textContent));
  if (opt.some((o) => /Prayer line partner \(\$15\/month\)/.test(o))) ok("give form offers the $15/month prayer line partner");
  else bad("give form options: " + opt.join(" | "));
  if (site.donateUrl && site.donateUrl !== "TBD") {
    const gives = await p.$$eval('a.btn, a.door, a.door__go', (n) => n.filter((a) => /^(Give|Give now|Give today|Support our mission)$/.test(a.textContent.trim()))
      .map((a) => [a.textContent.trim(), a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel")]));
    const off = gives.filter(([, h, t, r]) => h !== site.donateUrl || t !== "_blank" || !/noopener/.test(r || ""));
    if (gives.length && !off.length) ok(`${gives.length} give buttons open the Square checkout in a new tab`); else bad("give buttons: " + JSON.stringify(off));
  }
  const partnerBtn = (await p.innerText("#prayer-line-partner .btn")).trim();
  if (partnerBtn === "Ask about partnering") ok("no 'Give $15/month' button while there is no payment link"); else bad("partner button: " + partnerBtn);
  await p.goto(BASE + "/contact/", { waitUntil: "networkidle" });
  const mail = await p.getAttribute('.event__meta a[href^="mailto:"]', "href").catch(() => null);
  if (mail === "mailto:kingdomassemblymissions@gmail.com") ok("contact page publishes the ministry inbox"); else bad("contact email: " + mail);
  await p.close();
}

if (LIVE) {
  console.log("\nhotline tap targets");
  const p = await page(390, 844);
  for (const [path, sel] of [["/", "a.title-page__pray"], ["/", "a.foot__pray-num"], ["/", "a.pray-band__num"], ["/contact/", '.event__meta dd a[href^="tel:"]']]) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const hgt = await p.$eval(sel, (e) => e.getBoundingClientRect().height).catch(() => 0);
    if (hgt >= 43.5) ok(`${path} ${sel} is ${Math.round(hgt)}px tall`); else bad(`${path} ${sel} only ${Math.round(hgt)}px tall`);
  }
  await p.close();
}

const CONNECTED = site.formEndpoint && site.formEndpoint !== "TBD";
if (!CONNECTED) {
console.log("\nforms: honest before and after submit");
{
  const p = await page(390, 844);
  const posted = [];
  p.on("request", (r) => { if (r.method() === "POST") posted.push(r.url()); });

  for (const path of ["/contact/", "/prayer/", "/need-help/", "/volunteer/", "/give/", "/events/"]) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const pre = await p.$$eval("form[data-kam-form] .form__pre", (n) => n.map((x) => x.textContent));
    const forms = await p.$$eval("form[data-kam-form]", (n) => n.length);
    if (pre.length === forms && pre.every((t) => /not connected yet/.test(t))) ok(`${path} says before typing that the form is not connected`);
    else bad(`${path}: ${pre.length}/${forms} forms carry the not-connected notice`);
  }

  await p.goto(BASE + "/contact/", { waitUntil: "networkidle" });
  await p.fill("#contact-name", "Test Person");
  await p.fill("#contact-email", "test@example.com");
  await p.selectOption("#contact-about", "Volunteer");
  await p.fill("#contact-message", "I want to help at the next feeding.");
  await p.click("form[data-kam-form=contact] button[type=submit]");
  let st = p.locator("form[data-kam-form=contact] .form__status");
  let href = await st.locator('a[href^="mailto:"]').getAttribute("href").catch(() => null);
  if (href && href.startsWith("mailto:kingdomassemblymissions@gmail.com?subject=")) {
    const body = decodeURIComponent(href.split("&body=")[1] || "");
    if (/Message: I want to help at the next feeding\./.test(body) && /What is this about\?: Volunteer/.test(body)) ok("contact form builds a labelled email to KAM");
    else bad("contact mailto body: " + body.slice(0, 120));
  } else bad("contact form gave no mailto: " + (await st.textContent()));
  const callBtn = await st.locator('a[href="tel:+18883377294"]').count();
  if (LIVE ? callBtn : !callBtn) ok(`contact fallback ${LIVE ? "offers" : "does not offer"} the prayer line`); else bad("contact fallback call button does not match hotline mode");
  const box = await st.locator("a.btn").first().boundingBox();
  if (box && box.height >= 44) ok("fallback button is a 44px tap target"); else bad("fallback button height " + (box && box.height));

  await p.goto(BASE + "/volunteer/", { waitUntil: "networkidle" });
  const roles = ["Prayer team", "Food distribution"];
  const vfields = await p.$$eval("form[data-kam-form=volunteer] [required]", (n) => n.map((x) => [x.id, x.tagName, x.type]));
  for (const [id, tagName, type] of vfields) {
    if (tagName === "SELECT") await p.selectOption("#" + id, { index: 1 });
    else if (type === "email") await p.fill("#" + id, "test@example.com");
    else if (type !== "checkbox") await p.fill("#" + id, "Test");
  }
  for (const r of roles) await p.check(`form[data-kam-form=volunteer] input[value="${r}"]`);
  await p.click("form[data-kam-form=volunteer] button[type=submit]");
  st = p.locator("form[data-kam-form=volunteer] .form__status");
  href = await st.locator('a[href^="mailto:"]').getAttribute("href").catch(() => null);
  const vbody = href ? decodeURIComponent(href.split("&body=")[1] || "") : "";
  if (roles.every((r) => vbody.includes(": " + r))) ok("volunteer email keeps the roles picked: " + roles.join(", "));
  else bad("volunteer mailto lost roles: " + vbody.replace(/\n+/g, " | ").slice(0, 200) + " / status: " + (await st.textContent()).slice(0, 80));

  await p.goto(BASE + "/prayer/", { waitUntil: "networkidle" });
  await p.fill("#prayer-request", "Pray for my family.");
  await p.click("form[data-kam-form=prayer] button[type=submit]");
  st = p.locator("form[data-kam-form=prayer] .form__status");
  const pt = await st.textContent();
  href = await st.locator('a[href^="mailto:"]').getAttribute("href").catch(() => null);
  if (href && /not be anonymous/.test(pt)) ok("prayer fallback warns it will not be anonymous"); else bad("prayer fallback: " + pt);

  await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });
  await p.fill("#help-reach", "evenings only");
  await p.selectOption("#help-safe_contact", { index: 2 });
  await p.selectOption("#help-need", { index: 1 });
  await p.click("form[data-kam-form=help] button[type=submit]");
  st = p.locator("form[data-kam-form=help] .form__status");
  if (!(await st.locator('a[href^="mailto:"]').count())) ok("safety form never offers an email draft");
  else bad("safety form offered a mailto, which leaves a copy in Sent");
  if (/not connected yet/.test(await st.textContent())) ok("safety form says plainly nothing was sent"); else bad("safety form status: " + (await st.textContent()));

  if (!posted.length) ok("nothing was posted anywhere"); else bad("POSTed to " + posted.join(", "));
  await p.close();
}

} else {
  /* Connected: every form posts to the worker. The endpoint is STUBBED here,
     so running QC never emails the ministry. What is checked is the request
     the page makes: one POST, the right _form name, every typed value. */
  console.log("\nforms: connected to " + site.formEndpoint + " (stubbed in this test)");
  const p = await page(390, 844);
  const seen = [];
  await p.route(site.formEndpoint, (route) => {
    seen.push(route.request().postData() || "");
    route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}', headers: { "access-control-allow-origin": "*" } });
  });
  const others = [];
  p.on("request", (r) => { if (r.method() === "POST" && !r.url().startsWith(site.formEndpoint)) others.push(r.url()); });

  const CASES = [
    ["/contact/", "contact", { "#contact-name": "QC Test", "#contact-email": "qc@example.com", "#contact-about": "Prayer", "#contact-message": "QC message" }],
    ["/prayer/", "prayer", { "#prayer-request": "QC prayer request" }],
    ["/need-help/", "help", { "#help-reach": "QC evenings", "#help-safe_contact": 2, "#help-need": 1 }],
    ["/give/", "give", { "#give-name": "QC Test", "#give-email": "qc@example.com", "#give-gift_type": "Prayer line partner ($15/month)", "#give-designation": 1 }],
    ["/events/", "newsletter", { "#newsletter-name": "QC Test", "#newsletter-email": "qc@example.com" }],
    ["/volunteer/", "volunteer", null],
    ["/partner/", "partner", null],
    ["/discipleship/", "discipleship", null],
  ];
  for (const [path, kind, fill] of CASES) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const f = `form[data-kam-form=${kind}]`;
    if (await p.$(`${f} .form__pre`)) bad(`${path} still shows the not-connected notice`);
    if (fill) {
      for (const [sel, v] of Object.entries(fill)) {
        const tag = await p.$eval(sel, (e) => e.tagName);
        if (tag === "SELECT") await p.selectOption(sel, typeof v === "number" ? { index: v } : v);
        else await p.fill(sel, String(v));
      }
    } else {
      // Fill every required field generically.
      const req = await p.$$eval(`${f} [required]`, (n) => n.map((x) => [x.id, x.tagName, x.type]));
      for (const [id, tag, type] of req) {
        if (tag === "SELECT") await p.selectOption("#" + id, { index: 1 });
        else if (type === "email") await p.fill("#" + id, "qc@example.com");
        else if (type !== "checkbox") await p.fill("#" + id, "QC Test");
      }
    }
    const before = seen.length;
    await p.click(`${f} button[type=submit]`);
    await p.waitForTimeout(600);
    const st = (await p.textContent(`${f} .form__status`)) || "";
    const body = seen[before] || "";
    if (seen.length === before + 1 && body.includes(`name="_form"\r\n\r\n${kind}`) && /QC/.test(body) && !/did not go through|not connected/i.test(st))
      ok(`${path} ${kind}: one POST to the worker, status "${st.trim().slice(0, 48)}"`);
    else bad(`${path} ${kind}: posts=${seen.length - before}, status="${st.trim().slice(0, 60)}"`);
  }
  if (!others.length) ok("nothing posted anywhere but the worker"); else bad("other POSTs: " + others.join(", "));
  await p.close();
}

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED` : "\nall update checks passed");
process.exit(fails.length ? 1 : 0);
