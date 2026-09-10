/* Renders the 1200x630 Open Graph card in a real browser so it uses the site's
   actual fonts and gold, rather than being approximated in an image tool. */
import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:4500/", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="http://localhost:4500/theme.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..800&family=Instrument+Sans:wght@400..700&display=swap">
<style>
 html,body{margin:0;width:1200px;height:630px;overflow:hidden}
 .card{width:1200px;height:630px;background:#0B0A08;display:grid;grid-template-columns:330px 1fr;
       align-items:center;gap:44px;padding:0 64px;box-sizing:border-box;position:relative}
 .card::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 22% 50%,rgba(217,180,80,.16),transparent 58%)}
 .card img{width:252px;height:auto;position:relative;z-index:2;justify-self:center}
 .t{position:relative;z-index:2}
 .k{font:600 15px/1 "Instrument Sans",sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#D9B450;margin:0 0 22px}
 h1{font-family:"Fraunces",serif;font-variation-settings:"SOFT" 0,"WONK" 0;font-weight:500;
    font-size:50px;line-height:1.02;letter-spacing:-.028em;color:#F6F1E5;margin:0}
 h1 em{font-style:italic;color:#D9B450}
 p{font:400 22px/1.5 "Instrument Sans",sans-serif;color:#A99C86;margin:26px 0 0;max-width:26ch}
 .r{position:absolute;left:64px;right:64px;bottom:46px;height:1px;background:linear-gradient(90deg,#D9B450,rgba(217,180,80,.06));z-index:2}
 .f{position:absolute;left:64px;bottom:64px;font:600 14px/1 "Instrument Sans",sans-serif;
    letter-spacing:.2em;text-transform:uppercase;color:#A99C86;z-index:2}
</style></head><body>
<div class="card">
  <img src="http://localhost:4500/img/kam-emblem.webp" alt="">
  <div class="t">
    <p class="k">Kingdom Assembly Missions</p>
    <h1>Reaching the broken.<br>Restoring the community.<br><em>Advancing the Kingdom.</em></h1>
  </div>
  <span class="r"></span>
  <span class="f">Greenville, South Carolina &nbsp;&middot;&nbsp; Love. Serve. Impact.</span>
</div></body></html>`, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(700);
await p.locator(".card").screenshot({ path: "static/img/share-card.png" });
await b.close();
console.log("share card written");
