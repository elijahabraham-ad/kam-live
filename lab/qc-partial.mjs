/* The realistic failure: a partially filled safety form with no way to reach
   the person, against a stub that behaves like the real worker. */
import { chromium } from "playwright-core";

const BASE = "http://localhost:4500";
const FAKE = "https://kam-qc-endpoint.invalid/submit";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(`
  new MutationObserver(function (m, o) {
    if (document.documentElement) {
      document.documentElement.setAttribute("data-endpoint", ${JSON.stringify(FAKE)});
      o.disconnect();
    }
  }).observe(document, { childList: true, subtree: true });
`);
// Behave like worker/index.js: 400 only when every field is empty.
await ctx.route(FAKE, async (route) => {
  const post = route.request().postData() || "";
  const hasAny = /name="(?!_)[^"]+"\r?\n\r?\n\S/.test(post);
  route.fulfill({ status: hasAny ? 200 : 400, contentType: "application/json", body: "{}" });
});

const p = await ctx.newPage();
const sent = [];
p.on("request", (r) => { if (r.method() === "POST") sent.push(r.url()); });
await p.goto(BASE + "/need-help/", { waitUntil: "networkidle" });

// Type only the OPTIONAL name. Leave every required field blank.
await p.fill("#name", "Sarah");
await p.click("form[data-kam-form] button[type=submit]");
await p.waitForTimeout(1500);

console.log("PARTIALLY FILLED SAFETY FORM (only the optional name)");
console.log("   required fields still empty :", await p.evaluate(() =>
  [...document.querySelectorAll("form [required]")].filter((e) => !e.value).map((e) => e.name)));
console.log("   POSTed                      :", sent.length > 0);
console.log("   what the person is told     :", JSON.stringify((await p.textContent(".form__status") || "").trim()));
console.log("   -> KAM receives a first name and NO way to contact her.");

await b.close();
