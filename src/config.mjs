/* ---------------------------------------------------------------------------
   Kingdom Assembly Missions: everything an administrator edits lives here.
   Change a value in this file, run `npm run build`, and the whole site updates.
   Anything still marked TBD is deliberately unset. It renders as a visible
   "to be announced" line rather than an invented fact.
   ------------------------------------------------------------------------- */

export const site = {
  name: "Kingdom Assembly Missions",
  short: "Kingdom Assembly Missions",
  abbr: "KAM",
  tagline: "Reaching the broken. Restoring the community. Advancing the Kingdom.",
  motto: "Love. Serve. Impact.",
  city: "Greenville",
  region: "South Carolina",
  regionCode: "SC",

  // TBD values render as "To be announced". Fill them in and rebuild.
  email: "TBD",
  phone: "TBD",
  mailingAddress: "TBD",

  // Paste the live donation link here (Givelify, Tithe.ly, Stripe, PayPal).
  // Until then every GIVE button routes to the on-site give page, which
  // explains how to give and asks people to check back.
  donateUrl: "TBD",

  // The forms endpoint. Deploy worker/index.js to Cloudflare Workers and paste
  // the resulting URL here. Until then forms show a clear notice instead of
  // silently failing.
  formEndpoint: "TBD",

  social: {
    instagram: "TBD",
    facebook: "TBD",
    youtube: "TBD",
  },

  // The live domain. Used for canonical URLs, sitemap.xml and share cards.
  // While the site is previewing on a GitHub project Pages URL, the build
  // overrides this with SITE_ORIGIN + BASE_PATH so canonicals stay honest.
  origin:
    (process.env.SITE_ORIGIN || "https://kingdomassemblymissions.org").replace(/\/$/, "") +
    (process.env.BASE_PATH || "").replace(/\/$/, ""),
};

export const nav = [
  { label: "About", href: "/about/" },
  { label: "Our Mission", href: "/mission/" },
  { label: "Programs", href: "/programs/" },
  { label: "Events", href: "/events/" },
  { label: "Discipleship", href: "/discipleship/" },
  { label: "Get Involved", href: "/get-involved/" },
];

/* --- The six journeys. This is the index on the homepage, and it is the
   single most important piece of navigation on the site. ------------------ */
export const journeys = [
  { label: "I need help", href: "/need-help/", note: "Confidential. Start here." },
  { label: "I want to find community", href: "/events/", note: "Come to something." },
  { label: "I want to follow Christ", href: "/discipleship/", note: "Take the next step." },
  { label: "I want to serve", href: "/volunteer/", note: "Give your time." },
  { label: "I want to give", href: "/give/", note: "Fund the work." },
  { label: "I want to partner", href: "/partner/", note: "For churches and businesses." },
];

/* --- The KAM outreach model ---------------------------------------------- */
export const model = [
  { step: "Reach",   line: "Meet people where they are." },
  { step: "Serve",   line: "Address practical needs." },
  { step: "Connect", line: "Build genuine relationships." },
  { step: "Restore", line: "Point people toward healing, hope and stability." },
  { step: "Disciple",line: "Teach them how to follow Christ." },
  { step: "Empower", line: "Help them discover purpose and serve others." },
];

