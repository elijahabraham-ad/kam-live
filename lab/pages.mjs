import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
const paths = process.argv.slice(3);
await mkdir(process.argv[2], { recursive: true });
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const path of paths) {
  await p.goto("http://localhost:4500" + path, { waitUntil: "networkidle" });
  await p.waitForSelector("html.sc-ready", { timeout: 12000 }).catch(()=>{});
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(async () => {
    // Walk the page so every reveal fires, then return to the top.
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 24)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(800);
  const name = (path.replace(/\//g, "_") || "_home").replace(/^_|_$/g, "") || "home";
  await p.screenshot({ path: `${process.argv[2]}/${name}.png`, fullPage: true });
}
await b.close();
console.log("captured", paths.length);
