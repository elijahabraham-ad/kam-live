import { esc, isTBD, giveHref, giveAttrs, bibleHref, bibleAttrs } from "../layout.mjs";
import {
  site, pillars, feeding, supportCities, tablingArea, giftUses, volunteerWays,
  contactTopics, gallery, scriptures,
} from "../config.mjs";
import { pageHead, impactSection, closingBand, form, orgJsonLd, galleryBlock, photo } from "../parts.mjs";

const pic = (name) => gallery.find((g) => g.src.includes(name));
const list = (a) => a.slice(0, -1).join(", ") + ", and " + a[a.length - 1];

/* ============================================================== ABOUT ===== */
export function about() {
  return {
    path: "/about/",
    title: "About Us",
    description:
      "Kingdom Assembly Missions is a Christian community outreach ministry in Greenville, SC, demonstrating the love of Jesus Christ through service, evangelism, and discipleship.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      label: "About us",
      h1: "Faith demonstrated through action.",
      lede: "Kingdom Assembly Missions is a Christian community outreach ministry committed to demonstrating the love of Jesus Christ through service, evangelism, and discipleship.",
    })}

<section class="sec ground--cream">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="body">We believe the Church is called to be a light in the darkness, reaching people beyond the walls of a building and meeting them where they are.</p>
        <p class="body">Through community outreach, homeless feeding, prayer, Bible distribution, and discipleship, we seek to serve individuals, share the Gospel, and help people grow in their relationship with Jesus Christ.</p>
        <p class="body">Our work is grounded in the Word of God and the belief that faith should be demonstrated through action.</p>
        <div class="notice" style="margin-top:var(--sc-6)">
          <span class="rule-label">Our mission</span>
          <p class="notice__big">${esc(site.mission)}</p>
        </div>
      </div>
      <figure class="side-pic" data-sc-in>
        ${photo(pic("be-the-light-downtown"))}
        <figcaption>Be the Light, downtown on Halloween night.</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="sec ground--dark" id="love-serve-impact">
  <div class="wrap">
    <div class="stack" data-sc-in data-sc-stagger="70" style="margin-bottom:var(--sc-7)">
      <span class="rule-label">How we approach ministry</span>
      <h2 class="h-lg">${esc(site.words)}</h2>
    </div>
    <div class="pillars">
      ${pillars
        .map(
          (p) => `
      <div class="pillar">
        <h3>${esc(p.word)}</h3>
        <p>${esc(p.line)}</p>
      </div>`
        )
        .join("")}
    </div>
  </div>
</section>

<section class="sec ground--cream">
  <div class="wrap wrap--mid">
    <p class="scripture" data-sc-in>${esc(scriptures.light.text)}<cite>${esc(scriptures.light.ref)}</cite></p>
    <p class="esv-credit">Scripture quotations are from the ESV&reg; Bible (The Holy Bible, English Standard Version&reg;), copyright &copy; 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.</p>
  </div>
</section>

${closingBand()}`,
  };
}

/* ========================================================== OUTREACH ====== */
export function outreach() {
  return {
    path: "/outreach/",
    title: "Our Outreach",
    description:
      "Monthly feeding outreach at Reedy Place in Greenville, SC: meals, hygiene kits, clothing, Bibles, prayer, and the Gospel, plus retail-location tabling and support for local homeless-service organizations.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      label: "Our outreach",
      h1: "Serving our community. Sharing the Gospel.",
      lede: "We go into the community to build relationships, pray with people, distribute Bibles, share the Gospel, and serve practical needs.",
    })}

<section class="sec ground--cream" id="feed-the-homeless">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Our primary outreach program</span>
        <h2 class="h-lg">${esc(feeding.name)}</h2>
        <p class="lede">Every month we provide meals and essential supplies to individuals experiencing homelessness.</p>
        <p class="body">We currently conduct our monthly feeding outreach at ${esc(feeding.location)}.</p>
        <h3 class="h-sm">What our outreach includes</h3>
        <ul class="ticks">
          ${feeding.includes.map((t) => `<li>${esc(t)}</li>`).join("")}
        </ul>
      </div>
      <div class="pics pics--tall">
        ${photo(pic("kam-table"))}
        ${photo(pic("plates-packed"))}
      </div>
    </div>
  </div>
</section>

${impactSection({ ground: "dark", heading: false })}

<section class="sec ground--cream" id="local-support">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Supporting local organizations</span>
        <h2 class="h-md">We support the work already happening here.</h2>
        <p class="body">In addition to our direct outreach, we donate to and support several local nonprofit and homeless-service organizations throughout ${esc(list(supportCities))}, South Carolina. We believe in supporting organizations already doing meaningful work in our communities.</p>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70" id="tabling">
        <span class="rule-label">Community outreach &amp; fundraising</span>
        <h2 class="h-md">You may meet us at a table near you.</h2>
        <p class="body">We table at retail locations throughout ${esc(tablingArea)}. It is how we introduce people to the ministry, share our mission, and build relationships with local businesses and community members.</p>
        <p class="body">It is also how we raise support for the work. Our direct outreach and retail fundraising help sustain the ministry, funding our feeding outreach, Bibles, essential supplies, and other active ministry needs, so we can keep serving the community.</p>
      </div>
    </div>
  </div>
</section>

${galleryBlock({ ground: "dark", heading: "See the work", lede: "Real photos and video from our outreach, shared by the KAM team.", skip: ["kam-table", "plates-packed"] })}

<section class="sec ground--cream">
  <div class="wrap wrap--mid center">
    <div class="stack" data-sc-in data-sc-stagger="70">
      <h2 class="h-lg">Be part of the impact.</h2>
      <p class="body">Serve with us at our next feeding outreach, contribute supplies, or help fund the mission.</p>
      <div class="btn-row" style="justify-content:center;margin-top:var(--sc-6)">
        <a class="btn btn--gold btn--lg" href="/get-involved/#volunteer">Volunteer</a>
        <a class="btn btn--line btn--lg" href="/donate/">Donate</a>
      </div>
    </div>
  </div>
</section>`,
  };
}

