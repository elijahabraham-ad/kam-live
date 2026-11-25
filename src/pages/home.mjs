import { esc, bibleHref, bibleAttrs } from "../layout.mjs";
import { site, gallery, feeding, supportCities, tablingArea } from "../config.mjs";
import { impactSection, closingBand, orgJsonLd, photo } from "../parts.mjs";

/* The homepage, in the order Selvin set on 2026-11-25:
   hero, mission, impact, outreach, Bible study and discipleship, get
   involved, final call to action. Nothing else. */
export function home() {
  const pic = (name) => gallery.find((g) => g.src.includes(name));
  const heroPic = pic("kam-table");
  const feedPics = [pic("plates-packed"), pic("water-and-plates"), pic("clothing-table")];
  const tablingPic = pic("belk-charity-sale");
  const list = (a) => a.slice(0, -1).join(", ") + ", and " + a[a.length - 1];

  /* --- 1 · HERO ----------------------------------------------------------- */
  const hero = `
<section class="hero ground--dark">
  <span class="hero__glow" aria-hidden="true"></span>
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <h1 class="hero__h">
        <span class="hero__org">Kingdom Assembly Missions</span>
        <span class="hero__words">Love. Serve. Impact.</span>
      </h1>
      <p class="hero__tag">${esc(site.tagline)}</p>
      <p class="hero__sub">${esc(site.statement)}</p>
      <div class="btn-row hero__acts">
        <a class="btn btn--gold btn--lg" href="/donate/">Donate</a>
        <a class="btn btn--line btn--lg" href="${bibleHref()}"${bibleAttrs()}>Join Bible Study</a>
      </div>
    </div>
    <figure class="hero__pic">
      ${photo(heroPic, { eager: true })}
      <figcaption>Feeding outreach, Greenville, SC</figcaption>
    </figure>
  </div>
</section>`;

  /* --- 2 · OUR MISSION ---------------------------------------------------- */
  const mission = `
<section class="sec ground--cream" id="mission">
  <div class="wrap">
    <div class="split-side">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Our mission</span>
        <h2 class="h-lg">Be a light in darkness.</h2>
        <hr class="gold-rule">
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="lede">We believe the love of Jesus Christ should be demonstrated through action.</p>
        <p class="body">Kingdom Assembly Missions goes into the community to build relationships, share the Gospel, pray with individuals, distribute Bibles, and serve practical needs.</p>
        <p class="body">Our mission is to reach people where they are, demonstrate the love of Christ, and help individuals grow in their relationship with Jesus through discipleship.</p>
        <p><a class="tlink" href="/about/">About us</a></p>
      </div>
    </div>
  </div>
</section>`;

  /* --- 3 · OUR IMPACT ----------------------------------------------------- */
  const impact = impactSection({ ground: "dark" });

  /* --- 4 · OUR OUTREACH. Feed the Homeless gets the most weight on the
     page; retail tabling sits under it as how KAM meets the community and
     funds the work, not as a program of its own. ------------------------- */
  const outreach = `
<section class="sec ground--cream" id="outreach">
  <div class="wrap">
    <div class="stack" data-sc-in data-sc-stagger="70" style="margin-bottom:var(--sc-7)">
      <span class="rule-label">Our outreach &middot; ${esc(feeding.name)}</span>
      <h2 class="h-lg">Serving our community. Sharing the Gospel.</h2>
    </div>
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="lede">Through monthly community feeding outreach, Kingdom Assembly Missions provides meals, essential supplies, Bibles, prayer, and spiritual encouragement to individuals experiencing homelessness.</p>
        <p class="body">We currently conduct monthly feeding outreach at ${esc(feeding.location)}, and support local nonprofit and homeless-service organizations throughout ${esc(list(supportCities))}.</p>
        <div class="btn-row" style="margin-top:var(--sc-6)">
          <a class="btn btn--gold" href="/outreach/">Learn more about our outreach</a>
        </div>
      </div>
      <div class="pics">
        ${feedPics.map((g) => photo(g)).join("")}
      </div>
    </div>

    <div class="aside-row" data-sc-in>
      ${photo(tablingPic, { cls: "aside-row__pic" })}
      <div class="stack">
        <span class="rule-label">Out in the community</span>
        <h3 class="h-sm">You may meet us at a table near you.</h3>
        <p class="body">We table at retail locations throughout ${esc(tablingArea)} to share our mission, build relationships with local businesses and neighbors, and raise support for our feeding outreach, Bibles, and supplies.</p>
      </div>
    </div>
  </div>
</section>`;

  /* --- 5 · BIBLE STUDY & DISCIPLESHIP ------------------------------------- */
  const grow = `
<section class="sec ground--dark" id="bible-study">
  <div class="wrap">
    <div class="split-side">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Bible study &amp; discipleship</span>
        <h2 class="h-lg">Grow in the Word. Become a disciple.</h2>
        <hr class="gold-rule">
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="body">Our commitment extends beyond introducing people to Jesus Christ. We believe in helping individuals grow in their faith, develop an understanding of Scripture, and become equipped to live out the Gospel.</p>
        <p class="body">Through our Zoom Bible study and ongoing discipleship, we create opportunities for people to learn, grow, and strengthen their walk with Christ.</p>
        <div class="btn-row" style="margin-top:var(--sc-6)">
          <a class="btn btn--gold btn--lg" href="${bibleHref()}"${bibleAttrs()}>Join Bible Study</a>
        </div>
      </div>
    </div>
  </div>
</section>`;

  /* --- 6 · GET INVOLVED --------------------------------------------------- */
  const involved = `
<section class="sec ground--cream" id="get-involved">
  <div class="wrap wrap--mid center">
    <div class="stack" data-sc-in data-sc-stagger="70">
      <span class="rule-label">Get involved</span>
      <h2 class="h-lg">Be part of the impact.</h2>
      <p class="lede">There is a place for everyone who wants to help demonstrate the love of Jesus Christ.</p>
      <p class="body">Whether you want to volunteer, support our feeding outreach, contribute essential supplies, or help fund the mission, your involvement helps us continue serving our communities.</p>
      <div class="btn-row" style="justify-content:center;margin-top:var(--sc-6)">
        <a class="btn btn--gold btn--lg" href="/get-involved/#volunteer">Volunteer</a>
        <a class="btn btn--line btn--lg" href="/donate/">Donate</a>
        <a class="btn btn--line btn--lg" href="/get-involved/#contact">Contact us</a>
      </div>
    </div>
  </div>
</section>`;

  /* --- 7 · FINAL CALL TO ACTION ------------------------------------------- */
  const close = closingBand();

  return {
    path: "/",
    title: "Kingdom Assembly Missions · Love. Serve. Impact.",
    ogTitle: "Kingdom Assembly Missions",
    description:
      "Kingdom Assembly Missions is a Christian community outreach ministry in Greenville, SC: monthly feeding outreach for people experiencing homelessness, Bibles, prayer, Zoom Bible study, and discipleship.",
    jsonld: [orgJsonLd()],
    body: [hero, mission, impact, outreach, grow, involved, close].join("\n"),
  };
}
