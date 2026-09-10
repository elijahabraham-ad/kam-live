import { esc, isTBD, orTBA, giveHref, giveAttrs } from "../layout.mjs";
import {
  site, programs, events, volunteerRoles, partnerTypes, model,
  discipleshipTrack, givingDesignations, meetingFlow, scriptures, journeys,
  testimonials, team, campaigns, posts,
} from "../config.mjs";
import {
  pageHead, crumb, modelSection, programGrid, eventCard, upcoming,
  doorsSection, closingBand, crisisBlock, form, orgJsonLd, eventJsonLd, programPlate,
  testimonialList, teamList, campaignList, eventDate,
} from "../parts.mjs";

/* ============================================================== ABOUT ===== */
export function about() {
  const beliefs = [
    "Broken people still have purpose.",
    "Struggling people still have value.",
    "Young people need positive examples.",
    "People experiencing homelessness deserve dignity.",
    "Women escaping abuse deserve safety and support.",
    "People battling addiction deserve compassion, accountability and hope.",
    "Mental health struggles deserve compassion and appropriate support.",
    "The church should be active in the community.",
    "Discipleship should produce action.",
  ];

  return {
    path: "/about/",
    title: "About Kingdom Assembly Missions",
    description:
      "Kingdom Assembly Missions is a Christian community outreach in Greenville, SC, built on the belief that no one should be defined by their worst moment.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "About" }),
      label: "About",
      h1: "We exist to empower and restore communities.",
      lede:
        "Kingdom Assembly Missions is a Christian community outreach committed to restoring our communities through faith, discipleship, practical assistance, mentorship, outreach, prayer and service.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">What we actually are</h2>
        <p class="body">KAM is a Christian community outreach and discipleship ministry. That order matters. We address real, practical needs, and we do it because we believe the Gospel obligates us to, not as a way of getting someone to sit still for a message.</p>
        <p class="body">We are not a clinic, a shelter, or a treatment center, and we will never present ourselves as one. What we are is a group of people who show up consistently, know who to call, and stay after the crowd leaves.</p>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">Where we work</h2>
        <p class="body">${esc(site.city)}, ${esc(site.region)}, and the neighborhoods around it. We table in public spaces, host gatherings, run outreach events, and partner with churches, businesses and organizations already doing good work here.</p>
        <p class="body">Our first major event is the KAM Christian Open Mic on October 9. Everything else grows from the relationships built in rooms like that one.</p>
        <a class="tlink" href="/events/">See what is coming up</a>
      </div>
    </div>
  </div>
</section>

<section class="sec ground--cream">
  <div class="wrap wrap--mid">
    <div class="stack" data-sc-in data-sc-stagger="60" style="margin-bottom:var(--sc-7)">
      <span class="rule-label">What we believe about people</span>
      <h2 class="h-lg">Nobody should be defined by their worst moment.</h2>
    </div>
    <ul class="beliefs" data-sc-in data-sc-stagger="40">
      ${beliefs.map((b) => `<li>${esc(b)}</li>`).join("")}
    </ul>
  </div>
</section>

<section class="sec statement ground--dark">
  <div class="wrap wrap--mid center">
    <div data-sc-in data-sc-stagger="80">
      <p class="statement__big" style="margin-inline:auto;text-align:center">We believe God can take the <em>broken pieces</em> and mend them back together.</p>
      <p class="scripture" style="margin:var(--sc-8) auto 0;text-align:left">${esc(scriptures.potter.text)}<cite>${esc(scriptures.potter.ref)}</cite></p>
    </div>
  </div>
</section>

${teamList(team)}
${modelSection({ ground: team.length ? "dark" : "cream", heading: "How we serve, in order.", lede: "Six stations. Each one earns the right to the next." })}
${closingBand()}`,
  };
}

/* ============================================================ MISSION ===== */
export function mission() {
  return {
    path: "/mission/",
    title: "Our Mission",
    description:
      "Our mission in action: mental health, homelessness, at-risk youth, women leaving abuse, and addiction recovery, all leading to discipleship.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Our Mission" }),
      label: "Our mission in action",
      h1: "We reach the broken, restore lives, empower communities, and make disciples.",
      lede: "Five areas of community impact. One outcome we are actually aiming at.",
      actions: `<a class="btn btn--gold btn--lg" href="/programs/">See the programs</a><a class="btn btn--line btn--lg" href="/discipleship/">Discipleship</a>`,
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">Practical help is the door, not the destination</h2>
        <p class="body">Hunger, addiction, abuse, instability and untreated mental illness are real problems that need real answers. We treat them that way. We hand out food that people actually want to eat, we connect people to professionals who are trained for what they are facing, and we do not pretend a prayer replaces a prescription.</p>
        <p class="body">And we keep going after that. Because the thing underneath most of what we encounter is not a missing resource. It is a person who has decided their life does not matter.</p>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">Mental health and addiction are not separate problems</h2>
        <p class="body">A great deal of what gets treated as an addiction problem is somebody managing pain they were never given help with. And a great deal of what gets treated as a mental health problem gets worse under the weight of a substance.</p>
        <p class="body">We are building for the whole person: the crisis, the cause underneath it, the community that keeps someone steady afterward, and the faith that gives all of it a reason.</p>
        <a class="tlink" href="/programs/recovery/">How our recovery meetings work</a>
      </div>
    </div>
  </div>
</section>

${programGrid({ ground: "cream" })}
${modelSection({ ground: "dark", heading: "The KAM outreach model", lede: "This is the shape of every outreach we run." })}

<section class="sec ground--cream">
  <div class="wrap wrap--mid">
    <div class="stack" data-sc-in data-sc-stagger="70">
      <span class="rule-label">The thread</span>
      <h2 class="h-lg">Everything leads to discipleship.</h2>
      <p class="body">If a person leaves our outreach fed, referred, prayed for and no closer to God, we have done something genuinely good and we have not done the main thing. Discipleship is the thread that connects mental health to homelessness to youth to women's support to recovery.</p>
      <div class="btn-row" style="margin-top:var(--sc-6)">
        <a class="btn btn--gold btn--lg" href="/discipleship/">Start discipleship</a>
      </div>
    </div>
  </div>
</section>

${closingBand()}`,
  };
}

