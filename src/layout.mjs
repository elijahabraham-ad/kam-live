import { site, nav, posts, bibleStudy } from "./config.mjs";

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

/* The prayer hotline. Every place the number appears goes through here, so
   the dialable digits and the live/not-live switch live in one config value.
   The vanity spelling is what people remember; the tel: link always carries
   the real ten digits, because "4YOU" runs three digits past a US number. */
export const hotlineHref = () => `tel:${site.hotline.digits}`;
export function hotlineLink(cls = "tlink") {
  const h = site.hotline;
  if (!h.live) return `<span class="${cls.replace(/\btlink\b/, "").trim()} is-soon">${esc(h.display)}</span> <span class="tba">Launching soon</span>`;
  return `<a class="${cls}" href="${hotlineHref()}" aria-label="Call the ${esc(h.label)}, ${esc(h.digitsLabel)}">${esc(h.display)}</a>`;
}

/* Bible Study joins the nav only once it is switched on in config. */
const navFor = () =>
  bibleStudy.active
    ? [...nav.slice(0, 4), { label: "Bible Study", href: "/bible-study/" }, ...nav.slice(4)]
    : nav;

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..800&family=Instrument+Sans:wght@400..700&display=swap";

function header(current, safety) {
  const links = navFor()
    .map((n) => {
      const on = current === n.href ? ' aria-current="page"' : "";
      return `<a class="bar__link" href="${n.href}"${on}>${esc(n.label)}</a>`;
    })
    .join("");
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="bar" data-bar>
  <a class="bar__mark" href="/" aria-label="${esc(site.name)} home">
    <img src="/img/kam-emblem-sm.webp" width="208" height="240" alt="" decoding="async">
    <span class="bar__mark-txt"><b>Kingdom Assembly</b><i>Missions</i></span>
  </a>
  <nav class="bar__nav" aria-label="Main">${links}</nav>
  <div class="bar__end">
    ${safety ? "" : `<a class="bar__pray" href="${site.hotline.live ? hotlineHref() : "/prayer/#prayer-line"}" aria-label="${site.hotline.live ? `Call the ${esc(site.hotline.label)}, ${esc(site.hotline.digitsLabel)}` : `${esc(site.hotline.label)}, launching soon`}">${site.hotline.live ? `<svg class="bar__pray-ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>` : ""}<span class="bar__pray-txt"><span>${site.hotline.live ? "Prayer line" : "Prayer line &middot; soon"}</span><b>${esc(site.hotline.display)}</b></span><span class="bar__pray-short">${site.hotline.live ? "Pray" : "Prayer"}</span></a>`}
    ${safety
      ? `<button class="bar__exit" type="button" data-exit>Leave this site</button>`
      : `<a class="btn btn--gold bar__give" href="${giveHref()}"${giveAttrs()}>Give</a>`}
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
    ${navFor().map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("\n    ")}
    <a href="/give/">Give</a>
    <a href="/about/">About</a>
    <a href="/discipleship/">Discipleship</a>
  </nav>
  <div class="menu__foot">
    <span class="rule-label">Start here</span>
    <a class="menu__help" href="/need-help/">I need help</a>
    ${safety ? "" : `<a class="menu__pray" href="${site.hotline.live ? hotlineHref() : "/prayer/#prayer-line"}">Prayer line ${esc(site.hotline.display)}${site.hotline.live ? "" : " (launching soon)"}</a>`}
    <a href="/prayer/">Request prayer</a>
    <a href="/contact/">Contact KAM</a>
  </div>
</div>`;
}

function footer(safety) {
  const contactLine = [
    isTBD(site.email) ? null : `<a class="foot__email" href="mailto:${esc(site.email)}">${esc(site.email)}</a>`,
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
      <img src="/img/kam-emblem-sm.webp" width="208" height="240" alt="" loading="lazy" decoding="async">
      <p class="foot__stmt">Call. Connect. Restore.</p>
      <p class="foot__tag">${esc(site.tagline)}</p>
      <p class="foot__where">${esc(site.city)}, ${esc(site.regionCode)}</p>
      ${safety ? "" : `<p class="foot__pray"><span class="rule-label">${esc(site.hotline.label)}</span>${hotlineLink("foot__pray-num")}<span class="foot__pray-digits">${esc(site.hotline.digitsLabel)}</span></p>`}
    </div>

    <nav class="foot__col" aria-label="Mission">
      <span class="rule-label">Mission</span>
      <a href="/mission/">Our mission</a>
      <a href="/programs/">Programs</a>
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
      ${bibleStudy.active ? '<a href="/bible-study/">Bible study</a>' : ""}
      <a href="/volunteer/">Serve with us</a>
      <a href="/partner/">Partner with us</a>
      <a href="/give/">Give</a>
      <a href="/stories/">Stories of restoration</a>
      ${posts.length ? '<a href="/news/">News and updates</a>' : ""}
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
    <p>&copy; ${new Date().getFullYear()} Kingdom Assembly Missions. Call. Connect. Restore.</p>
    <p class="foot__note">In immediate danger? Call <a href="tel:911">911</a>. Domestic violence: <a href="tel:18007997233">1-800-799-7233</a>. Crisis or suicide: <a href="tel:988">988</a>.</p>
    <p class="foot__credit">Scripture quotations are from the ESV&reg; Bible (The Holy Bible, English Standard Version&reg;), copyright &copy; 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.</p>
  </div>
</footer>`;
}

/**
 * page = { path, title, description, body, bodyClass, jsonld, noindex, ogTitle }
 */
export function render(page) {
  const canonical = site.origin.replace(/\/$/, "") + page.path;
  // Match the full name only. Matching the "KAM" abbreviation too meant
  // "Contact KAM" kept an 11-character tab title with the ministry unnamed.
  const title = page.title.includes("Kingdom Assembly")
    ? page.title
    : `${page.title} · Kingdom Assembly Missions`;

  const jsonld = (page.jsonld || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en" data-endpoint="${esc(site.formEndpoint)}" data-email="${isTBD(site.email) ? "" : esc(site.email)}" data-pray="${site.hotline.live ? esc(site.hotline.display) : ""}" data-pray-tel="${site.hotline.live ? esc(hotlineHref()) : ""}" data-hs-portal="${esc(site.hubspot?.portalId || "TBD")}" data-hs-form="${esc(site.hubspot?.formGuid || "TBD")}" data-hs-region="${esc(site.hubspot?.region || "na1")}">
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
<meta property="og:image:alt" content="Kingdom Assembly Missions. Call. Connect. Restore. ${esc(site.tagline)}">
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
${site.hubspot && site.hubspot.portalId && site.hubspot.portalId !== "TBD" ? `<script id="hs-script-loader" async defer src="https://js${site.hubspot.region === "eu1" ? "-eu1" : ""}.hs-scripts.com/${esc(site.hubspot.portalId)}.js"></script>` : ""}
</head>
<body class="${page.bodyClass || ""}">
<span data-sc-progress></span>
<div class="sc-grain" aria-hidden="true"></div>
${header(page.path, page.safety)}
<main id="main">
${page.body}
</main>
${footer(page.safety)}
<script src="/scrollcraft.js"></script>
<script>ScrollCraft.mount(document.body);</script>
<script src="/kam.js"></script>
</body>
</html>`;
}
