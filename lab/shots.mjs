/* Screenshot helper: walk a page at fixed scroll fractions and save a frame at
   each one, so every state can be looked at rather than assumed. */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const CHROME = process.env.SCROLLCRAFT_CHROME;
const url = process.argv[2] || "http://localhost:4500/";
const out = process.argv[3] || "lab/frames";
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);
const N = Number(process.env.N || 14);

await mkdir(out, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector("html.sc-ready", { timeout: 20000 }).catch(() => {});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

for (let i = 0; i < N; i++) {
  const y = Math.round((total * i) / (N - 1));
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, "0")}.png` });
}

console.log(`scrollHeight travel: ${total}px  (${(total / H).toFixed(1)} viewports)`);
if (errors.length) { console.log("PAGE ERRORS:"); errors.forEach((e) => console.log("  " + e)); }
else console.log("no page errors");

await browser.close();
