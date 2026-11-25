/* ---------------------------------------------------------------------------
   Kingdom Assembly Missions: everything an administrator edits lives here.
   Change a value in this file, commit to main, and the whole site rebuilds.

   SIMPLIFIED 2026-11-25 on Selvin's direction ("FINAL WEBSITE CONTENT &
   REDESIGN DIRECTION"): the site shows only what KAM is doing right now.
   Five pages, four areas of work, three impact numbers. Do not add programs,
   partnerships or numbers here that KAM has not confirmed.
   ------------------------------------------------------------------------- */

export const site = {
  name: "Kingdom Assembly Missions",
  abbr: "KAM",
  words: "Love. Serve. Impact.",
  tagline: "Demonstrating the Love of Jesus Through Action.",
  statement:
    "Kingdom Assembly Missions is a Christian community outreach ministry committed to sharing the Gospel, serving our communities, and making disciples of Jesus Christ through practical outreach, prayer, and the Word of God.",
  mission:
    "To demonstrate the love of Jesus Christ through community outreach, practical service, evangelism, and discipleship.",
  city: "Greenville",
  region: "South Carolina",
  regionCode: "SC",

  // The ministry's own inbox. Every form on the site is emailed here.
  email: "kingdomassemblymissions@gmail.com",

  // KAM's Square checkout (donor enters any amount). Every Donate button.
  donateUrl: "https://square.link/u/rgd06jKR",

  // The forms endpoint: worker/ deployed as kam-forms on Eli's Cloudflare.
  // Set to "TBD" and the forms fall back to an email draft to KAM.
  formEndpoint: "https://kam-forms.adova.workers.dev",

  // Paste a full profile URL to show it in the footer. "TBD" stays hidden.
  social: {
    instagram: "TBD",
    facebook: "TBD",
    youtube: "TBD",
  },

  // The live domain. Used for canonical URLs, sitemap.xml and share cards.
  origin:
    (process.env.SITE_ORIGIN || "https://kingdomassemblymissions.org").replace(/\/$/, "") +
    (process.env.BASE_PATH || "").replace(/\/$/, ""),
};

/* --- Bible study on Zoom.
   Every JOIN BIBLE STUDY button on the site opens `url` directly. Set it to
   "TBD" and the buttons fall back to the contact form with "Join the Bible
   study" already chosen, so nobody ever hits a dead link.
   2026-11-25: KAM's own one-tap join link (meeting 813 5340 8945). It carries
   the passcode, by KAM's choice, so anyone with the link can join: keep Zoom's
   Waiting Room on for this meeting. */
export const bibleStudy = {
  url: "https://us06web.zoom.us/j/81353408945?pwd=1nZeULaTevoCMlknqVkEqBeLArPgbC.1",
};

/* --- Navigation. Five items, no dropdowns (Selvin 2026-11-25). Donate is
   drawn as the gold button at the end of the bar. --------------------------- */
export const nav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about/" },
  { label: "Our Outreach", href: "/outreach/" },
  { label: "Get Involved", href: "/get-involved/" },
  { label: "Donate", href: "/donate/" },
];

/* --- The three words. ---------------------------------------------------- */
export const pillars = [
  {
    word: "Love",
    line: "We demonstrate the love of Jesus Christ through compassion, prayer, personal relationships, and care for people in our communities.",
  },
  {
    word: "Serve",
    line: "We put our faith into action by serving individuals experiencing homelessness, distributing meals and essential supplies, sharing Bibles, and meeting practical needs.",
  },
  {
    word: "Impact",
    line: "We believe that consistent outreach, evangelism, and discipleship can make a lasting difference in individuals and communities.",
  },
];

/* --- Impact numbers. EXACTLY as Selvin confirmed them (2026-11-25). Never
   round up, never add one that has not been confirmed, and never show money
   raised. ------------------------------------------------------------------ */
export const impact = [
  { n: "175", label: "Individuals Experiencing Homelessness Helped" },
  { n: "93", label: "Bibles Distributed" },
  { n: "20", label: "Individuals in Active Discipleship" },
];

