import { site, nav } from "./config.mjs";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* A value that has not been supplied yet. Never invent one. */
export const isTBD = (v) => !v || v === "TBD";
export const orTBA = (v, label = "To be announced") =>
  isTBD(v) ? `<span class="tba">${label}</span>` : esc(v);

/* Every GIVE control on the site routes through here, so when the real
   donation link lands there is exactly one value to change. */
export const giveHref = () => (isTBD(site.donateUrl) ? "/give/" : site.donateUrl);
export const giveAttrs = () =>
  isTBD(site.donateUrl) ? "" : ' target="_blank" rel="noopener"';

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..800&family=Instrument+Sans:wght@400..700&display=swap";

function header(current) {
  const links = nav
    .map((n) => {
      const on = current === n.href ? ' aria-current="page"' : "";
      return `<a class="bar__link" href="${n.href}"${on}>${esc(n.label)}</a>`;
    })
    .join("");
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="bar" data-bar>
  <a class="bar__mark" href="/" aria-label="${esc(site.name)} home">
    <img src="/img/kam-emblem-sm.png" width="104" height="120" alt="" decoding="async">
    <span class="bar__mark-txt"><b>Kingdom Assembly</b><i>Missions</i></span>
  </a>
  <nav class="bar__nav" aria-label="Main">${links}</nav>
  <div class="bar__end">
    <a class="btn btn--gold bar__give" href="${giveHref()}"${giveAttrs()}>Give</a>
    <button class="bar__burger" type="button" data-menu-open aria-expanded="false" aria-controls="sitemenu">
      <span class="bar__burger-ico" aria-hidden="true"><i></i><i></i><i></i></span>
      <em>Menu</em>
    </button>
  </div>
</header>

<div class="menu" id="sitemenu" hidden data-menu>
  <div class="menu__head">
    <span class="rule-label">Kingdom Assembly Missions</span>
    <button class="menu__close" type="button" data-menu-close aria-label="Close menu">Close</button>
  </div>
  <nav class="menu__nav" aria-label="All pages">
    <a href="/">Home</a>
    ${nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("\n    ")}
    <a href="/give/">Give</a>
  </nav>
  <div class="menu__foot">
    <span class="rule-label">Start here</span>
    <a class="menu__help" href="/need-help/">I need help</a>
    <a href="/prayer/">Request prayer</a>
    <a href="/contact/">Contact KAM</a>
  </div>
</div>`;
}

function footer() {
  const contactLine = [
    isTBD(site.email) ? null : `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`,
    isTBD(site.phone) ? null : `<a href="tel:${esc(site.phone.replace(/[^\d+]/g, ""))}">${esc(site.phone)}</a>`,
  ].filter(Boolean);

  const socials = Object.entries(site.social)
    .filter(([, v]) => !isTBD(v))
    .map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${k[0].toUpperCase() + k.slice(1)}</a>`)
    .join("");

  return `
<footer class="foot">
  <div class="foot__grid wrap">
    <div class="foot__brand">
      <img src="/img/kam-emblem-sm.png" width="104" height="120" alt="" decoding="async">
      <p class="foot__stmt">Reaching the broken.<br>Restoring the community.<br>Advancing the Kingdom.</p>
      <p class="foot__where">${esc(site.city)}, ${esc(site.regionCode)}</p>
    </div>

    <nav class="foot__col" aria-label="Mission">
      <span class="rule-label">Mission</span>
      <a href="/mission/">Our mission</a>
      <a href="/programs/mental-health/">Mental health</a>
      <a href="/programs/homelessness/">Homelessness</a>
      <a href="/programs/youth/">At-risk youth</a>
      <a href="/programs/womens-support/">Women's support</a>
      <a href="/programs/recovery/">Addiction and recovery</a>
    </nav>

    <nav class="foot__col" aria-label="Take part">
      <span class="rule-label">Take part</span>
      <a href="/events/">Events</a>
      <a href="/discipleship/">Discipleship</a>
      <a href="/volunteer/">Serve with us</a>
      <a href="/partner/">Partner with us</a>
      <a href="/give/">Give</a>
      <a href="/stories/">Stories of restoration</a>
    </nav>

    <nav class="foot__col" aria-label="Reach us">
      <span class="rule-label">Reach us</span>
      <a href="/contact/">Contact</a>
      <a href="/prayer/">Request prayer</a>
      <a href="/need-help/">I need help</a>
      <a href="/about/">About KAM</a>
      ${contactLine.join("\n      ")}
      ${socials ? `<span class="foot__social">${socials}</span>` : ""}
    </nav>
  </div>

  <div class="foot__base wrap">
    <p>&copy; ${new Date().getFullYear()} Kingdom Assembly Missions. Love. Serve. Impact.</p>
    <p class="foot__note">In immediate danger? Call <a href="tel:911">911</a>. Domestic violence: <a href="tel:18007997233">1-800-799-7233</a>. Crisis or suicide: <a href="tel:988">988</a>.</p>
  </div>
</footer>`;
}

/**
 * page = { path, title, description, body, bodyClass, jsonld, noindex, ogTitle }
 */
export function render(page) {
  const canonical = site.origin.replace(/\/$/, "") + page.path;
  const title = page.title.includes(site.abbr) || page.title.includes("Kingdom Assembly")
    ? page.title
    : `${page.title} · Kingdom Assembly Missions`;

  const jsonld = (page.jsonld || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en" data-endpoint="${esc(site.formEndpoint)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : ""}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.origin}/img/kam-emblem.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B0A08">
<link rel="icon" href="/img/kam-emblem-sm.png" type="image/png">
<link rel="apple-touch-icon" href="/img/kam-emblem-sm.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/scrollcraft.css">
<link rel="stylesheet" href="/theme.css">
${jsonld}
</head>
<body class="${page.bodyClass || ""}">
<span data-sc-progress></span>
<div class="sc-grain" aria-hidden="true"></div>
${header(page.path)}
<main id="main">
${page.body}
</main>
${footer()}
<script src="/scrollcraft.js"></script>
<script>ScrollCraft.mount(document.body);</script>
<script src="/kam.js"></script>
</body>
</html>`;
}
