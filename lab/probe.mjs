import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4500/", { waitUntil: "networkidle" });
await p.waitForSelector("html.sc-ready");
await p.evaluate(() => document.fonts.ready);

const act = await p.evaluate(() => {
  const a = document.querySelector('#mending');
  const r = a.getBoundingClientRect();
  return { top: r.top + scrollY, height: r.height };
});
console.log("mending act:", act);

for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
  const y = Math.round(act.top + (act.height - 900) * frac);
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(500);
  const info = await p.evaluate(() => {
    const a = document.querySelector('#mending');
    const stage = a.querySelector('[data-sc-stage]');
    const fig = a.querySelector('.mend__fig');
    const copy = a.querySelector('.mend__copy');
    const cs = getComputedStyle(a);
    const g = (el) => { const r = el.getBoundingClientRect(); return {t:Math.round(r.top),l:Math.round(r.left),w:Math.round(r.width),h:Math.round(r.height)}; };
    return {
      p: cs.getPropertyValue('--sc-p').trim(),
      stage: g(stage), fig: g(fig), copy: g(copy),
      copyOpacity: getComputedStyle(copy).opacity,
      mendDisplay: getComputedStyle(a.querySelector('.mend')).display,
      mendH: Math.round(a.querySelector('.mend').getBoundingClientRect().height),
    };
  });
  console.log(frac, JSON.stringify(info));
}
await b.close();