/* --- Feed the Homeless: the primary outreach program. --------------------- */
export const feeding = {
  name: "Feed the Homeless",
  // Described as a place KAM serves, NOT as a formal partnership.
  location: "Reedy Place in Greenville, South Carolina",
  includes: [
    "Preparing and distributing meals",
    "Hygiene kits and personal care items",
    "Clothing, socks, coats, blankets, and other necessities as available",
    "Bibles",
    "Sharing the Gospel of Jesus Christ",
    "Praying with individuals and offering spiritual encouragement",
    "Building personal relationships through consistent service",
  ],
};

/* Local nonprofit and homeless-service organizations KAM donates to and
   supports, by city. Cities only: no organization is named. */
export const supportCities = ["Greenville", "Greer", "Spartanburg", "Clemson"];

/* Where KAM tables at retail locations. */
export const tablingArea = "Greenville, Greer, and the greater Greenville area";

/* --- What a gift pays for. Only things KAM actually does. ---------------- */
export const giftUses = [
  "Meals for our monthly feeding outreach",
  "Hygiene kits and personal care items",
  "Clothing, socks, coats, and blankets",
  "Bibles to give away",
  "Support for local nonprofit and homeless-service organizations",
];

/* --- Ways to volunteer (the volunteer form's checkboxes). ---------------- */
export const volunteerWays = [
  "Monthly feeding outreach",
  "Preparing meals and hygiene kits",
  "Retail-location tabling",
  "Collecting clothing and supplies",
  "Something else",
];

/* --- The contact form's topics. The first is preselected by the JOIN BIBLE
   STUDY fallback, so keep its wording in step with BIBLE_TOPIC below. ----- */
export const BIBLE_TOPIC = "Join the Bible study";
export const contactTopics = [
  "General question",
  BIBLE_TOPIC,
  "Donate supplies",
  "Volunteer",
  "Prayer",
];

/* --- Photos and video.
   Files go in static/img/gallery/ and static/media/. Every item needs a real
   caption and real alt text, and a `consent` date (no consent, no publish).
   Media Selvin sends for the site counts as KAM's consent (Eli 2026-11-16).
   Every file was re-encoded with its metadata stripped (the iPhone originals
   carry GPS). `small` is the 800px version, `w`/`h` the full size (stops the
   layout jumping as images load), `home` marks the homepage picks. --------- */
export const galleryEvents = [
  {
    key: "outreach-2026-11-15",
    title: "Feeding outreach",
    date: "2026-11-15",
    blurb: "Meals, water, clothing, hygiene kits, coats, and blankets, free to anyone who walked up.",
  },
  {
    key: "belk-2026-11-09",
    title: "Retail tabling",
    date: "2026-11-09",
    blurb: "Sharing the mission from a table at the Belk Charity Sale.",
  },
  {
    key: "be-the-light-2026-10-31",
    title: "Be the Light",
    date: "2026-10-31",
    blurb: "Halloween night downtown, handing out glow sticks and candy.",
  },
];

