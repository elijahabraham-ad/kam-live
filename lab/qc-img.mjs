import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await p.goto("http://localhost:4500/", { waitUntil: "networkidle" });
await p.evaluate(async () => { const h=document.documentElement.scrollHeight; for(let y=0;y<h;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));} });
console.log(await p.evaluate(() => [...document.images].map(i => ({
  file: i.currentSrc.split("/").pop(), natural: i.naturalWidth+"x"+i.naturalHeight,
  displayed: Math.round(i.getBoundingClientRect().width)+"x"+Math.round(i.getBoundingClientRect().height),
  loading: i.loading, alt: JSON.stringify(i.alt) }))));
await b.close();
