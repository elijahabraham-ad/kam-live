import { esc, isTBD } from "./layout.mjs";
import { site, impact, gallery, galleryEvents } from "./config.mjs";

/* The weekday is DERIVED from the date, never typed by hand. */
export function eventDate(e) {
  const d = new Date(e.date + "T12:00:00");
  return {
    d,
    label: d.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" }),
  };
}

/* --------------------------------------------------------------- headers -- */
export function pageHead({ label, h1, lede, ground = "dark", actions = "" }) {
  return `
<section class="phead ground--${ground}">
  <div class="wrap">
    <div data-sc-in data-sc-stagger="70">
      ${label ? `<span class="rule-label">${esc(label)}</span>` : ""}
      <h1 class="h-xl">${h1}</h1>
      ${lede ? `<p class="lede">${lede}</p>` : ""}
      ${actions ? `<div class="btn-row" style="margin-top:var(--sc-6)">${actions}</div>` : ""}
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- impact -- */
/* The three confirmed figures. Large numbers, short labels, three columns on
   desktop and stacked on a phone. Nothing here is ever animated or counted up:
   the figure on the page is the figure KAM gave us, from the first frame. */
export function impactSection({ ground = "dark", heading = true } = {}) {
  return `
<section class="sec impact ground--${ground}" id="impact">
  <div class="wrap">
    ${heading ? `<div class="impact__head" data-sc-in data-sc-stagger="70">
      <span class="rule-label">Our impact</span>
      <h2 class="h-lg">The impact of our mission</h2>
    </div>` : ""}
    <ul class="impact__list" role="list">
      ${impact
        .map(
          (s) => `
      <li class="impact__item">
        <span class="impact__n">${esc(s.n)}</span>
        <span class="impact__label">${esc(s.label)}</span>
      </li>`
        )
        .join("")}
    </ul>
    <p class="impact__note">Every number represents an opportunity to demonstrate the love of Jesus Christ through service, prayer, the Gospel, and discipleship.</p>
  </div>
</section>`;
}

/* ---------------------------------------------------------- closing band -- */
export function closingBand({
  head = "Love. Serve. Impact.",
  body = "Together, we can serve our communities, share the Gospel, and make disciples of Jesus Christ.",
  label = "Support the mission",
  href = "/donate/",
} = {}) {
  return `
<section class="sec close-band ground--ink">
  <span class="close-band__glow" aria-hidden="true"></span>
  <div class="wrap wrap--mid close-band__inner" data-sc-in data-sc-stagger="80">
    <img class="close-band__seal" src="/img/kam-emblem-sm.webp" width="208" height="240" alt="" loading="lazy" decoding="async">
    <h2 class="h-lg">${esc(head)}</h2>
    <p class="lede">${esc(body)}</p>
    <div class="btn-row" style="justify-content:center">
      <a class="btn btn--gold btn--lg" href="${href}">${esc(label)}</a>
    </div>
    <p class="close-band__line">We don&rsquo;t just talk about the love of Jesus. We demonstrate it.</p>
  </div>
</section>`;
}

/* ----------------------------------------------------------------- form --- */
/**
 * fields: array of field descriptors.
 *  { type:"text"|"email"|"tel"|"textarea"|"select"|"checkgroup",
 *    name, label, hint, required, options:[], placeholder, autocomplete }
 */
export function form({ id, submit = "Send", success, fields, note = "" }) {
  /* Every id is scoped to its form, so two forms on one page never share
     #name and #email and a <label> never focuses the wrong form. */
  const uid = (n) => `${id}-${n}`;
  const body = fields
    .map((f) => {
      const req = f.required ? " required" : "";
      const rq = f.required ? ' <span aria-hidden="true" style="color:var(--sc-accent)">*</span>' : "";
      const hint = f.hint ? `<p class="hint" id="${uid(f.name)}-hint">${f.hint}</p>` : "";
      const desc = f.hint ? ` aria-describedby="${uid(f.name)}-hint"` : "";

      if (f.type === "checkgroup") {
        const boxes = f.options
          .map(
            (o) => `
        <label class="check">
          <input type="checkbox" name="${f.name}" value="${esc(o)}">
          <span>${esc(o)}</span>
        </label>`
          )
          .join("");
        return `
      <fieldset class="field" style="border:0;padding:0;margin:0">
        <legend class="rule-label rule-label--soft" style="margin-bottom:var(--sc-3)">${esc(f.label)}</legend>
        ${hint}
        <div class="check-group">${boxes}</div>
      </fieldset>`;
      }

      if (f.type === "select") {
        const opts = f.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
        return `
      <div class="field">
        <label for="${uid(f.name)}">${esc(f.label)}${rq}</label>
        ${hint}
        <select id="${uid(f.name)}" name="${f.name}"${req}${desc}>
          <option value="">Choose one</option>
          ${opts}
        </select>
      </div>`;
      }

      if (f.type === "textarea") {
        return `
      <div class="field">
        <label for="${uid(f.name)}">${esc(f.label)}${rq}</label>
        ${hint}
        <textarea id="${uid(f.name)}" name="${f.name}" placeholder="${esc(f.placeholder || "")}"${req}${desc}></textarea>
      </div>`;
      }

      return `
      <div class="field">
        <label for="${uid(f.name)}">${esc(f.label)}${rq}</label>
        ${hint}
        <input type="${f.type}" id="${uid(f.name)}" name="${f.name}" placeholder="${esc(f.placeholder || "")}"${req}${desc}${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ""}>
      </div>`;
    })
    .join("");

  /* Known at build time: with no endpoint, say so ABOVE the fields, before
     anyone types, and offer the email route instead. */
  const pre = isTBD(site.formEndpoint)
    ? `<p class="form__pre">Our online form is not connected yet. When you press send, we will open an email to KAM (${esc(site.email)}) with what you wrote, for you to send.</p>`
    : "";

  return `
<form class="form" data-kam-form="${id}"${success ? ` data-success="${esc(success)}"` : ""} novalidate>
  ${pre}
  ${body}
  <div class="hp"><label for="${id}-hp">Leave this field empty</label><input type="text" id="${id}-hp" name="_hp" tabindex="-1" autocomplete="off"></div>
  ${note ? `<p class="hint form__note">${note}</p>` : ""}
  <div class="btn-row">
    <button class="btn btn--gold btn--lg" type="submit">${esc(submit)}</button>
  </div>
  <p class="form__status" role="status" aria-live="polite" tabindex="-1" hidden></p>
</form>`;
}

/* ------------------------------------------------------------ JSON-LD ----- */
export function orgJsonLd() {
  const o = {
    "@context": "https://schema.org",
    "@type": ["NGO", "Organization"],
    name: site.name,
    alternateName: site.abbr,
    url: site.origin,
    logo: site.origin + "/img/kam-emblem.png",
    slogan: `${site.words} ${site.tagline}`,
    description: site.statement,
    email: site.email,
    areaServed: { "@type": "City", name: "Greenville", address: { "@type": "PostalAddress", addressRegion: "SC", addressCountry: "US" } },
  };
  const socials = Object.values(site.social).filter((v) => !isTBD(v));
  if (socials.length) o.sameAs = socials;
  return o;
}

/* --- Photos and video ------------------------------------------------------
   A photo without a consent date never publishes. */
export const published = (items) => (items || []).filter((g) => g.consent);

/* The label under a caption: "Feeding outreach · November 15". */
function shotTag(g) {
  const ev = galleryEvents.find((e) => e.key === g.event);
  if (!ev) return "";
  return `${esc(ev.title)} &middot; ${esc(eventDate(ev).d.toLocaleString("en-US", { month: "long", day: "numeric" }))}`;
}

/* One photo or clip. width/height plus aspect-ratio reserve the space before
   the file arrives. Clips are preload="none": nothing downloads until somebody
   presses play. */
export function shotFigure(g, { tag = true } = {}) {
  const ar = g.w && g.h ? ` style="aspect-ratio:${g.w}/${g.h}"` : "";
  const dims = g.w && g.h ? ` width="${g.w}" height="${g.h}"` : "";
  const media = g.video
    ? `<video controls preload="none" playsinline${dims}${ar}${g.poster ? ` poster="${esc(g.poster)}"` : ""} aria-label="${esc(g.alt)}"><source src="${esc(g.src)}" type="video/mp4"></video>`
    : `<img src="${esc(g.small || g.src)}"${g.small && g.w ? ` srcset="${esc(g.small)} ${Math.round(g.w / 2)}w, ${esc(g.src)} ${g.w}w" sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px"` : ""}${dims}${ar} alt="${esc(g.alt)}" loading="lazy" decoding="async">`;
  const t = tag ? shotTag(g) : "";
  return `
      <figure class="shot${g.video ? " shot--video" : ""}">
        ${media}
        ${g.caption ? `<figcaption>${esc(g.caption)}${t ? ` <span>${t}</span>` : ""}</figcaption>` : ""}
      </figure>`;
}

/* A plain photo for a content column: fixed 4:3 frame, small file first. */
export function photo(g, { eager = false, cls = "pic" } = {}) {
  if (!g) return "";
  return `<img class="${cls}" src="${esc(g.small || g.src)}"${g.small && g.w ? ` srcset="${esc(g.small)} ${Math.round(g.w / 2)}w, ${esc(g.src)} ${g.w}w" sizes="(max-width: 860px) 100vw, 50vw"` : ""} width="${g.w}" height="${g.h}" alt="${esc(g.alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

export function galleryBlock({ ground = "dark", heading = "See the work", lede = "", skip = [] } = {}) {
  // `skip` leaves out photos the same page already shows above the wall.
  const ok = published(gallery).filter((g) => !skip.some((k) => g.src.includes(k)));
  if (!ok.length) return "";
  return `
<section class="sec ground--${ground}" id="photos">
  <div class="wrap">
    <div class="stack" data-sc-in data-sc-stagger="60" style="margin-bottom:var(--sc-7)">
      <span class="rule-label">Photos and video</span>
      <h2 class="h-lg">${esc(heading)}</h2>
      ${lede ? `<p class="body">${esc(lede)}</p>` : ""}
    </div>
    <div class="shots">${ok.map((g) => shotFigure(g)).join("")}</div>
  </div>
</section>`;
}
