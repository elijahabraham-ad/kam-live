import { esc, giveHref, giveAttrs, orTBA, isTBD } from "../layout.mjs";
import { site, journeys, programs, scriptures, tabling } from "../config.mjs";
import { mendingSvg } from "../mending.mjs";
import {
  modelSection, eventCard, upcoming, doorsSection, closingBand,
  programPlate, orgJsonLd, eventJsonLd,
} from "../parts.mjs";

export function home() {
  const ev = upcoming()[0];

  /* --- 1 · TITLE PAGE. Type on the ground, no media above the fold. The
     emblem is set as part of the composition rather than as a bar item. ---- */
  const titlePage = `
<section class="title-page ground--dark">
  <span class="title-page__glow" aria-hidden="true"></span>
  <div class="title-page__plate" aria-hidden="true" data-sc-parallax="0.5">
    <img src="/img/kam-emblem.png" width="779" height="900" alt="" decoding="async" fetchpriority="high">
  </div>

  <div class="wrap title-page__inner">
    <div class="title-page__seal">
      <img src="/img/kam-emblem.png" width="779" height="900" alt="Kingdom Assembly Missions" decoding="async">
      <span>Kingdom Assembly Missions<br>Greenville, South Carolina<br>Love. Serve. Impact.</span>
    </div>

    <h1 class="h-xl" data-sc-kinetic="lines">Reach. Restore.<br>Empower. Disciple.</h1>

    <p class="title-page__sub">Kingdom Assembly Missions exists to serve our communities, restore broken lives, and advance the Kingdom of God.</p>

    <div class="btn-row title-page__acts">
      <a class="btn btn--gold btn--lg" href="/get-involved/">Get involved</a>
      <a class="btn btn--line btn--lg" href="${giveHref()}"${giveAttrs()}>Give</a>
    </div>

    <p class="title-page__foot">
      <span class="rule-label">Next</span>
      <a class="tlink" href="/events/">October 9 &middot; KAM Christian Open Mic</a>
    </p>
  </div>
</section>`;

  /* --- 2 · THE INDEX. Six journeys, set as an index rather than as cards.
     This is the most important navigation on the site: a visitor should find
     their own line within seconds of landing. --------------------------- */
  const index = `
<section class="sec ground--cream" id="start">
  <div class="wrap">
    <div class="stack" data-sc-in data-sc-stagger="60" style="margin-bottom:var(--sc-6)">
      <span class="rule-label">Start here</span>
      <h2 class="h-md">Whatever brought you to this page, one of these is you.</h2>
    </div>
    <nav class="index-list" aria-label="Where to start">
      ${journeys
        .map(
          (j, i) => `
      <a href="${j.href}">
        <span class="idx">${String(i + 1).padStart(2, "0")}</span>
        <span class="lbl">${esc(j.label)}</span>
        <span class="nte">${esc(j.note)}</span>
      </a>`
        )
        .join("")}
    </nav>
  </div>
</section>`;

  /* --- 3 · CHAPTER I: OUR WHY ------------------------------------------- */
  const why = `
<section class="sec ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Chapter one</span>
        <h2 class="h-lg">Broken doesn't mean finished.</h2>
        <hr class="gold-rule" style="margin-top:var(--sc-5)">
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="lede">Most people are not looking for a program. They are looking for one person who will not flinch at where they actually are.</p>
        <p class="body">There is a season most people go through that they never put a name to. The bills stop matching the paycheck. The relationship ends badly. The drinking stops being social. A child starts making decisions that scare you. Something happens that you cannot tell anyone about, and the not telling becomes its own weight.</p>
        <p class="body">People in that season do not usually walk into a church building. So we go out. We bring food, prayer, resources, and time, and we keep coming back after the event is over, because a single good day does not undo a hard year.</p>
        <p class="body"><strong>We do not believe a person should be defined by their worst moment.</strong> We have watched God take lives that everyone had written off and rebuild them into something stronger than the original. That is not a slogan to us. It is the reason this ministry exists.</p>
      </div>
    </div>
  </div>
</section>`;

  /* --- 4 · CHAPTER II: THE MENDING. The peak. Largest span on the page.
     A clay jar in eight pieces, drawn back together by the reader's own
     scroll, then gold poured into every fracture. -------------------------- */
  const mending = `
<section class="ground--ink" data-sc-act="pin" data-sc-span="3.6" id="mending">
  <div data-sc-stage class="mend">
    <span class="mend__glow" aria-hidden="true"></span>
    <div class="mend__grid">
      <div class="mend__art">${mendingSvg()}</div>
      <div class="mend__copy" data-sc-cue="0.40 1 0.16 0.06">
        <h2 class="h-lg">God does not throw the pieces away.</h2>
        <p>He gathers them, sets them back where they belong, and runs something precious through every crack. The repair is visible on purpose. It is the part of the story worth telling.</p>
        <p class="mend__ref">&ldquo;${esc(scriptures.jars.text)}&rdquo;<br>${esc(scriptures.jars.ref)}</p>
      </div>
    </div>
  </div>
</section>`;

  /* --- 5 · CHAPTER III: FIVE AREAS. Lateral travel reads as breadth. ----- */
  const areas = `
<section class="ground--dark sec--after-pin" data-sc-act="pan" data-sc-span="3.0" id="impact">
  <div data-sc-stage>
    <div class="rail" data-sc-pan="0.05">
      <div class="rail__lead stack">
        <span class="rule-label">Chapter two &middot; Our mission in action</span>
        <h2 class="h-lg">Five places we are putting our hands.</h2>
        <p class="body">Not five departments. Five doors into the same house. A person who walks through one of them usually needs two of the others.</p>
      </div>
      ${programs.map(programPlate).join("")}
      <div class="rail__end stack">
        <h3 class="h-sm">All of it leads to the same place.</h3>
        <p class="body">Practical help opens a door. Relationship keeps it open. Discipleship is what we are actually building.</p>
        <a class="tlink" href="/mission/">Read our mission</a>
      </div>
    </div>
  </div>
</section>`;

  /* --- 6 · CHAPTER IV: DISCIPLESHIP. The thesis of the whole site. ------- */
  const discipleship = `
<section class="sec statement ground--cream" id="discipleship">
  <div class="wrap">
    <div data-sc-in data-sc-stagger="80">
      <span class="rule-label">Chapter three</span>
      <p class="statement__big" style="margin-top:var(--sc-4)">Everything leads to <em>discipleship</em>.</p>
    </div>
    <div class="split-2" style="margin-top:var(--sc-8)">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="lede">We are not trying to run a charity that happens to mention God at the end.</p>
        <p class="body">Meeting a need is real work and it matters on its own terms. But a meal wears off. A gift card runs out. A single good conversation fades. What actually changes a life is a person learning who God says they are and then building the rest of their life on that.</p>
        <p class="body">So every outreach we run has the same shape. We meet a need honestly, with no strings attached. We build a real relationship. And when someone is ready, and only when they are ready, we offer them a way to keep going: Scripture, prayer, accountability, character, purpose, and eventually the chance to do this for somebody else.</p>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="scripture">${esc(scriptures.brokenhearted.text)}<cite>${esc(scriptures.brokenhearted.ref)}</cite></p>
        <div class="notice" style="margin-top:var(--sc-6)">
          <span class="rule-label">Ready to take the next step?</span>
          <p>Your story doesn't have to end where your struggle began. Discipleship at KAM starts with a conversation, not a commitment you are not ready for.</p>
          <div class="btn-row" style="margin-top:var(--sc-5)">
            <a class="btn btn--gold" href="/discipleship/">Start discipleship</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

  /* --- 7 · CHAPTER V: THE MODEL ----------------------------------------- */
  const modelBlock = modelSection({
    ground: "dark",
    heading: "How we serve, in order.",
    lede: "Six stations. Each one earns the right to the next.",
  });

  /* --- 8 · CHAPTER VI: THE EVENT. A black plate on cream paper. --------- */
  const eventBlock = ev
    ? `
<section class="sec ground--cream" id="event">
  <div class="wrap">
    <div class="stack" data-sc-in data-sc-stagger="60" style="margin-bottom:var(--sc-7)">
      <span class="rule-label">Chapter four &middot; Come to something</span>
      <h2 class="h-lg">Come share your gift. Come hear a story. Come find community.</h2>
    </div>
    <div data-sc-reveal="up" data-sc-reveal-at="0.1 0.5">
      ${eventCard(ev)}
    </div>
    <p class="body" style="margin-top:var(--sc-5)">${esc(ev.body)}</p>
  </div>
</section>`
    : "";

  /* --- 9 · CHAPTER VII: TABLING ----------------------------------------- */
  const tablingBlock = `
<section class="sec statement ground--dark" id="tabling">
  <div class="wrap">
    <div data-sc-in data-sc-stagger="70">
      <span class="rule-label">Chapter five &middot; Meet us in the community</span>
      <p class="statement__big" style="margin-top:var(--sc-4)">We don't wait for the community to come to us. <em>We go to the community.</em></p>
    </div>
    <div class="split-2" style="margin-top:var(--sc-8)">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <p class="body">You will find us at a folding table in the places people already are. Not to run a service. To be available.</p>
        <p class="body">Some people take a Bible. Some ask for prayer. Some tell us what this neighborhood actually needs, which is the most useful thing anyone gives us all day.</p>
        <div class="btn-row" style="margin-top:var(--sc-5)">
          <a class="btn btn--gold" href="/events/">Find our next outreach</a>
          <a class="btn btn--line" href="/volunteer/?role=Outreach">Come with us</a>
        </div>
      </div>
      <ul class="ticks ticks--two" data-sc-in data-sc-stagger="40">
        ${tabling.map((t) => `<li>${esc(t)}</li>`).join("")}
      </ul>
    </div>
  </div>
</section>`;

  /* --- 10 · CHAPTER VIII: THE DOORS ------------------------------------- */
  const doors = doorsSection({ ground: "cream" });

  /* --- 11 · CHAPTER IX: STORIES ----------------------------------------- */
  const stories = `
<section class="sec ground--dark" id="stories">
  <div class="wrap wrap--mid center">
    <div class="stack" data-sc-in data-sc-stagger="70">
      <span class="rule-label">Chapter six &middot; Broken doesn't mean finished</span>
      <h2 class="h-lg">We would rather show you an empty shelf.</h2>
      <p class="body" style="margin-inline:auto">This is where the testimonies will live. We are only at the beginning, and we would rather show you an honest empty shelf than fill it with somebody else's story.</p>
      <p class="body" style="margin-inline:auto">When someone chooses to tell what God did, in their own words and with their full permission, it goes here.</p>
      <div class="btn-row" style="justify-content:center;margin-top:var(--sc-5)">
        <a class="btn btn--line" href="/stories/">About these stories</a>
      </div>
    </div>
  </div>
</section>`;

  const body = [
    titlePage, index, why, mending, areas, discipleship,
    modelBlock, eventBlock, tablingBlock, doors, stories, closingBand(),
  ].join("\n");

  return {
    path: "/",
    title: "Kingdom Assembly Missions · Christian community outreach in Greenville, SC",
    ogTitle: "Kingdom Assembly Missions",
    description:
      "Kingdom Assembly Missions is a Christian community outreach and discipleship ministry in Greenville, SC. We reach the broken, restore lives, empower communities and make disciples.",
    jsonld: [orgJsonLd(), ...(ev ? [eventJsonLd(ev)] : [])],
    body,
  };
}
