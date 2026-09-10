import { esc, isTBD, orTBA, giveHref, giveAttrs } from "./layout.mjs";
import { site, model, programs, events, crisisResources } from "./config.mjs";

/* --------------------------------------------------------------- headers -- */
export function pageHead({ crumb, label, h1, lede, ground = "dark", actions = "" }) {
  return `
<section class="phead ground--${ground}">
  <div class="wrap">
    ${crumb ? `<p class="crumbs">${crumb}</p>` : ""}
    <div data-sc-in data-sc-stagger="70">
      ${label ? `<span class="rule-label">${esc(label)}</span>` : ""}
      <h1 class="h-xl">${h1}</h1>
      ${lede ? `<p class="lede">${lede}</p>` : ""}
      ${actions ? `<div class="btn-row" style="margin-top:var(--sc-6)">${actions}</div>` : ""}
    </div>
  </div>
</section>`;
}

export function crumb(...pairs) {
  return pairs
    .map((p, i) => (p.href ? `<a href="${p.href}">${esc(p.label)}</a>` : esc(p.label)) + (i < pairs.length - 1 ? " / " : ""))
    .join("");
}

/* ------------------------------------------------------------- the model -- */
export function modelSection({ ground = "dark", heading = "How we serve", lede = "" } = {}) {
  const steps = model
    .map(
      (m) => `
    <div class="model__step">
      <span class="model__dot" aria-hidden="true"></span>
      <div>
        <h3>${esc(m.step)}</h3>
        <p>${esc(m.line)}</p>
      </div>
    </div>`
    )
    .join("");

  return `
<section class="sec ground--${ground}" id="model">
  <div class="wrap">
    <div class="split-side">
      <div class="stack sticky-side" data-sc-in data-sc-stagger="70">
        <span class="rule-label">The KAM outreach model</span>
        <h2 class="h-lg">${esc(heading)}</h2>
        ${lede ? `<p class="body">${esc(lede)}</p>` : ""}
        <p class="body">Nobody is handed a tract and sent on their way, and nobody is handed a meal and left where we found them. Every part of this leads to the next part, and the last one is the point: a person who was served becomes a person who serves.</p>
      </div>
      <div class="model" data-model>
        <span class="model__line" aria-hidden="true"><i></i></span>
        ${steps}
      </div>
    </div>
  </div>
</section>`;
}

/* ----------------------------------------------------------- program set -- */
export function programPlate(p, i) {
  return `
  <a class="plate" href="/programs/${p.slug}/">
    <span class="plate__no">${String(i + 1).padStart(2, "0")}</span>
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.card)}</p>
    <span class="plate__go">Learn more</span>
  </a>`;
}

export function programGrid({ ground = "dark" } = {}) {
  return `
<section class="sec ground--${ground}" id="programs">
  <div class="wrap">
    <div class="stack" data-sc-in data-sc-stagger="70" style="margin-bottom:var(--sc-8)">
      <span class="rule-label">Our mission in action</span>
      <h2 class="h-lg">Five places we are putting our hands.</h2>
      <p class="body">These are not five departments. They are five doors into the same house, and a person who walks through one of them usually needs two of the others.</p>
    </div>
    <div class="plate-grid">${programs.map(programPlate).join("")}</div>
  </div>
</section>`;
}