/* --- The five areas of impact -------------------------------------------- */
export const programs = [
  {
    slug: "mental-health",
    name: "Mental Health",
    short: "Mental Health",
    kicker: "You are not alone.",
    card: "Spaces where people find encouragement, community, prayer and real resources, without being told to just pray harder.",
    mission:
      "Create spaces where people can find encouragement, community, prayer, counseling resources and hope, while recognizing that mental health struggles require compassion, support and appropriate professional care.",
    beliefs: [
      "You are not alone.",
      "Your life has value.",
      "Your story matters.",
      "There is hope.",
      "Faith and professional support can work alongside one another.",
    ],
    body: [
      {
        h: "What we are building",
        p: "Mental health is not a side issue in our community. It sits underneath a great deal of what people carry silently: grief, anxiety, depression, isolation, trauma, and the exhaustion of holding everything together in public. Kingdom Assembly Missions is building spaces where a person can put that down for an hour and not be judged for it.",
      },
      {
        h: "Faith and professional care are not rivals",
        p: "We pray, and we also believe a trained counselor is a gift. KAM partners with qualified counselors and mental health professionals and connects people to them. We are a community outreach, not a clinical provider, and we will always say so plainly. What we offer is presence, encouragement, prayer, community and a clear path to the people who are trained to help.",
      },
      {
        h: "What it looks like in practice",
        p: "Community gatherings where the conversation is honest. Prayer with people rather than at them. Relationships that continue after the event ends. Referrals to counselors and local resources. And an open door back into everything else KAM does, because isolation is often the real problem underneath.",
      },
    ],
    cta: { head: "You do not have to carry it by yourself.", label: "Get connected" },
    actions: ["learn", "connect", "volunteer", "give"],
  },
  {
    slug: "homelessness",
    name: "Homelessness",
    short: "Homelessness",
    kicker: "We don't just want to feed someone for a day. We want to remind them that they matter.",
    card: "Food, hygiene, necessities, prayer and relationship for people and families living without a stable address.",
    mission:
      "Serve individuals and families experiencing homelessness through practical assistance, dignity, compassion and relationship building.",
    beliefs: [
      "People experiencing homelessness deserve dignity.",
      "A meal is a beginning, not the point.",
      "Relationship outlasts a handout.",
    ],
    body: [
      {
        h: "The work",
        p: "Food drives. Community meals. Hygiene product distribution. Basic necessities. Prayer. Encouragement. Connection to community resources. Outreach events where people are already standing rather than where it is convenient for us.",
      },
      {
        h: "Why dignity is the whole strategy",
        p: "It is possible to hand someone a plate and still communicate that they are a problem being managed. We refuse that. Our volunteers are trained to learn names, to ask before praying, to sit down rather than stand over, and to come back. A person who has been treated as a category for years can tell the difference in about four seconds.",
      },
      {
        h: "What we will not do",
        p: "We will not photograph people at their lowest point to raise money. We will not require anyone to sit through a message before they eat. The Gospel is offered, never charged for.",
      },
    ],
    cta: { head: "Help us feed the community.", label: "Sponsor an outreach" },
    actions: ["give", "volunteer", "sponsor"],
  },
  {
    slug: "youth",
    name: "At-Risk Youth",
    short: "At-Risk Youth",
    kicker: "Character matters when nobody is watching.",
    card: "Life skills, biblical principles, real role models and mentorship for young people making decisions that will follow them for years.",
    mission:
      "Help young people develop the skills, confidence, character, relationships and biblical foundation necessary to make positive decisions and pursue a healthy future.",
    beliefs: [
      "Young people need positive examples they can actually reach.",
      "Representation, relationship and relatability matter.",
      "Doing what is right is worth it, even when it is hard.",
    ],
    body: [
      {
        h: "Life skills development",
        p: "Practical things a young person can use the same week they learn them. Decision making. Communication. Financial literacy. Work ethic. Leadership. Conflict resolution. Personal responsibility. Goal setting. Career preparation. Healthy relationships. Accountability.",
      },
      {
        h: "Biblical principles",
        p: "Every practical lesson is tied back to Scripture, because a skill without a foundation is just a tool. We teach that integrity costs something, that doing right when it is expensive is still right, and that character is what remains when nobody is watching.",
      },
      {
        h: "Positive role models",
        p: "We bring in people young people can actually relate to. Entrepreneurs, athletes, musicians, community leaders, professionals, ministers, and people who came through the exact circumstances our students are in right now. A young person needs to see somebody they could become standing in front of them.",
      },
      {
        h: "Mentorship",
        p: "We are building a mentorship system that pairs young people with responsible adults for the long haul. Not a one-time assembly. A relationship with somebody who notices when they disappear.",
      },
    ],
    cta: { head: "Help us build the next generation.", label: "Become a mentor" },
    actions: ["mentor", "volunteer", "sponsor", "give"],
  },
  {
    slug: "womens-support",
    name: "Battered & Abused Women",
    short: "Women's Support",
    kicker: "Help us help her start again.",
    card: "Confidential support, self-defense training, resource connection and transitional help for women leaving abusive situations.",
    mission:
      "Support women transitioning out of abusive environments by providing encouragement, practical assistance, resources and a pathway toward stability.",
    beliefs: [
      "Women escaping abuse deserve safety and support.",
      "Nobody has to explain themselves to get help.",
      "Leaving is a process, not a moment.",
    ],
    safety: true,
    body: [
      {
        h: "Self-defense classes",
        p: "We are building a program of regular classes to develop confidence, situational awareness and practical safety skills, taught in a setting where a woman is not asked to explain why she came. Dates go on the events page as soon as the first one is scheduled.",
      },
      {
        h: "Transitional housing support",
        p: "We are developing a fund to help provide temporary housing assistance for women transitioning out of abusive situations. This assistance is subject to available resources, eligibility, safety considerations and partner capacity. We will always tell you plainly what we can and cannot cover rather than making a promise we cannot keep.",
      },
      {
        h: "Resource connection",
        p: "We connect women to domestic violence organizations, shelters, counselors, legal resources, housing resources, employment resources and community organizations. Often the most useful thing we do is know exactly who to call.",
      },
      {
        h: "How we handle your information",
        p: "We do not ask anyone to type sensitive details into a form on a website. Our contact page asks only what we need in order to reach you safely. If it is not safe for us to call or email you, say so and we will follow your lead.",
      },
    ],
    cta: { head: "Help us help her start again.", label: "Get resources" },
    actions: ["give", "volunteer", "partner", "resources"],
  },
  {
    slug: "recovery",
    name: "Addiction & Recovery",
    short: "Addiction & Recovery",
    kicker: "Your story doesn't have to end where your struggle began.",
    card: "Monthly recovery meetings, in development, built on testimony, teaching, accountability, prayer and a real path forward.",
    mission:
      "Create a community where people struggling with addiction can find support, accountability, prayer, testimony, professional resources and hope.",
    beliefs: [
      "People battling addiction deserve compassion, accountability and hope.",
      "Nobody should be defined by their worst moment.",
      "Community is not optional in recovery.",
    ],
    body: [
      {
        h: "Monthly recovery meetings, in development",
        p: "This is what we are building, and it is not running yet. A community and support structure in the spirit of the meetings many people already know, built on a Christian foundation. Testimonies. Group discussion. Prayer. Worship. Gospel-centered encouragement. Accountability. Recovery resources. Qualified counselors and professionals present. And an open door into discipleship for anyone who wants it.",
      },
      {
        h: "This is not treatment, and we will not pretend it is",
        p: "KAM meetings are not a replacement for medical care or professional addiction treatment. Detox is a medical event. Withdrawal from some substances can kill you. We will help you find real treatment and we will stand with you through it, but we will never tell you that a meeting is a substitute for a doctor.",
      },
    ],
    cta: { head: "Come as you are. We will tell you the moment the first one is set.", label: "Get connected" },
    actions: ["connect", "volunteer", "give", "partner"],
  },
];