/* ========================================================== PROGRAMS ====== */
export function programsIndex() {
  return {
    path: "/programs/",
    title: "Programs",
    description:
      "KAM programs: mental health, homelessness outreach, at-risk youth mentorship, support for women leaving abuse, and Christian addiction recovery in Greenville, SC.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Programs" }),
      label: "Programs",
      h1: "Five doors into the same house.",
      lede: "A person who walks through one of these usually needs two of the others. That is why they are built together.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="plate-grid" data-sc-in data-sc-stagger="70">${programs.map(programPlate).join("")}</div>
  </div>
</section>

${modelSection({ ground: "cream" })}
${closingBand()}`,
  };
}

const ACTION_LABELS = {
  learn: { label: "Learn more", href: "/mission/", cls: "btn--line" },
  connect: { label: "Get connected", href: "/contact/?about=Community%20Resources", cls: "btn--gold" },
  volunteer: { label: "Volunteer", href: "/volunteer/", cls: "btn--line" },
  give: { label: "Give", href: null, cls: "btn--line" },
  sponsor: { label: "Sponsor an event", href: "/partner/?intent=Sponsor", cls: "btn--line" },
  mentor: { label: "Become a mentor", href: "/volunteer/?role=Youth%20mentorship", cls: "btn--gold" },
  partner: { label: "Partner with us", href: "/partner/", cls: "btn--line" },
  resources: { label: "Get resources", href: "/need-help/", cls: "btn--gold" },
};

export function programPage(p) {
  const actions = p.actions
    .map((a) => {
      const cfg = ACTION_LABELS[a];
      if (!cfg) return "";
      const href = cfg.href === null ? giveHref() : cfg.href;
      const attrs = cfg.href === null ? giveAttrs() : "";
      return `<a class="btn ${cfg.cls}" href="${href}"${attrs}>${esc(cfg.label)}</a>`;
    })
    .join("");

  const safety = p.safety
    ? `
<section class="sec sec--tight ground--dark">
  <div class="wrap wrap--mid">
    <div class="notice" data-sc-in>
      <span class="rule-label">If you need help right now</span>
      <p>You do not have to explain anything to anyone to use this page. It lists the numbers that answer 24 hours a day, and it has a button that leaves the site immediately.</p>
      <p><strong style="color:var(--sc-ink)">If you are in immediate danger, call 911.</strong></p>
      <div class="btn-row" style="margin-top:var(--sc-5)">
        <a class="btn btn--gold btn--lg" href="/need-help/">I need help</a>
      </div>
    </div>
  </div>
</section>`
    : "";

  const flow = p.slug === "recovery"
    ? `
<section class="sec ground--dark">
  <div class="wrap">
    <div class="split-side">
      <div class="stack sticky-side" data-sc-in data-sc-stagger="70">
        <span class="rule-label">A monthly meeting</span>
        <h2 class="h-lg">What an evening looks like.</h2>
        <p class="body">Come late. Leave early. Say nothing the whole time if that is what you need. Nobody will call you out and nobody will make you stand up.</p>
      </div>
      <ol class="flow-steps" data-sc-in data-sc-stagger="50">
        ${meetingFlow.map((s) => `<li>${esc(s)}</li>`).join("")}
      </ol>
    </div>
  </div>
</section>`
    : "";

  const sections = p.body
    .map(
      (b) => `
      <div class="zig__row">
        <h3 class="zig__h">${esc(b.h)}</h3>
        <p class="body">${esc(b.p)}</p>
      </div>`
    )
    .join("");

  return {
    path: `/programs/${p.slug}/`,
    title: p.name,
    description: p.card,
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Programs", href: "/programs/" }, { label: p.short }),
      label: "Our mission in action",
      h1: esc(p.kicker),
      lede: esc(p.mission),
      actions,
    })}

<section class="sec sec--tight ground--cream">
  <div class="wrap">
    <div class="zig" data-sc-in data-sc-stagger="70">${sections}</div>
  </div>
</section>

${safety}
${flow}

<section class="sec ground--${p.safety ? "cream" : "dark"}">
  <div class="wrap wrap--mid">
    <div class="stack" data-sc-in data-sc-stagger="60" style="margin-bottom:var(--sc-6)">
      <span class="rule-label">What we hold to</span>
      <h2 class="h-md">${esc(p.cta.head)}</h2>
    </div>
    <ul class="beliefs" data-sc-in data-sc-stagger="40">
      ${p.beliefs.map((b) => `<li>${esc(b)}</li>`).join("")}
    </ul>
    <div class="btn-row" style="margin-top:var(--sc-7)">${actions}</div>
  </div>
</section>

${closingBand({ head: p.cta.head })}`,
  };
}

