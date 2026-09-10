/* Remaining QC: duplicate-id label misbinding, status live-region timing,
   page weight, and reveal coverage on every page. */
import { chromium } from "playwright-core";

const BASE = "http://localhost:4500";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });

/* --- duplicate id: does the second form's label focus the wrong field? --- */
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/events/", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const forms = [...document.querySelectorAll("form[data-kam-form]")];
    const second = forms[1];
    const label = [...second.querySelectorAll("label[for]")].find((l) => l.getAttribute("for") === "name");
    const target = document.getElementById("name");
    return {
      forms: forms.map((f) => f.getAttribute("data-kam-form")),
      secondLabelText: label?.textContent.trim(),
      labelIsInsideForm: second.getAttribute("data-kam-form"),
      getElementByIdBelongsTo: target?.closest("form")?.getAttribute("data-kam-form"),
    };
  });
  console.log("DUPLICATE ID on /events/");
  console.log("   forms on page                       :", r.forms);
  console.log("   2nd form has a label for=\"name\"     :", JSON.stringify(r.secondLabelText), "inside form", r.labelIsInsideForm);
  console.log("   but getElementById('name') lives in :", r.getElementByIdBelongsTo, "<-- WRONG FORM");
  // click the second form's label and see where focus lands
  await p.evaluate(() => {
    const second = [...document.querySelectorAll("form[data-kam-form]")][1];
    second.scrollIntoView();
    [...second.querySelectorAll("label[for='name']")][0].click();
  });
  await p.waitForTimeout(200);
  console.log("   after clicking that label, focus is in form:", await p.evaluate(() =>
    document.activeElement?.closest("form")?.getAttribute("data-kam-form")));
  await p.close();
}

/* --- status message live-region timing ---------------------------------- */
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/prayer/", { waitUntil: "networkidle" });
  const before = await p.evaluate(() => {
    const s = document.querySelector(".form__status");
    return { role: s.getAttribute("role"), ariaLive: s.getAttribute("aria-live"), hidden: s.hidden };
  });
  await p.click("form[data-kam-form] button[type=submit]");
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => {
    const s = document.querySelector(".form__status");
    return { role: s.getAttribute("role"), hidden: s.hidden, focused: document.activeElement.tagName };
  });
  console.log("\nSTATUS LIVE REGION");
  console.log("   before submit :", JSON.stringify(before));
  console.log("   after submit  :", JSON.stringify(after), "(role added at the same moment as the text)");
  await p.close();
}

/* --- page weight -------------------------------------------------------- */
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  let bytes = 0; const big = [];
  p.on("response", async (r) => {
    try {
      const len = Number((await r.allHeaders())["content-length"] || 0);
      bytes += len;
      if (len > 60000) big.push(r.url().split("/").pop().split("?")[0] + " " + Math.round(len / 1024) + "kB");
    } catch (e) {}
  });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  console.log("\nHOMEPAGE WEIGHT (first load, mobile viewport)");
  console.log("   total ~" + Math.round(bytes / 1024) + " kB");
  console.log("   items over 60kB:", big.length ? big : "none");
  await p.close();
}

/* --- reveal coverage on every page -------------------------------------- */
{
  console.log("\nREVEAL COVERAGE");
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const PATHS = ["/", "/about/", "/mission/", "/programs/", "/programs/mental-health/",
    "/programs/homelessness/", "/programs/youth/", "/programs/womens-support/",
    "/programs/recovery/", "/discipleship/", "/events/", "/give/",
    "/get-involved/", "/volunteer/", "/partner/", "/stories/", "/prayer/",
    "/contact/", "/need-help/"];
  let total = 0;
  for (const path of PATHS) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    await p.waitForSelector("html.sc-ready", { timeout: 12000 }).catch(() => {});
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h; y += 300) { scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r)); await new Promise((r) => setTimeout(r, 30)); }
    });
    await p.waitForTimeout(2200);
    const hidden = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll("[data-sc-in], [data-sc-stagger] > *").forEach((el) => {
        if (Number(getComputedStyle(el).opacity) < 0.35)
          out.push(String(el.className).slice(0, 26) + " :: " + (el.textContent || "").trim().slice(0, 40));
      });
      return out;
    });
    total += hidden.length;
    if (hidden.length) { console.log("   " + path + "  " + hidden.length + " STILL HIDDEN"); hidden.slice(0, 4).forEach((h) => console.log("      " + h)); }
  }
  console.log(total ? "   " + total + " elements never revealed" : "   every reveal block became visible on all 19 pages @390");
  await p.close();
}

await b.close();