/* --- The recovery meeting shape ------------------------------------------ */
export const meetingFlow = [
  "Welcome",
  "Testimony",
  "Teaching",
  "Counseling and resource connection",
  "Group support",
  "Prayer and worship",
  "Altar call",
  "Discipleship opportunity",
];

/* --- Events. Add an object here and it appears everywhere on the site. ----
   status: "upcoming" | "past". Anything left TBD renders as "To be announced".
   ------------------------------------------------------------------------- */
export const events = [
  {
    slug: "christian-open-mic",
    title: "KAM Christian Open Mic",
    date: "2026-10-09",
    // dateLabel is DERIVED from `date` further down this file. Do not hand-write
    // a weekday here: the first version of this file said "Thursday, October 9"
    // and 9 October 2026 is a Friday.
    time: "TBD",
    venue: "TBD",
    address: "TBD",
    city: "Greenville, SC",
    cost: "Free to attend",
    // Paid ticketing: paste a Stripe payment link (or any checkout URL) into
    // ticketUrl and set priceLabel. Leaving ticketUrl unset keeps the free RSVP
    // form, which is the right default for a free event.
    ticketUrl: "TBD",
    priceLabel: "TBD",
    status: "upcoming",
    featured: true,
    blurb: "Come share your gift. Come hear a story. Come find community.",
    body:
      "Our first major event. An evening built around Christian music, spoken word, testimony and fellowship. Bring something to share or bring nothing at all and just sit in the room. Both are the point.",
    forWho: [
      "Musicians, singers, poets and spoken-word artists",
      "Anyone with a testimony worth telling",
      "Anyone who just wants to be around people for an evening",
    ],
    registerUrl: "TBD",
  },
];