/* ====================================================== DISCIPLESHIP ====== */
export function discipleship() {
  return {
    path: "/discipleship/",
    title: "Discipleship",
    description:
      "Discipleship at Kingdom Assembly Missions: biblical foundations, prayer, identity in Christ, character, accountability, purpose, and learning to serve others.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Discipleship" }),
      label: "Ready to take the next step?",
      h1: "Your story doesn't have to end where your struggle began.",
      lede:
        "Discipleship is the thread that connects everything Kingdom Assembly Missions does. It starts with a conversation, not a commitment you are not ready for.",
      actions: `<a class="btn btn--gold btn--lg" href="#start">Start discipleship</a>`,
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">What this is</h2>
        <p class="body">Discipleship is not a class you pass. It is somebody walking with you while you learn to follow Jesus in the actual life you have, with the job you have, the history you have and the people around you that you did not choose.</p>
        <p class="body">At an outreach or a recovery meeting there is a moment where anyone who wants to respond to the Gospel can. Nobody is pressured and nobody is singled out. If you say yes, this is what happens next.</p>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">What it is not</h2>
        <p class="body">It is not a requirement for getting help from us. You can take every meal, resource and referral we have and never speak to us about faith, and we will keep showing up for you exactly the same way.</p>
        <p class="body">It is also not a test you can fail. People relapse. People disappear for months. People come back. That is normal, and it does not disqualify anyone here.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec ground--cream">
  <div class="wrap">
    <div class="split-side">
      <div class="stack sticky-side" data-sc-in data-sc-stagger="70">
        <span class="rule-label">The path</span>
        <h2 class="h-lg">What we walk through together.</h2>
        <p class="body">Not necessarily in this order, and not on a schedule. This is the ground we cover.</p>
      </div>
      <ul class="beliefs" data-sc-in data-sc-stagger="40">
        ${discipleshipTrack.map((d) => `<li>${esc(d)}</li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="sec ground--dark" id="start">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Start discipleship</span>
        <h2 class="h-lg">Take the next step.</h2>
        <p class="body">Fill this in and a real person from KAM will reach out. There is no cost, no membership and no obligation.</p>
        <p class="scripture" style="margin-top:var(--sc-6)">${esc(scriptures.brokenhearted.text)}<cite>${esc(scriptures.brokenhearted.ref)}</cite></p>
      </div>
      ${form({
        id: "discipleship",
        submit: "Start discipleship",
        success: "Thank you. Someone from KAM will reach out personally. Welcome.",
        fields: [
          { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
          { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          { type: "tel", name: "phone", label: "Phone (optional)", autocomplete: "tel" },
          {
            type: "select",
            name: "starting",
            label: "Where are you starting from?",
            required: true,
            options: [
              "I just made a decision to follow Christ",
              "I have been a Christian but I drifted",
              "I am curious and not sure what I believe",
              "I am growing and I want to go deeper",
              "I want to learn how to disciple other people",
            ],
          },
          {
            type: "textarea",
            name: "message",
            label: "Anything you want us to know (optional)",
            placeholder: "As much or as little as you want.",
          },
        ],
        note:
          "We use what you send here to contact you and nothing else. We do not sell, share or publish it.",
      })}
    </div>
  </div>
</section>

${closingBand({ head: "Broken doesn't mean finished." })}`,
  };
}

