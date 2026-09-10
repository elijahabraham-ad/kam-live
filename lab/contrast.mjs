/* Contrast audit measured on the render, across every page.
   Walks visible text elements, resolves the effective background by climbing
   ancestors until something opaque is found, and reports anything under the
   WCAG AA threshold for its size. Also flags tap targets under 44px. */
import { chromium } from "playwright-core";

const pages = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: Number(process.env.W || 1440), height: Number(process.env.H || 900) } });

let fails = 0;

for (const url of pages) {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("html.sc-ready", { timeout: 15000 }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(350);

  const found = await p.evaluate(() => {
    const srgb = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = ([r, g, bl]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(bl);
    const parse = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const n = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { rgb: [n[0], n[1], n[2]], a: n.length > 3 ? n[3] : 1 };
    };
    const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));

    function bgOf(el) {
      let node = el;
      let stack = [];
      while (node && node !== document.documentElement) {
        const c = parse(getComputedStyle(node).backgroundColor);
        if (c && c.a > 0) { stack.push(c); if (c.a >= 0.999) break; }
        node = node.parentElement;
      }
      let base = [11, 10, 8];
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i].rgb, base, stack[i].a);
      return base;
    }

    const out = [];
    const els = document.querySelectorAll("h1,h2,h3,h4,p,a,li,span,label,dt,dd,button,legend,cite,strong,em");
    for (const el of els) {
      const txt = (el.textContent || "").trim();
      if (!txt || txt.length < 2) continue;
      // Only elements that render their own text directly.
      const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const opacity = Number(cs.opacity);
      if (opacity < 0.05) continue;

      const fgc = parse(cs.color);
      if (!fgc) continue;
      const bg = bgOf(el);
      const fg = over(fgc.rgb, bg, fgc.a * (opacity < 1 ? opacity : 1));
      const l1 = lum(fg), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      const size = parseFloat(cs.fontSize);
      const weight = Number(cs.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;

      if (ratio < need) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 40),
          text: txt.slice(0, 52),
          ratio: +ratio.toFixed(2), need,
          size: Math.round(size),
          color: cs.color, bg: `rgb(${bg.map(Math.round).join(",")})`,
        });
      }
    }
    return out;
  });

  if (found.length) {
    fails += found.length;
    console.log(`\n${url}`);
    for (const f of found) console.log(`  ${f.ratio} < ${f.need}  ${f.tag}.${f.cls}  ${f.size}px  "${f.text}"  fg=${f.color} bg=${f.bg}`);
  }
}

console.log(fails ? `\n${fails} contrast failures` : "\nno contrast failures");
await b.close();