/* --- Stories of restoration.
   Nothing goes here without explicit written permission from the person whose
   story it is. While this array is empty the stories page says so honestly
   rather than showing a stock photo and invented copy.
   Shape: { name, role, quote, body, program, consent }
   `name` may be a first name only, or "Anonymous". `consent` is the date the
   person gave written permission, and a story without one does not publish.
   ------------------------------------------------------------------------- */
export const testimonials = [];

/* --- Team. Renders on the About page once there is a team to show.
   Shape: { name, role, bio, email }
   ------------------------------------------------------------------------- */
export const team = [];

/* --- Named giving campaigns. Renders on the Give page when non-empty.
   Shape: { title, blurb, goal, raised, closes, url }
   Leave `goal` and `raised` out entirely unless the figures are real. Never
   put an aspirational number in either one.
   ------------------------------------------------------------------------- */
export const campaigns = [];

/* --- News and updates. A /news/ page is generated ONLY when this has posts,
   so an empty blog never ships.
   Shape: { slug, title, date, summary, body: ["paragraph", ...] }
   ------------------------------------------------------------------------- */
export const posts = [];

/* --- Bible study.
   Renders a /bible-study/ page and adds it to the nav ONLY when `active` is
   true, so nothing half-built ever ships. We deliberately do NOT embed Zoom in
   the page: the Meeting SDK needs a server-side signature and is unreliable on
   mobile Safari, which is where most of this audience will be. A proper Join
   button hands off to the Zoom app, which works everywhere.
   ------------------------------------------------------------------------- */
export const bibleStudy = {
  active: false,

  title: "KAM Bible Study",
  blurb: "An hour in the Word together, on Zoom, wherever you are.",
  schedule: "TBD",          // e.g. "Every Tuesday, 7:00 PM Eastern"
  zoomUrl: "TBD",           // the recurring meeting join link
  meetingId: "TBD",         // shown so people can dial in by phone
  dialIn: "TBD",            // e.g. "+1 305 224 1968"

  // Never publish a passcode on a public page. If the meeting needs one, send
  // it to the people who sign up instead.
  passcodeIsPrivate: true,

  intro: [
    "You do not need to know anything to come. You do not need a Bible in your hand, you do not need to read out loud, and you do not need to have your camera on. Turn up, listen, ask whatever you want to ask.",
    "It is an hour. It is the same link every week. If you miss one, come to the next one.",
  ],

  // Past and upcoming sessions. Shape:
  //   { date: "2026-10-14", title, passage, summary, recordingUrl, notesUrl }
  sessions: [],
};