/* ====================================================== GET INVOLVED ====== */
export function getInvolved() {
  const ways = [
    { h: "Volunteer", p: "Serve with us at our monthly feeding outreach, help prepare meals and hygiene kits, or join us at a retail table.", href: "#volunteer", go: "Volunteer" },
    { h: "Give supplies", p: "Hygiene items, socks, clothing, coats, blankets, and Bibles go straight into the hands of people we serve.", href: "#contact", go: "Contact us" },
    { h: "Donate", p: "Your gift funds meals, supplies, and Bibles for our monthly feeding outreach.", href: "/donate/", go: "Donate" },
    { h: "Join Bible study", p: "Study Scripture with us on Zoom, wherever you are, and grow in your walk with Christ.", href: bibleHref(), attrs: bibleAttrs(), go: "Join Bible Study" },
  ];

  return {
    path: "/get-involved/",
    title: "Get Involved",
    description:
      "Volunteer at Kingdom Assembly Missions' monthly feeding outreach in Greenville, SC, give supplies, donate, join our Zoom Bible study, or contact us.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      label: "Get involved",
      h1: "Be part of the impact.",
      lede: "There is a place for everyone who wants to help demonstrate the love of Jesus Christ.",
    })}

<section class="sec sec--tight ground--cream">
  <div class="wrap">
    <div class="ways">
      ${ways
        .map(
          (w) => `
      <a class="way" href="${w.href}"${w.attrs || ""}>
        <div><h2 class="way__h">${esc(w.h)}</h2><p>${esc(w.p)}</p></div>
        <span class="way__go">${esc(w.go)}</span>
      </a>`
        )
        .join("")}
    </div>
  </div>
</section>

