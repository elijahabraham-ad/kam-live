import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4500/", { waitUntil: "networkidle" });
await p.waitForSelector("html.sc-ready");
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(() => {
  const rail = document.querySelector('.rail');
  const stage = document.querySelector('#impact [data-sc-stage]');
  const mendStage = document.querySelector('#mending [data-sc-stage]');
  return {
    railScrollWidth: rail.scrollWidth,
    viewport: innerWidth,
    overflow: rail.scrollWidth - innerWidth,
    railClasses: rail.className,
    impactStageH: Math.round(stage.getBoundingClientRect().height),
    impactStagePos: getComputedStyle(stage).position,
    mendStageH: Math.round(mendStage.getBoundingClientRect().height),
    mendStagePos: getComputedStyle(mendStage).position,
    mendStageClasses: mendStage.className,
    docH: document.documentElement.scrollHeight,
  };
}), null, 2));
await b.close();