/* --- Photos and video.
   Files go in static/img/gallery/. Every item needs a real caption and real
   alt text: this is a ministry, and a photograph of a person who did not agree
   to be photographed does not go on the internet.
   Shape: { src, alt, caption, event, consent, video }
   `consent` is the date permission was given. No consent, no publish.
   ------------------------------------------------------------------------- */
export const gallery = [];

/* --- Volunteer roles ------------------------------------------------------ */
export const volunteerRoles = [
  "Outreach",
  "Prayer team",
  "Youth mentorship",
  "Event support",
  "Food distribution",
  "Hygiene product distribution",
  "Women's support initiatives",
  "Recovery meetings",
  "Counseling or professional services",
  "Media and photography",
  "Music and worship",
  "Hospitality",
  "Transportation and logistics",
  "Fundraising",
  "Administration",
];

/* --- Partner types -------------------------------------------------------- */
export const partnerTypes = [
  "Churches",
  "Businesses",
  "Nonprofits",
  "Counselors and therapists",
  "Recovery organizations",
  "Domestic violence organizations",
  "Youth organizations",
  "Community leaders",
  "Schools and community organizations",
  "Healthcare professionals",
  "Housing organizations",
  "Local entrepreneurs",
  "Artists and musicians",
];

/* --- What KAM does at a table -------------------------------------------- */
export const tabling = [
  "Hand out Bibles",
  "Pray with people",
  "Introduce people to KAM",
  "Share what is coming up",
  "Raise funds for community outreach",
  "Recruit volunteers",
  "Connect people with resources",
  "Listen to what the community actually needs",
];

/* --- Discipleship track --------------------------------------------------- */
export const discipleshipTrack = [
  "Biblical foundations",
  "Prayer",
  "Scripture study",
  "Identity in Christ",
  "Character development",
  "Accountability",
  "Spiritual growth",
  "Serving others",
  "Discovering purpose",
  "Leadership development",
];

/* --- Giving designations -------------------------------------------------- */
export const givingDesignations = [
  "Where it is needed most",
  "Mental health outreach",
  "Homelessness outreach",
  "At-risk youth programs",
  "Women's support and transitional assistance",
  "Addiction and recovery",
  "Bibles and outreach materials",
  "Community events",
];

/* --- Verified crisis resources.
   Every number here was checked against its own primary source. Do not edit
   these without re-checking. A wrong number on this site is dangerous.
   Last verified: 2026-09-10.
   ------------------------------------------------------------------------- */
export const crisisResources = [
  {
    name: "Emergency",
    contact: "911",
    href: "tel:911",
    note: "If you are in immediate danger, call 911 before you do anything else on this page.",
    urgent: true,
  },
  {
    name: "National Domestic Violence Hotline",
    contact: "1-800-799-7233",
    href: "tel:18007997233",
    note: "24/7, free, confidential, 200+ languages. Text START to 88788, or chat at thehotline.org.",
    link: "https://www.thehotline.org/",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    contact: "988",
    href: "tel:988",
    note: "Call or text 988, any time, for mental health, suicide or substance use crisis. English and Spanish.",
    link: "https://988lifeline.org/",
  },
  {
    name: "SAMHSA National Helpline",
    contact: "1-800-662-4357",
    href: "tel:18006624357",
    note: "24/7 free and confidential treatment referral for mental health and substance use. They do not ask for your name, though they may ask for your ZIP code to find help near you.",
    link: "https://www.samhsa.gov/find-help/helplines/national-helpline",
  },
];

export const scriptures = {
  jars: {
    ref: "2 Corinthians 4:7",
    text: "But we have this treasure in jars of clay, to show that the surpassing power belongs to God and not to us.",
  },
  potter: {
    ref: "Jeremiah 18:4",
    text: "And the vessel he was making of clay was spoiled in the potter's hand, and he reworked it into another vessel, as it seemed good to the potter to do.",
  },
  brokenhearted: {
    ref: "Psalm 147:3",
    text: "He heals the brokenhearted and binds up their wounds.",
  },
};
