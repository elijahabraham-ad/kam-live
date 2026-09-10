import { chromium } from "playwright-core";
const paths = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
let bad = 0;
for (const path of paths) {
  await p.goto("http://localhost:4500" + path, { waitUntil: "networkidle" });
  await p.waitForSelector("html.sc-ready", { timeout: 12000 }).catch(()=>{});
  await p.evaluate(() => document.fonts.ready);
  // Scroll the way a person does, slowly, all the way down.
  await p.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 300) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); await new Promise(r => setTimeout(r, 40)); }
  });
  await p.waitForTimeout(2600);
  const hidden = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("[data-sc-in], [data-sc-stagger] > *").forEach((el) => {
      if (Number(getComputedStyle(el).opacity) < 0.35) {
        out.push((el.className||"").toString().slice(0,32) + " :: " + (el.textContent||"").trim().slice(0,42));
      }
    });
    return out;
  });
  if (hidden.length) { bad += hidden.length; console.log(`\n${path}  ${hidden.length} still hidden`); hidden.slice(0,6).forEach(h=>console.log("   "+h)); }
  else console.log(`ok ${path}`);
}
console.log(bad ? `\n${bad} elements never revealed` : "\nevery reveal block became visible");
await b.close();
