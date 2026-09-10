import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
for (const w of [390, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  let bytes = 0;
  p.on("response", async (r) => { try { const h = r.headers()["content-length"]; if (h) bytes += Number(h); } catch {} });
  await p.goto("http://localhost:4500/", { waitUntil: "networkidle" });
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${w}px  transferred ~${Math.round(bytes/1024)}kB  horizontal overflow ${over}px`);
  await p.close();
}
// overflow across every page at phone width
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const paths = ["/","/about/","/mission/","/programs/","/programs/mental-health/","/programs/homelessness/","/programs/youth/","/programs/womens-support/","/programs/recovery/","/discipleship/","/events/","/give/","/get-involved/","/volunteer/","/partner/","/stories/","/prayer/","/contact/","/need-help/","/404.html"];
let bad=0;
for (const path of paths) {
  await p.goto("http://localhost:4500"+path, { waitUntil: "networkidle" });
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) { console.log("OVERFLOW", path, over+"px"); bad++; }
}
console.log(bad? bad+" pages overflow at 390px" : "no horizontal overflow on any page at 390px");
await b.close();
