/* Capture a page as sequential viewport-sized tiles, so each one can actually
   be looked at rather than squinted at in a 12000px full-page strip. */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const out = process.argv[2];
const path = process.argv[3];
const W = Number(process.env.W || 390);
const H = Number(process.env.H || 844);
const MAX = Number(process.env.MAX || 14);

await mkdir(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = [];
p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
p.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });
p.on("requestfailed", (r) => errs.push("failed: " + r.url().slice(0, 80)));

await p.goto("http://localhost:4500" + path, { waitUntil: "networkidle" });
await p.waitForSelector("html.sc-ready", { timeout: 12000 }).catch(() => {});
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);

const total = await p.evaluate(() => document.documentElement.scrollHeight);
const n = Math.min(MAX, Math.ceil(total / H));
const name = (path.replace(/[/.]/g, "_") || "home").replace(/^_|_$/g, "") || "home";

for (let i = 0; i < n; i++) {
  const y = Math.round((i * (total - H)) / Math.max(1, n - 1));
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${name}-${String(i).padStart(2, "0")}.png` });
}
console.log(`${path}  ${total}px tall, ${n} tiles @ ${W}x${H}`);
if (errs.length) console.log("  ERRORS: " + [...new Set(errs)].join(" | "));
await b.close();
