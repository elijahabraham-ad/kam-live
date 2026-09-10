/* Screenshot one page at explicit act-progress points. */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
const [url, sel, out] = [process.argv[2], process.argv[3], process.argv[4]];
await mkdir(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: Number(process.env.W||1440), height: Number(process.env.H||900) } });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForSelector("html.sc-ready");
await p.evaluate(() => document.fonts.ready);
const act = await p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: r.top + scrollY, height: r.height }; }, sel);
const fr = [0, 0.2, 0.4, 0.6, 0.8, 1];
for (let i = 0; i < fr.length; i++) {
  const y = Math.round(act.top + (act.height - (Number(process.env.H||900))) * fr[i]);
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/p${String(Math.round(fr[i]*100)).padStart(3,"0")}.png` });
}
console.log("done", act);
await b.close();