/* ============================================================= EVENTS ===== */
export function eventsPage() {
  const up = upcoming();
  const cards = up.length
    ? up.map((e) => `<div style="margin-bottom:var(--sc-6)">${eventCard(e, { level: 2 })}</div>`).join("")
    : `<div class="notice"><span class="rule-label">Nothing on the calendar yet</span><p>Our next outreach has not been posted. Check back, or ask us to let you know when it is.</p></div>`;

  const detail = up
    .map(
      (e) => `${(() => { const L = eventDate(e).label; return `
<section class="sec ground--cream">
  <div class="wrap">
    <div class="split-side">
      <div class="stack sticky-side" data-sc-in data-sc-stagger="70">
        <span class="rule-label">${esc(L)}</span>
        <h2 class="h-lg">${esc(e.title)}</h2>
        <p class="body">${esc(e.body)}</p>
        <dl class="event__meta" style="margin-top:var(--sc-5)">
          <div><dt>When</dt><dd>${esc(L)}, ${orTBA(e.time, "Time TBA")}</dd></div>
          <div><dt>Where</dt><dd>${orTBA(e.venue, "Venue TBA")}</dd></div>
          <div><dt>Address</dt><dd>${orTBA(e.address, "Address TBA")}</dd></div>
          <div><dt>Cost</dt><dd>${esc(e.cost)}</dd></div>
        </dl>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h3 class="h-sm">Who this night is for</h3>
        <ul class="ticks">${e.forWho.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
        <div style="margin-top:var(--sc-7)">
          <span class="rule-label" style="margin-bottom:var(--sc-4)">Save your spot</span>
          ${form({
            id: "rsvp",
            submit: "Save my spot",
            success: "You are on the list. We will send details as soon as the venue and time are locked in.",
            fields: [
              { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
              { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
              { type: "tel", name: "phone", label: "Phone (optional)", autocomplete: "tel" },
              {
                type: "select",
                name: "attending_as",
                label: "Coming as",
                required: true,
                options: [
                  "Just attending",
                  "I want to perform or share",
                  "I want to volunteer that night",
                  "Not sure yet",
                ],
              },
              { type: "text", name: "guests", label: "How many people are you bringing? (optional)" },
            ],
            note: "The venue and start time are still being confirmed. Put your name down and we will send you the details first.",
          })}
        </div>
      </div>
    </div>
  </div>
</section>`; })()}`
    )
    .join("");

  return {
    path: "/events/",
    title: "Events",
    description:
      "Upcoming Kingdom Assembly Missions events and community outreach in Greenville, SC, including the KAM Christian Open Mic on October 9.",
    jsonld: [orgJsonLd(), ...up.map(eventJsonLd)],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Events" }),
      label: "Events and outreach",
      h1: "Come find community.",
      lede: "Gatherings, outreach events and community tables. Everything here is open to anyone.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div data-sc-in>${cards}</div>
  </div>
</section>

${detail}

<section class="sec ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Community tables</span>
        <h2 class="h-lg">Find us in the community.</h2>
        <p class="body">Between events we are out at tables in public places: handing out Bibles, praying with people, connecting folks with resources and listening to what this community actually needs.</p>
        <p class="body">Table locations are posted here as they are confirmed. If you want us at a location, an event or a campus, tell us.</p>
        <div class="btn-row" style="margin-top:var(--sc-5)">
          <a class="btn btn--gold" href="/contact/?about=Event">Invite us somewhere</a>
          <a class="btn btn--line" href="/volunteer/?role=Outreach">Come with us</a>
        </div>
      </div>
      <div class="notice" data-sc-in>
        <span class="rule-label">Want the dates first?</span>
        <p>We will send you the next outreach date and nothing else. No newsletter blast, no fundraising drip.</p>
        ${form({
          id: "newsletter",
          submit: "Keep me posted",
          success: "Done. You will hear from us when the next date is set.",
          fields: [
            { type: "text", name: "name", label: "Name", required: true, autocomplete: "name" },
            { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          ],
        })}
      </div>
    </div>
  </div>
</section>

${closingBand({ head: "Come share your gift. Come hear a story. Come find community." })}`,
  };
}

/* =============================================================== GIVE ===== */
export function give() {
  const live = !isTBD(site.donateUrl);

  const giveBox = live
    ? `
    <div class="notice">
      <span class="rule-label">Give securely</span>
      <p>Every gift goes directly into community outreach.</p>
      <div class="btn-row" style="margin-top:var(--sc-5)">
        <a class="btn btn--gold btn--lg" href="${esc(site.donateUrl)}" target="_blank" rel="noopener">Give now</a>
      </div>
    </div>`
    : `
    <div class="notice">
      <span class="rule-label">Online giving is being set up</span>
      <p>Kingdom Assembly Missions is finalizing secure online giving right now. Rather than send you to a half-configured payment page, we would rather you tell us how you want to give and we will get back to you personally within a day.</p>
      <p>If you want to give today, use the form and say so. We will call you.</p>
    </div>`;

  return {
    path: "/give/",
    title: "Give",
    description:
      "Give to Kingdom Assembly Missions. Your gift funds community meals, hygiene kits, Bibles, youth programs, recovery outreach and transitional support for women leaving abuse.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Give" }),
      label: "Give",
      h1: "Your gift helps us turn compassion into action.",
      lede:
        "Donations fund the outreach events, the materials and the direct assistance behind everything on this site.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">Where it goes</h2>
        <ul class="ticks ticks--two" style="margin-top:var(--sc-5)">
          ${givingDesignations.slice(1).map((g) => `<li>${esc(g)}</li>`).join("")}
        </ul>
        <p class="body" style="margin-top:var(--sc-6)">If you want your gift to go to one specific area, say so and we will designate it. If you do not, we will put it where the need is heaviest that month.</p>
      </div>
      <div data-sc-in>${giveBox}</div>
    </div>
  </div>
</section>

${campaignList(campaigns)}

<section class="sec ground--cream">
  <div class="wrap">
    <div class="doors" data-sc-in data-sc-stagger="80">
      <div class="door">
        <div><h3>One-time gift</h3><p>A single gift, designated wherever you want it to go. Every amount is used, and small consistent gifts fund more of this than large rare ones.</p></div>
        <span class="door__go">Use the form below</span>
      </div>
      <div class="door">
        <div><h3>Monthly partner</h3><p>The most useful thing anyone does for us. A predictable monthly amount is what lets us commit to an event before the money is in hand.</p></div>
        <span class="door__go">Use the form below</span>
      </div>
      <div class="door">
        <div><h3>Sponsor an event</h3><p>Fund one outreach end to end: the food, the materials, the space, the Bibles. Businesses and churches, this is usually the right fit.</p></div>
        <span class="door__go">Use the form below</span>
      </div>
    </div>
  </div>
</section>

<section class="sec ground--dark" id="give-form">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Tell us how you want to give</span>
        <h2 class="h-lg">We will get back to you personally.</h2>
        <p class="body">No automated drip, no sales sequence. A person from KAM reads this and replies.</p>
        <p class="body">Kingdom Assembly Missions is a Christian community outreach. Please ask us directly about our current tax-exempt status before assuming a gift is deductible, and we will tell you plainly where we stand.</p>
      </div>
      ${form({
        id: "give",
        submit: "Send this",
        success: "Thank you. Someone from KAM will reach out to you directly.",
        fields: [
          { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
          { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          { type: "tel", name: "phone", label: "Phone (optional)", autocomplete: "tel" },
          {
            type: "select",
            name: "gift_type",
            label: "How you would like to give",
            required: true,
            options: ["One-time gift", "Monthly partner", "Sponsor an event", "In-kind donation (goods or services)", "Not sure, tell me the options"],
          },
          { type: "select", name: "designation", label: "Where you want it to go", required: true, options: givingDesignations },
          { type: "textarea", name: "message", label: "Anything else (optional)" },
        ],
        note: "We never publish donor names without asking first.",
      })}
    </div>
  </div>
</section>

${closingBand({ head: "Your gift helps us turn compassion into action." })}`,
  };
}

/* ====================================================== GET INVOLVED ====== */
export function getInvolved() {
  return {
    path: "/get-involved/",
    title: "Get Involved",
    description:
      "Give, serve or partner with Kingdom Assembly Missions. Volunteer roles, partnership for churches and businesses, and ways to fund community outreach in Greenville, SC.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Get Involved" }),
      label: "Get involved",
      h1: "You don't have to be a pastor to make a difference.",
      lede: "Three ways in, and all of them matter. Pick the one that fits what you actually have.",
    })}

${doorsSection({ ground: "dark" })}

<section class="sec ground--cream">
  <div class="wrap wrap--mid">
    <div class="stack" data-sc-in data-sc-stagger="60" style="margin-bottom:var(--sc-6)">
      <span class="rule-label">Or start somewhere else</span>
      <h2 class="h-lg">Whatever brought you here, one of these is you.</h2>
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
</section>

${closingBand()}`,
  };
}

/* ========================================================= VOLUNTEER ====== */
export function volunteer() {
  return {
    path: "/volunteer/",
    title: "Serve With Us",
    description:
      "Volunteer with Kingdom Assembly Missions in Greenville, SC. Outreach, prayer, youth mentorship, food distribution, recovery meetings, media, music and more.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Serve" }),
      label: "Serve with us",
      h1: "You don't have to be a pastor to make a difference.",
      lede:
        "We need people who can cook, drive, lift, listen, teach, film, play, organize, and show up again next month.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">What we ask of you</h2>
        <p class="body">Show up when you said you would. Treat every person we serve like a neighbor and not a project. Do not promise anyone something you cannot deliver, including us.</p>
        <p class="body">That is genuinely most of it. We will train you on the rest.</p>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">Roles that require more</h2>
        <p class="body">Youth mentorship, women's support initiatives and anything involving counseling have additional screening, because they should. Expect a conversation, references and a background check for those.</p>
        <p class="body">Everything else you can join at the next outreach.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec ground--cream">
  <div class="wrap">
    <div class="split-side">
      <div class="stack sticky-side" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Volunteer application</span>
        <h2 class="h-lg">Tell us what you've got.</h2>
        <p class="body">Time, a truck, a trade, a camera, a kitchen, patience, or an instrument. All of it is useful.</p>
      </div>
      ${form({
        id: "volunteer",
        submit: "Send application",
        success: "Got it. Someone from KAM will follow up about the next outreach.",
        fields: [
          { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
          { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          { type: "tel", name: "phone", label: "Phone", required: true, autocomplete: "tel" },
          { type: "checkgroup", name: "roles", label: "Where you'd like to serve", options: volunteerRoles, hint: "Pick as many as you want." },
          {
            type: "select",
            name: "availability",
            label: "How often you can serve",
            required: true,
            options: ["A one-time event", "Once a month", "Twice a month", "Weekly", "Whenever you need me"],
          },
          {
            type: "textarea",
            name: "skills",
            label: "Skills, trade, equipment or experience",
            placeholder: "Anything relevant. A CDL, a commercial kitchen, counseling credentials, a PA system, a van.",
          },
          { type: "checkbox", name: "background_ok", label: "I understand that youth, women's support and counseling roles require a background check, and I consent to one if I serve in those areas." },
        ],
        note: "We use this to contact you about serving. Nothing else.",
      })}
    </div>
  </div>
</section>

${closingBand({ head: "Help us build the next generation." })}`,
  };
}