export const gallery = [
  {
    src: "/img/gallery/2026-11-15-kam-table-1600.webp",
    small: "/img/gallery/2026-11-15-kam-table-800.webp",
    w: 1600, h: 1200,
    alt: "Two volunteers in gloves at the Kingdom Assembly Missions table, beside cases of water and stacked meal trays, sorting donated clothes.",
    caption: "The KAM table: meals, water, and clothing.",
    event: "outreach-2026-11-15",
    consent: "2026-11-15",
  },
  {
    src: "/img/gallery/2026-11-15-plates-packed-1600.webp",
    small: "/img/gallery/2026-11-15-plates-packed-800.webp",
    w: 1600, h: 1200,
    alt: "Rows of takeout trays on a folding table, each packed with chicken, green beans, a side and a dinner roll.",
    caption: "Plates packed that morning, before the team headed out.",
    event: "outreach-2026-11-15", home: true,
    consent: "2026-11-15",
  },
  {
    src: "/media/2026-11-15-plates-handed-out.mp4",
    poster: "/img/gallery/2026-11-15-plates-handed-out-poster.webp",
    w: 1280, h: 720, video: true,
    alt: "Video: volunteers handing out meals and water at the table.",
    caption: "“Is it hamburger?” “Chicken.” “It looks good.”",
    event: "outreach-2026-11-15",
    consent: "2026-11-15",
  },
  {
    src: "/img/gallery/2026-11-15-water-and-plates-1600.webp",
    small: "/img/gallery/2026-11-15-water-and-plates-800.webp",
    w: 1600, h: 1200,
    alt: "Two smiling volunteers in gloves standing beside cases of bottled water in a sunny parking lot.",
    caption: "Two of the volunteers at the water and meal table.",
    event: "outreach-2026-11-15", home: true,
    consent: "2026-11-15",
  },
  {
    src: "/media/2026-11-15-outreach.mp4",
    poster: "/img/gallery/2026-11-15-outreach-poster.webp",
    w: 1280, h: 720, video: true,
    alt: "Video: a wide view of the outreach, with tables of clothing, water and meals and people stopping by.",
    caption: "The whole setup, in one shot.",
    event: "outreach-2026-11-15",
    consent: "2026-11-15",
  },
  {
    src: "/img/gallery/2026-11-15-clothing-table-1600.webp",
    small: "/img/gallery/2026-11-15-clothing-table-800.webp",
    w: 1600, h: 1200,
    alt: "Two men at a folding table of donated clothing in a sunny parking lot.",
    caption: "Donated clothing, coats, and blankets.",
    event: "outreach-2026-11-15", home: true,
    consent: "2026-11-15",
  },
  {
    src: "/media/2026-11-15-volunteers.mp4",
    poster: "/img/gallery/2026-11-15-volunteers-poster.webp",
    w: 1280, h: 720, video: true,
    alt: "Video: volunteers in gloves at the table, then a close look at the packed hygiene kits.",
    caption: "Gloves on, and the hygiene kits ready to go.",
    event: "outreach-2026-11-15",
    consent: "2026-11-15",
  },
  {
    src: "/media/2026-11-15-neighbors.mp4",
    poster: "/img/gallery/2026-11-15-neighbors-poster.webp",
    w: 1280, h: 720, video: true,
    alt: "Video: two men who came by the outreach, one in a wheelchair and one in a navy and yellow coat, both smiling and laughing with the team.",
    caption: "“You look so happy, man.” “I love it, I love it.”",
    event: "outreach-2026-11-15",
    consent: "2026-11-16",
  },
  {
    src: "/img/gallery/2026-11-09-belk-charity-sale-1600.webp",
    small: "/img/gallery/2026-11-09-belk-charity-sale-800.webp",
    w: 1200, h: 1600,
    alt: "A man in a suit and tie beside a red-draped table of Kingdom Assembly Missions flyers inside a Belk store.",
    caption: "Representing KAM at the Belk Charity Sale.",
    event: "belk-2026-11-09", tabling: true,
    consent: "2026-11-15",
  },
  {
    src: "/media/2026-10-31-be-the-light.mp4",
    poster: "/img/gallery/2026-10-31-be-the-light-poster.webp",
    w: 720, h: 1280, video: true,
    alt: "Video: a man and his wife walking downtown on Halloween, explaining that they are handing out Be the Light glow sticks and candy.",
    caption: "“She has the candy, I got the glow. We both are the light.”",
    event: "be-the-light-2026-10-31",
    consent: "2026-11-15",
  },
  {
    src: "/img/gallery/2026-10-31-be-the-light-downtown-1600.webp",
    small: "/img/gallery/2026-10-31-be-the-light-downtown-800.webp",
    w: 1200, h: 1600,
    alt: "A man and a woman smiling on a downtown sidewalk at dusk, holding glow sticks and a bag of candy.",
    caption: "Glow sticks and candy, ready to hand out.",
    event: "be-the-light-2026-10-31", about: true,
    consent: "2026-11-15",
  },
];

/* --- Scripture (ESV). Checked against Bible Gateway 2026-11-25. ---------- */
export const scriptures = {
  light: {
    ref: "Matthew 5:14–16",
    text: "You are the light of the world. A city set on a hill cannot be hidden. Nor do people light a lamp and put it under a basket, but on a stand, and it gives light to all in the house. In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.",
  },
};