/* -------------------------------------------------------------- an event -- */
export function eventCard(e, { level = 2 } = {}) {
  const d = new Date(e.date + "T12:00:00");
  const mon = d.toLocaleString("en-US", { month: "long" });
  const day = d.getDate();
  const yr = d.getFullYear();
  const H = `h${level}`;

  const register = isTBD(e.registerUrl)
    ? `<a class="btn btn--gold btn--lg" href="/contact/?about=Event">Save my spot</a>`
    : `<a class="btn btn--gold btn--lg" href="${esc(e.registerUrl)}" target="_blank" rel="noopener">Register</a>`;

  return `
<article class="event">
  <div class="event__grid">
    <div class="event__date">
      <span class="event__mon">${esc(mon)}</span>
      <span class="event__day">${day}</span>
      <span class="event__yr">${yr}</span>
    </div>
    <div class="event__body">
      <span class="rule-label">${e.featured ? "Our first major event" : "Upcoming"}</span>
      <${H} class="h-md">${esc(e.title)}</${H}>
      <p class="lede">${esc(e.blurb)}</p>
      <dl class="event__meta">
        <div><dt>When</dt><dd>${esc(e.dateLabel)}, ${orTBA(e.time, "Time TBA")}</dd></div>
        <div><dt>Where</dt><dd>${orTBA(e.venue, "Venue TBA")}${e.city ? `, ${esc(e.city)}` : ""}</dd></div>
        <div><dt>Cost</dt><dd>${esc(e.cost)}</dd></div>
      </dl>
      <div class="btn-row" style="margin-top:var(--sc-3)">
        ${register}
        <a class="btn btn--line" href="/volunteer/?role=Event%20support">Volunteer</a>
        <a class="btn btn--line" href="${giveHref()}"${giveAttrs()}>Support the event</a>
      </div>
    </div>
  </div>
</article>`;
}

export const upcoming = () => events.filter((e) => e.status === "upcoming");