/* =========================================================== PARTNER ====== */
export function partner() {
  return {
    path: "/partner/",
    title: "Partner With Us",
    description:
      "Partner with Kingdom Assembly Missions. For churches, businesses, counselors, recovery and domestic violence organizations, schools and community leaders in Greenville, SC.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Partner" }),
      label: "Partner with us",
      h1: "Become a community partner.",
      lede:
        "The most useful thing a partner brings is usually not money. It is capacity, expertise, a room, a route, or a phone number that answers.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">What partnership actually looks like</h2>
        <p class="body">A counselor who takes our referrals. A restaurant that covers a community meal. A church that lends a room once a month. A DV organization that trains our volunteers on what not to say. A contractor who brings a truck and four guys to a food drive.</p>
        <p class="body">We are a young organization and we know it. We would rather plug into what is already working here than duplicate it badly.</p>
      </div>
      <div class="stack" data-sc-in data-sc-stagger="70">
        <h2 class="h-md">Who we are looking for</h2>
        <ul class="ticks ticks--two" style="margin-top:var(--sc-4)">
          ${partnerTypes.map((t) => `<li>${esc(t)}</li>`).join("")}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="sec ground--cream">
  <div class="wrap">
    <div class="split-side">
      <div class="stack sticky-side" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Start a conversation</span>
        <h2 class="h-lg">Tell us what you can bring.</h2>
        <p class="body">We will tell you honestly whether we can use it right now, and if we cannot, we will say so instead of stringing you along.</p>
      </div>
      ${form({
        id: "partner",
        submit: "Start a conversation",
        success: "Thank you. Someone from KAM leadership will reach out.",
        fields: [
          { type: "text", name: "org", label: "Organization or business", required: true, autocomplete: "organization" },
          { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
          { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          { type: "tel", name: "phone", label: "Phone", autocomplete: "tel" },
          { type: "select", name: "org_type", label: "What kind of organization", required: true, options: partnerTypes },
          {
            type: "select",
            name: "intent",
            label: "What you have in mind",
            required: true,
            options: [
              "Sponsor an event",
              "Provide a service or expertise",
              "Provide a space or venue",
              "Take referrals from KAM",
              "Send volunteers",
              "Donate goods or in-kind support",
              "Something else, let's talk",
            ],
          },
          { type: "textarea", name: "message", label: "What you can bring", required: true, placeholder: "Be specific. It helps us respond usefully." },
        ],
      })}
    </div>
  </div>
</section>

${closingBand({ head: "Help us build a place where lives are changed and the Kingdom is advanced." })}`,
  };
}

/* =========================================================== STORIES ====== */
export function stories() {
  const has = testimonials.filter((t) => t.consent).length > 0;

  const body = has
    ? `
${pageHead({
        crumb: crumb({ label: "Home", href: "/" }, { label: "Stories" }),
        label: "Stories of restoration",
        h1: "Broken doesn't mean finished.",
        lede: "Testimonies from people whose lives were changed through Kingdom Assembly Missions, told in their own words and published with their permission.",
      })}
${testimonialList(testimonials, { heading: "In their own words." })}
${consentNote()}
${closingBand({ head: "Broken doesn't mean finished." })}`
    : `
${pageHead({
        crumb: crumb({ label: "Home", href: "/" }, { label: "Stories" }),
        label: "Stories of restoration",
        h1: "Broken doesn't mean finished.",
        lede: "This is where testimonies from people whose lives were changed through KAM will live.",
      })}

<section class="sec sec--tight ground--dark">
  <div class="wrap wrap--mid">
    <div class="stack" data-sc-in data-sc-stagger="70">
      <h2 class="h-md">Why this page is empty right now</h2>
      <p class="body">Because we are new, and because we are not willing to fill it with a stock photo and a paragraph somebody in marketing wrote. When there is a real story here, it will be because a real person decided they wanted it told.</p>
      <h2 class="h-md">Do you have a story?</h2>
      <p class="body">If God did something in your life through Kingdom Assembly Missions and you want to say so, we would be honored to hear it. There is no pressure and no deadline.</p>
      <div class="btn-row" style="margin-top:var(--sc-5)">
        <a class="btn btn--gold" href="/contact/?about=Prayer">Tell us your story</a>
      </div>
    </div>
  </div>
</section>
${consentNote()}
${closingBand({ head: "Broken doesn't mean finished." })}`;

  return {
    path: "/stories/",
    title: "Stories of Restoration",
    description:
      "Stories of restoration from Kingdom Assembly Missions. Broken doesn't mean finished.",
    jsonld: [orgJsonLd()],
    body,
  };
}

function consentNote() {
  return `
<section class="sec sec--tight ground--cream">
  <div class="wrap wrap--mid">
    <div class="stack" data-sc-in data-sc-stagger="70">
      <span class="rule-label">How we handle a story</span>
      <h2 class="h-md">Nothing here is published without permission.</h2>
      <p class="body">Nothing goes on this page without explicit, informed, written permission from the person whose story it is. Nobody is asked to disclose anything they are not ready to say out loud. Names, photos and details are used only to the degree the person chooses, and anyone can ask us to take their story down at any time, for any reason, and we will do it that day.</p>
      <p class="body">If your safety depends on your story not being findable, tell us and it never goes online at all. That is not a special exception. It is the default we start from.</p>
    </div>
  </div>
</section>`;
}

/* ============================================================== NEWS ====== */
/* Generated only when there is something to say. An empty blog is worse than
   no blog, so build.mjs skips this page entirely while `posts` is empty. */
export function news() {
  const items = posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(
      (post) => `
      <article class="post" id="${esc(post.slug)}">
        <p class="rule-label">${new Date(post.date + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <h2 class="h-md">${esc(post.title)}</h2>
        ${post.summary ? `<p class="lede">${esc(post.summary)}</p>` : ""}
        ${(post.body || []).map((b) => `<p class="body">${esc(b)}</p>`).join("")}
      </article>`
    )
    .join("");

  return {
    path: "/news/",
    title: "News and Updates",
    description: "News and updates from Kingdom Assembly Missions in Greenville, SC.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "News" }),
      label: "News and updates",
      h1: "What has been happening.",
      lede: "Outreach recaps, what is coming up, and what the community has been telling us.",
    })}

<section class="sec sec--tight ground--cream">
  <div class="wrap wrap--mid">
    <div class="posts" data-sc-in data-sc-stagger="70">${items}</div>
  </div>
</section>

${closingBand()}`,
  };
}

/* ============================================================ PRAYER ====== */
export function prayer() {
  return {
    path: "/prayer/",
    title: "Request Prayer",
    description: "Submit a prayer request to Kingdom Assembly Missions. Confidential, and read by real people who will pray.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Prayer" }),
      label: "Request prayer",
      h1: "Somebody will actually pray for this.",
      lede:
        "Not a form that goes into a database. A real person on our prayer team reads every request that comes through here.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <div class="notice">
          <span class="rule-label">Before you write</span>
          <p>You can leave your name off. You can leave your email off. You can write one sentence. All of that is fine.</p>
          <p>Prayer requests are kept confidential and are never published, shared or read aloud without your permission.</p>
        </div>
        <div class="notice" style="margin-top:var(--sc-5)">
          <span class="rule-label">If this is a crisis</span>
          <p>Prayer is not a substitute for help that arrives in the next ten minutes. If you are in danger or thinking about ending your life, call <a class="tlink" href="tel:988">988</a> or <a class="tlink" href="tel:911">911</a> right now, then write to us afterward.</p>
        </div>
      </div>
      ${form({
        id: "prayer",
        submit: "Send my request",
        success: "Received. Someone on our prayer team is praying for this.",
        fields: [
          { type: "text", name: "name", label: "Your name (optional)", placeholder: "Or leave this blank" },
          { type: "email", name: "email", label: "Email (optional)", hint: "Only needed if you want a reply." },
          { type: "textarea", name: "request", label: "What can we pray for?", required: true, placeholder: "As much or as little as you want to say." },
          { type: "checkbox", name: "contact_me", label: "I would like someone from KAM to contact me about my prayer request." },
        ],
        note: "We do not need details you are not ready to give. Write only what you want us to know.",
      })}
    </div>
  </div>
</section>

${closingBand({ head: "He heals the brokenhearted and binds up their wounds." })}`,
  };
}

/* =========================================================== CONTACT ====== */
export function contact() {
  const contactLines = [
    isTBD(site.email) ? null : `<div><dt>Email</dt><dd><a class="tlink" href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div>`,
    isTBD(site.phone) ? null : `<div><dt>Phone</dt><dd><a class="tlink" href="tel:${esc(site.phone.replace(/[^\d+]/g, ""))}">${esc(site.phone)}</a></dd></div>`,
    isTBD(site.mailingAddress) ? null : `<div><dt>Mail</dt><dd>${esc(site.mailingAddress)}</dd></div>`,
  ].filter(Boolean);

  return {
    path: "/contact/",
    title: "Contact KAM",
    description: "Contact Kingdom Assembly Missions in Greenville, SC about volunteering, giving, partnership, events, prayer, discipleship or community resources.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      crumb: crumb({ label: "Home", href: "/" }, { label: "Contact" }),
      label: "Contact",
      h1: "Reach us.",
      lede: "General questions, volunteering, giving, partnership, events, prayer, discipleship or resources. A person reads all of it.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap">
    <div class="split-side">
      <div class="stack sticky-side" data-sc-in data-sc-stagger="70">
        ${contactLines.length
          ? `<dl class="event__meta">${contactLines.join("")}</dl>`
          : `<div class="notice"><span class="rule-label">We are not reachable yet, and we would rather say so</span><p>Kingdom Assembly Missions is standing up its public email and phone line right now, and the form below is not connected either. Nothing you send today will arrive.</p><p><strong style="color:var(--sc-ink)">If you need help now, use the crisis numbers on the help page.</strong> They are answered 24 hours a day by people who are not us. For anything else, please check back shortly.</p></div>`}

        <div class="notice" style="margin-top:var(--sc-5)">
          <span class="rule-label">If you need help right now</span>
          <p>Do not wait on an email. Go to the help page for the numbers that answer 24 hours a day.</p>
          <div class="btn-row" style="margin-top:var(--sc-4)">
            <a class="btn btn--gold" href="/need-help/">I need help</a>
          </div>
        </div>
      </div>

      ${form({
        id: "contact",
        submit: "Send message",
        success: "Thank you. Someone from KAM will get back to you.",
        fields: [
          { type: "text", name: "name", label: "Your name", required: true, autocomplete: "name" },
          { type: "email", name: "email", label: "Email", required: true, autocomplete: "email" },
          { type: "tel", name: "phone", label: "Phone (optional)", autocomplete: "tel" },
          {
            type: "select",
            name: "about",
            label: "What is this about?",
            required: true,
            options: [
              "General Information",
              "Volunteer",
              "Donation",
              "Partnership",
              "Event",
              "Prayer",
              "Discipleship",
              "Community Resources",
            ],
          },
          { type: "textarea", name: "message", label: "Message", required: true },
        ],
        note:
          "Please do not send sensitive personal details through this form. If your situation involves your safety, use the help page instead.",
      })}
    </div>
  </div>
</section>

${closingBand()}`,
  };
}

