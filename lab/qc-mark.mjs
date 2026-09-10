import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
for (const W of [390, 430, 600, 768, 900, 1100, 1440]) {
  const p = await b.newPage({ viewport: { width: W, height: 844 } });
  await p.goto("http://localhost:4500/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => {
    const t = document.querySelector(".bar__mark-txt");
    const bEl = t.querySelector("b"), iEl = t.querySelector("i");
    const g = (e) => { const c = getComputedStyle(e); const q = e.getBoundingClientRect();
      return { disp: c.display, vis: c.visibility, op: c.opacity, w: Math.round(q.width), h: Math.round(q.height), fs: c.fontSize, txt: e.textContent }; };
    return { wrap: g(t), b: g(bEl), i: g(iEl), overflow: getComputedStyle(t).overflow, visibleText: t.innerText };
  });
  console.log(W + "px :: visibleText=" + JSON.stringify(r.visibleText) + "  b=" + JSON.stringify(r.b) + "  i=" + JSON.stringify(r.i));
  await p.close();
}
await b.close();