/* ------------------------------------------------------------ the doors -- */
export function doorsSection({ ground = "dark" } = {}) {
  return `
<section class="sec ground--${ground}" id="get-involved">
  <div class="wrap">
    <div class="stack" data-sc-in data-sc-stagger="70" style="margin-bottom:var(--sc-7)">
      <span class="rule-label">Get involved</span>
      <h2 class="h-lg">Three ways in.</h2>
    </div>
    <div class="doors" data-sc-in data-sc-stagger="80">
      <a class="door" href="${giveHref()}"${giveAttrs()}>
        <div><h3>Give</h3><p>Fund the meals, the Bibles, the hygiene kits, the room, and the fund that helps a woman leave.</p></div>
        <span class="door__go">Give today</span>
      </a>
      <a class="door" href="/volunteer/">
        <div><h3>Serve</h3><p>You do not have to be a pastor to make a difference. Bring a truck, a skill, an hour, or a listening ear.</p></div>
        <span class="door__go">Serve with us</span>
      </a>
      <a class="door" href="/partner/">
        <div><h3>Partner</h3><p>For churches, businesses, counselors and organizations who want to put real capacity behind this.</p></div>
        <span class="door__go">Become a partner</span>
      </a>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------- closing band -- */
export function closingBand({
  head = "Help us build a place where lives are changed and the Kingdom is advanced.",
  ground = "ink",
} = {}) {
  return `
<section class="sec statement close-band ground--${ground}">
  <span class="close-band__glow" aria-hidden="true"></span>
  <div class="wrap wrap--mid close-band__inner" data-sc-in data-sc-stagger="80">
    <img class="close-band__seal" src="/img/kam-emblem-sm.png" width="104" height="120" alt="" decoding="async">
    <h2 class="h-lg">${esc(head)}</h2>
    <div class="btn-row" style="justify-content:center">
      <a class="btn btn--gold btn--lg" href="${giveHref()}"${giveAttrs()}>Give today</a>
      <a class="btn btn--line btn--lg" href="/volunteer/">Volunteer</a>
      <a class="btn btn--line btn--lg" href="/events/">Attend an event</a>
    </div>
    <p class="body" style="max-width:44ch;color:var(--sc-ink-soft)">We believe God can take the broken pieces and mend them back together. That is what Kingdom Assembly Missions is about.</p>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- crisis -- */
export function crisisBlock({ intro = true } = {}) {
  const items = crisisResources
    .map(
      (r) => `
    <div class="crisis__item${r.urgent ? " crisis__item--urgent" : ""}">
      <div>
        <h3>${esc(r.name)}</h3>
        <p>${esc(r.note)}${r.link ? ` <a class="tlink" href="${esc(r.link)}" target="_blank" rel="noopener" style="font-size:0.88em">Website</a>` : ""}</p>
      </div>
      <a class="crisis__num" href="${esc(r.href)}">${esc(r.contact)}</a>
    </div>`
    )
    .join("");

  return `
${intro ? `<p class="lede" style="margin-bottom:var(--sc-6)">If you are in immediate danger, do not read further. Call 911 now.</p>` : ""}
<div class="crisis">${items}</div>`;
}

/* ----------------------------------------------------------------- form --- */
/**
 * fields: array of field descriptors.
 *  { type:"text"|"email"|"tel"|"textarea"|"select"|"checkbox"|"checkgroup",
 *    name, label, hint, required, options:[], placeholder, row:true }
 */
export function form({ id, submit = "Send", success, fields, note = "" }) {
  const body = fields
    .map((f) => {
      const req = f.required ? " required" : "";
      const rq = f.required ? ' <span aria-hidden="true" style="color:var(--sc-accent)">*</span>' : "";
      const hint = f.hint ? `<p class="hint" id="${f.name}-hint">${f.hint}</p>` : "";
      const desc = f.hint ? ` aria-describedby="${f.name}-hint"` : "";

      if (f.type === "checkbox") {
        return `
      <label class="check">
        <input type="checkbox" name="${f.name}" value="yes">
        <span>${f.label}</span>
      </label>`;
      }

      if (f.type === "checkgroup") {
        const boxes = f.options
          .map(
            (o, i) => `
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
        <label for="${f.name}">${esc(f.label)}${rq}</label>
        ${hint}
        <select id="${f.name}" name="${f.name}"${req}${desc}>
          <option value="">Choose one</option>
          ${opts}
        </select>
      </div>`;
      }

      if (f.type === "textarea") {
        return `
      <div class="field">
        <label for="${f.name}">${esc(f.label)}${rq}</label>
        ${hint}
        <textarea id="${f.name}" name="${f.name}" placeholder="${esc(f.placeholder || "")}"${req}${desc}></textarea>
      </div>`;
      }

      return `
      <div class="field">
        <label for="${f.name}">${esc(f.label)}${rq}</label>
        ${hint}
        <input type="${f.type}" id="${f.name}" name="${f.name}" placeholder="${esc(f.placeholder || "")}"${req}${desc}${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ""}>
      </div>`;
    })
    .join("");

  const rows = fields.filter((f) => f.row);

  return `
<form class="form" data-kam-form="${id}"${success ? ` data-success="${esc(success)}"` : ""} novalidate>
  ${body}
  <label class="hp" aria-hidden="true">Leave this field empty<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label>
  ${note ? `<p class="hint" style="color:var(--sc-ink-soft);font-size:0.88rem;line-height:1.55">${note}</p>` : ""}
  <div class="btn-row">
    <button class="btn btn--gold btn--lg" type="submit">${esc(submit)}</button>
  </div>
  <p class="form__status" hidden></p>
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
    slogan: site.tagline,
    description:
      "Kingdom Assembly Missions is a Christian community outreach and discipleship ministry in Greenville, South Carolina, serving mental health, homelessness, at-risk youth, women leaving abuse, and addiction recovery.",
    areaServed: { "@type": "City", name: "Greenville", address: { "@type": "PostalAddress", addressRegion: "SC", addressCountry: "US" } },
  };
  if (!isTBD(site.email)) o.email = site.email;
  if (!isTBD(site.phone)) o.telephone = site.phone;
  const socials = Object.values(site.social).filter((v) => !isTBD(v));
  if (socials.length) o.sameAs = socials;
  return o;
}

export function eventJsonLd(e) {
  const o = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: e.blurb + " " + e.body,
    organizer: { "@type": "Organization", name: site.name, url: site.origin },
    isAccessibleForFree: true,
    url: site.origin + "/events/",
  };
  o.location = isTBD(e.venue)
    ? { "@type": "Place", name: "Venue to be announced", address: { "@type": "PostalAddress", addressLocality: "Greenville", addressRegion: "SC", addressCountry: "US" } }
    : { "@type": "Place", name: e.venue, address: { "@type": "PostalAddress", streetAddress: e.address, addressLocality: "Greenville", addressRegion: "SC", addressCountry: "US" } };
  return o;
}
