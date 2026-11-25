import { site, nav, bibleStudy, BIBLE_TOPIC } from "./config.mjs";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* A value that has not been supplied yet. Never invent one. */
export const isTBD = (v) => !v || v === "TBD";

/* Every DONATE control on the site routes through here, so the payment link
   is one value in config. Without it, Donate goes to the on-site page. */
export const giveHref = () => (isTBD(site.donateUrl) ? "/donate/#how" : site.donateUrl);
export const giveAttrs = () => (isTBD(site.donateUrl) ? "" : ' target="_blank" rel="noopener"');

/* Every JOIN BIBLE STUDY control routes through here. With the Zoom link set
   it goes straight there; until then it opens the contact form with the Bible
   study topic already chosen, so the button never dead-ends. */
export const bibleHref = () =>
  isTBD(bibleStudy.url)
    ? `/get-involved/?topic=${encodeURIComponent(BIBLE_TOPIC)}#contact`
    : bibleStudy.url;
export const bibleAttrs = () => (isTBD(bibleStudy.url) ? "" : ' target="_blank" rel="noopener"');

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Sans:wght@400..700&display=swap";

function header(current) {
  const links = nav
    .filter((n) => n.href !== "/donate/")
    .map((n) => {
      const on = current === n.href ? ' aria-current="page"' : "";
      return `<a class="bar__link" href="${n.href}"${on}>${esc(n.label)}</a>`;
    })
    .join("");
  const donateOn = current === "/donate/" ? ' aria-current="page"' : "";
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="bar">
  <a class="bar__mark" href="/" aria-label="${esc(site.name)} home">
    <img src="/img/kam-emblem-sm.webp" width="208" height="240" alt="" decoding="async">
    <span class="bar__mark-txt"><b>Kingdom Assembly</b><i>Missions</i></span>
  </a>
  <nav class="bar__nav" aria-label="Main">${links}</nav>
  <div class="bar__end">
    <a class="btn btn--line bar__bible" href="${bibleHref()}"${bibleAttrs()}>Join Bible Study</a>
    <a class="btn btn--gold bar__give" href="/donate/"${donateOn}>Donate</a>
    <button class="bar__burger" type="button" data-menu-open aria-expanded="false" aria-controls="sitemenu">
      <span class="bar__burger-ico" aria-hidden="true"><i></i><i></i><i></i></span>
      <em>Menu</em>
    </button>
  </div>
</header>

<div class="menu" id="sitemenu" hidden data-menu>
  <div class="menu__head">
    <span class="rule-label">${esc(site.words)}</span>
    <button class="menu__close" type="button" data-menu-close aria-label="Close menu">Close</button>
  </div>
  <nav class="menu__nav" aria-label="Main menu">
    ${nav.map((n) => `<a href="${n.href}"${current === n.href ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`).join("\n    ")}
  </nav>
  <div class="menu__foot">
    <a class="btn btn--gold btn--lg" href="${bibleHref()}"${bibleAttrs()}>Join Bible Study</a>
  </div>
</div>`;
}

function footer() {
  const socials = Object.entries(site.social)
    .filter(([, v]) => !isTBD(v))
    .map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${k[0].toUpperCase() + k.slice(1)}</a>`)
    .join("");

  return `
<footer class="foot">
  <div class="foot__grid wrap">
    <div class="foot__brand">
      <img src="/img/kam-emblem-sm.webp" width="208" height="240" alt="" loading="lazy" decoding="async">
      <p class="foot__name">Kingdom Assembly Missions</p>
      <p class="foot__words">${esc(site.words)}</p>
      <p class="foot__tag">${esc(site.tagline)}</p>
    </div>

    <nav class="foot__col" aria-label="Footer">
      <span class="rule-label">Pages</span>
      ${nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("\n      ")}
    </nav>

    <div class="foot__col">
      <span class="rule-label">Contact</span>
      <a class="foot__email" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      <span class="foot__where">${esc(site.city)}, ${esc(site.region)}</span>
      <a href="/get-involved/#contact">Send us a message</a>
      <a href="${bibleHref()}"${bibleAttrs()}>Join Bible Study</a>
      ${socials ? `<span class="foot__social">${socials}</span>` : ""}
    </div>
  </div>

  <div class="foot__base wrap">
    <p>&copy; ${new Date().getFullYear()} Kingdom Assembly Missions. All rights reserved.</p>
    <p><a href="/privacy/">Privacy policy</a></p>
  </div>
</footer>`;
}

/**
 * page = { path, title, description, body, jsonld, noindex, ogTitle }
 */
export function render(page) {
  const canonical = site.origin.replace(/\/$/, "") + page.path;
  const title = page.title.includes("Kingdom Assembly")
    ? page.title
    : `${page.title} · Kingdom Assembly Missions`;

  const jsonld = (page.jsonld || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en" data-endpoint="${esc(site.formEndpoint)}" data-email="${isTBD(site.email) ? "" : esc(site.email)}">
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
<meta property="og:image" content="${site.origin}/img/share-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Kingdom Assembly Missions. ${esc(site.words)} ${esc(site.tagline)}">
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

/* A stub left at a retired address (Selvin 2026-11-25: old content must not
   stay reachable by direct link). It carries no old content, is never
   indexed, and forwards to the page that replaced it. */
export function redirectPage(from, to) {
  const target = site.origin.replace(/\/$/, "") + to.replace(/#.*$/, "");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kingdom Assembly Missions</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)});</script>
</head>
<body>
<p>This page has moved. <a href="${to}">Continue to Kingdom Assembly Missions</a>.</p>
</body>
</html>`;
}