<section class="sec ground--dark" id="volunteer">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Volunteer</span>
        <h2 class="h-lg">Serve with us.</h2>
        <p class="body">Tell us a little about yourself and how you would like to help. Someone from KAM will reach out with the date of our next outreach.</p>
      </div>
      ${form({
        id: "volunteer",
        submit: "Send",
        success: "Thank you for stepping up. Someone from KAM will be in touch soon.",
        fields: [
          { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
          { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          { type: "tel", name: "phone", label: "Phone (optional)", autocomplete: "tel" },
          { type: "checkgroup", name: "interests", label: "How you would like to help", options: volunteerWays },
          { type: "textarea", name: "message", label: "Anything else (optional)" },
        ],
      })}
    </div>
  </div>
</section>

<section class="sec ground--cream" id="contact">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Contact us</span>
        <h2 class="h-lg">We would love to hear from you.</h2>
        <p class="body">Questions, supplies to donate, joining the Bible study, or a prayer request: send us a message and a person from KAM will reply.</p>
        <dl class="contact-list">
          <div><dt>Email</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div>
          <div><dt>Where</dt><dd>${esc(site.city)}, ${esc(site.region)}</dd></div>
        </dl>
      </div>
      ${form({
        id: "contact",
        submit: "Send message",
        success: "Thank you. Your message has been received, and someone from KAM will reply.",
        fields: [
          { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
          { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          { type: "tel", name: "phone", label: "Phone (optional)", autocomplete: "tel" },
          { type: "select", name: "topic", label: "What is this about?", required: true, options: contactTopics },
          { type: "textarea", name: "message", label: "Message", required: true },
        ],
      })}
    </div>
  </div>
</section>`,
  };
}

/* ============================================================ DONATE ====== */
export function donate() {
  const live = !isTBD(site.donateUrl);
  return {
    path: "/donate/",
    title: "Donate",
    description:
      "Donate to Kingdom Assembly Missions. Your gift funds meals, hygiene kits, clothing, and Bibles for people experiencing homelessness in Greenville, SC.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      label: "Donate",
      h1: "Support the mission.",
      lede: "Your gift helps us feed, clothe, and encourage individuals experiencing homelessness, and put the Word of God in their hands.",
    })}

<section class="sec ground--cream" id="how">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">What your gift supports</span>
        <h2 class="h-md">Every gift goes to work in our community.</h2>
        <ul class="ticks" style="margin-top:var(--sc-5)">
          ${giftUses.map((g) => `<li>${esc(g)}</li>`).join("")}
        </ul>
      </div>
      <div data-sc-in>
        <div class="notice give-box">
          <span class="rule-label">Give online</span>
          ${live
            ? `<p>Secure checkout through Square. Choose any amount; it takes about a minute.</p>
          <div class="btn-row" style="margin-top:var(--sc-5)">
            <a class="btn btn--gold btn--lg" href="${esc(giveHref())}"${giveAttrs()}>Donate now</a>
          </div>`
            : `<p>Online giving is being set up. <a class="tlink" href="/get-involved/#contact">Contact us</a> and we will tell you how to give today.</p>`}
          <p class="give-box__alt">Prefer to give supplies? <a href="/get-involved/#contact">Contact us</a> about hygiene items, clothing, coats, blankets, or Bibles.</p>
          <p class="give-box__fine">Have a question about tax deductibility? Please ask us directly before assuming a gift is deductible.</p>
        </div>
      </div>
    </div>
  </div>
</section>

${impactSection({ ground: "dark" })}

${closingBand({ label: "Donate now", href: live ? giveHref() : "/get-involved/#contact" })}`,
  };
}

/* =========================================================== PRIVACY ====== */
export function privacy() {
  return {
    path: "/privacy/",
    title: "Privacy Policy",
    description: "How Kingdom Assembly Missions handles information you share through this website.",
    body: `
${pageHead({ label: "Legal", h1: "Privacy policy.", lede: "Last updated November 25, 2026." })}

<section class="sec sec--tight ground--cream">
  <div class="wrap wrap--narrow prose">
    <h2>What we collect</h2>
    <p>When you send a form on this site, we receive what you type into it: your name, email address, phone number if you give one, and your message. We use it only to reply to you and to coordinate volunteering, giving, Bible study, or prayer you asked about.</p>
    <h2>How it is handled</h2>
    <p>Form messages are delivered by email to the ministry&rsquo;s inbox, ${esc(site.email)}. We do not sell, rent, or trade your information, and we do not add you to a mailing list without asking.</p>
    <h2>Donations</h2>
    <p>Online gifts are processed by Square on Square&rsquo;s secure checkout. Kingdom Assembly Missions does not receive or store your full card number. Square&rsquo;s own privacy policy applies to the payment.</p>
    <h2>Bible study</h2>
    <p>Our Bible study meets on Zoom. When you join, Zoom&rsquo;s own privacy policy applies to the meeting.</p>
    <h2>Cookies and tracking</h2>
    <p>This site does not use advertising or analytics trackers. It loads its fonts from Google Fonts, which receives a standard web request from your browser when a page loads.</p>
    <h2>Photos</h2>
    <p>Photos and video on this site come from our own outreach and are shared by the KAM team. If you appear in one and would like it removed, email us and we will take it down.</p>
    <h2>Questions</h2>
    <p>Email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> to ask about, correct, or delete anything you have sent us.</p>
  </div>
</section>`,
  };
}

/* ========================================================== NOT FOUND ===== */
export function notFound() {
  return {
    path: "/404.html",
    title: "Page not found",
    description: "This page could not be found.",
    noindex: true,
    body: `
${pageHead({
      label: "Page not found",
      h1: "This page could not be found.",
      lede: "It may have moved when we simplified the site.",
      actions: `<a class="btn btn--gold btn--lg" href="/">Go to the homepage</a><a class="btn btn--line btn--lg" href="/outreach/">Our outreach</a>`,
    })}`,
  };
}
