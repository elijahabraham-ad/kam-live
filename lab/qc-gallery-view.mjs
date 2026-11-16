/* Viewport screenshots of the new media spots, as a visitor sees them. */
import { chromium } from "playwright-core";
const OUT = process.argv[2] || "lab/gal";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
for (const [tag, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const p = await (await b.newContext({ viewport: vp, deviceScaleFactor: tag === "mobile" ? 2 : 1 })).newPage();
  await p.goto("http://localhost:4500/", { waitUntil: "networkidle" });
  await p.waitForSelector("html.sc-ready", { timeout: 12000 }).catch(() => {});
  const top = await p.evaluate(() => document.querySelector("#tabling").getBoundingClientRect().top + scrollY);
  const reel = await p.evaluate(() => document.querySelector(".reel").getBoundingClientRect().top + scrollY);
  for (const [i, y] of [[1, top - 80], [2, reel - 120]]) {
    // Step down to the spot so every reveal fires the way it does for a reader.
    await p.evaluate(async (y) => { for (let s = Math.max(0, y - 2400); s <= y; s += 200) { scrollTo(0, s); await new Promise((r) => setTimeout(r, 30)); } }, y);
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${OUT}/view_${tag}_home_${i}.png` });
  }
}
await b.close();