/* ========================================================= NEED HELP ====== */
export function needHelp() {
  const local = programs
    .filter((p) => p.slug !== "mental-health")
    .map((p) => `<li><a class="tlink" href="/programs/${p.slug}/">${esc(p.name)}</a></li>`)
    .join("");

  return {
    path: "/need-help/",
    safety: true,
    title: "I Need Help",
    description:
      "Immediate help and 24-hour crisis numbers: domestic violence, suicide and crisis, substance use. Plus how to reach Kingdom Assembly Missions confidentially.",
    jsonld: [orgJsonLd()],
    body: `
${pageHead({
      label: "Confidential",
      h1: "You do not have to explain anything to get help.",
      lede:
        "The numbers below answer 24 hours a day, they are free, and they will not ask you for personal information you do not want to give.",
    })}

<section class="sec sec--tight ground--dark">
  <div class="wrap wrap--mid">
    <div data-sc-in>
      ${crisisBlock()}
    </div>
    <div class="notice" style="margin-top:var(--sc-7)">
      <span class="rule-label">About the button in the corner</span>
      <p>The red button at the top of this page leaves the site immediately and loads a weather page instead. Pressing Escape three times quickly does the same thing.</p>
      <p><strong style="color:var(--sc-ink)">Pressing Back can bring this site back.</strong> Closing the tab entirely is safer than leaving it open on the weather page.</p>
      <p>It cannot erase your browser history on its own. If someone checks the device you are using, open your browser settings and clear your history, or use a device that is not monitored, such as a library computer or a friend's phone.</p>
    </div>
  </div>
</section>

<section class="sec ground--cream">
  <div class="wrap">
    <div class="split-2">
      <div class="stack" data-sc-in data-sc-stagger="70">
        <span class="rule-label">Reaching KAM</span>
        <h2 class="h-lg">If you want to talk to us.</h2>
        <p class="body">We are a community outreach, not an emergency service, so please use the numbers above first if this is urgent. When it is safe for you, we would like to help with what comes after: resources, connection, practical support and people who will stay.</p>
        <p class="body"><strong>You do not need to write down what happened.</strong> Tell us only how to reach you safely, and whether calling or emailing is safe at all. We will follow your lead.</p>
        <h3 class="h-sm">Where we can help</h3>
        <ul class="ticks">${local}</ul>
      </div>
      ${form({
        id: "help",
        submit: "Send this quietly",
        success: "Received. We will reach out the way you asked us to, and only that way.",
        fields: [
          { type: "text", name: "name", label: "A name we can call you (optional)", placeholder: "It does not have to be your real name." },
          { type: "text", name: "reach", label: "How can we reach you safely?", required: true, placeholder: "A phone number, an email, or a time of day that is safe." },
          {
            type: "select",
            name: "safe_contact",
            label: "Is it safe for us to contact you?",
            required: true,
            options: [
              "Yes, call or email me any time",
              "Email only",
              "Text only",
              "Only at certain times, I will explain below",
              "I am not sure, please be careful",
            ],
          },
          {
            type: "select",
            name: "need",
            label: "What kind of help do you need?",
            required: true,
            options: [
              "Safety and leaving a situation",
              "Housing or a place to stay",
              "Food or basic necessities",
              "Mental health support",
              "Addiction and recovery",
              "Help for my child or a young person",
              "Prayer",
              "I am not sure, I just need someone",
            ],
          },
          { type: "textarea", name: "note", label: "Anything you want us to know (optional)", placeholder: "Only what you want to say. You do not have to describe anything." },
        ],
        note:
          "We do not ask for and do not want details of what happened to you. This form exists so we can reach you safely, nothing more. What you send is read by a small number of people and is never published.",
      })}
    </div>
  </div>
</section>

<section class="sec sec--tight ground--dark">
  <div class="wrap wrap--mid center">
    <p class="scripture" style="margin-inline:auto;text-align:left">${esc(scriptures.brokenhearted.text)}<cite>${esc(scriptures.brokenhearted.ref)}</cite></p>
  </div>
</section>`,
  };
}

/* =============================================================== 404 ====== */
export function notFound() {
  return {
    path: "/404.html",
    title: "Page not found",
    description: "That page does not exist.",
    noindex: true,
    body: `
<section class="sec statement ground--dark" style="min-height:60vh;display:grid;align-items:center">
  <div class="wrap wrap--mid">
    <span class="rule-label">404</span>
    <h1 class="h-lg" style="margin-top:var(--sc-4)">That page isn't here.</h1>
    <p class="body" style="margin-top:var(--sc-5)">The link may be old, or we may have moved something. Everything on this site is reachable from these:</p>
    <div class="btn-row" style="margin-top:var(--sc-6)">
      <a class="btn btn--gold" href="/">Home</a>
      <a class="btn btn--line" href="/programs/">Programs</a>
      <a class="btn btn--line" href="/events/">Events</a>
      <a class="btn btn--line" href="/need-help/">I need help</a>
      <a class="btn btn--line" href="/contact/">Contact</a>
    </div>
  </div>
</section>`,
  };
}
