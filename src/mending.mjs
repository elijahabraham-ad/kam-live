/* ---------------------------------------------------------------------------
   THE MENDING: the signature move.

   A clay jar, shattered. Scroll brings every piece home and then draws molten
   gold along each fracture, so the vessel that ends the act carries its breaks
   in gold rather than hiding them. 2 Corinthians 4:7.

   Geometry, and why it is built this way:

   - One irregular core piece sits off centre, and eleven outer shards fan from
     its vertices. Fanning from shared vertices is what makes the pieces tile
     the silhouette exactly: adjacent shards share an edge vertex for vertex,
     so there is never a gap or an overlap once the jar is whole.
   - The cracks are NOT straight radii. Each one zigzags through two jointed
     points before it leaves the frame. Straight lines from a single point read
     as a pie chart, which is the first version this was, and it looked like a
     beach ball rather than something that broke.
   - Angles and radii come from a seeded generator, so the break is irregular
     but identical on every build. Nothing here is random at runtime.
   ------------------------------------------------------------------------- */

const VIEW = { w: 400, h: 570 };

/* The fracture origin sits low and left of centre. A break centred in the
   middle of a symmetrical object reads as decoration. */
const HUB = [178, 344];

/* A clay jar: flared lip, short neck, full shoulder, tapered foot, flat base. */
const VESSEL =
  "M136 22 H264 C270 22 272 28 268 34 L246 58 " +
  "C244 92 240 120 232 140 " +
  "C312 178 350 238 350 318 " +
  "C350 406 310 472 262 510 " +
  "V542 H138 V510 " +
  "C90 472 50 406 50 318 " +
  "C50 238 88 178 168 140 " +
  "C160 120 156 92 154 58 L132 34 " +
  "C128 28 130 22 136 22 Z";

/* Nine, not eleven. Eleven cracks on a 400-unit jar leaves each piece too
   narrow to read as a piece, and it squeezes the angular room a crack needs to
   zigzag without running into its neighbour. */
const RAY_COUNT = 9;

/* mulberry32: deterministic, seeded, three lines. The break is the same on
   every build, which matters because the SVG is committed output. */
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pt = (a, r) => [
  +(HUB[0] + Math.cos(a) * r).toFixed(1),
  +(HUB[1] + Math.sin(a) * r).toFixed(1),
];

function geometry() {
  const rand = rng(20261009);
  const span = (Math.PI * 2) / RAY_COUNT;

  const rays = [];
  for (let i = 0; i < RAY_COUNT; i++) {
    /* Two jitter budgets, and the relationship between them is the whole
       trick. Rays must never cross: if two adjacent cracks swap order the
       shard polygon between them self-intersects and renders as a sliver
       instead of a piece. So the per-point wander is held well under half the
       tightest possible gap between neighbouring rays. */
    const base = i * span + (rand() - 0.5) * span * 0.3;   // gap >= 0.7 * span
    const wander = 0.19;                                    // 2 * 0.19 < 0.7 * span
    const core = pt(base + (rand() - 0.5) * wander * 0.5, 40 + rand() * 26);
    const j1 = pt(base + (rand() - 0.5) * wander * 2, 104 + rand() * 52);
    const j2 = pt(base + (rand() - 0.5) * wander * 2, 190 + rand() * 66);
    const far = pt(base, 820);
    rays.push({ core, j1, j2, far });
  }

  /* How each shard behaves at p = 0.
     d      how far out it is thrown along its own bearing
     bias   a push that is NOT radial, so the pieces do not form a rosette
     rot    how far it tumbles
     start  where in the act this piece begins travelling home. Staggered
            arrival is what makes it read as gathering rather than as a
            machine closing. */
  const throws = [];
  for (let i = 0; i < RAY_COUNT; i++) {
    const a = rays[i];
    const b = rays[(i + 1) % RAY_COUNT];
    const mx = (a.j1[0] + b.j1[0]) / 2 - HUB[0];
    const my = (a.j1[1] + b.j1[1]) / 2 - HUB[1];
    const len = Math.hypot(mx, my) || 1;
    /* Some pieces barely move. A break where every piece travels the same
       distance outward leaves a hole in the middle and reads as a gear
       opening. Gravity is in here too: the vertical bias skews downward, so
       the pieces fall rather than hover. */
    const d = 18 + rand() * 148;
    throws.push({
      dx: +((mx / len) * d + (rand() - 0.5) * 96).toFixed(1),
      dy: +((my / len) * d + rand() * 118 - 26).toFixed(1),
      rot: +((rand() - 0.5) * 52).toFixed(1),
      start: +(rand() * 0.34).toFixed(3),
    });
  }

  return { rays, throws, coreThrow: { dx: -14, dy: 26, rot: 7, start: 0.34 } };
}

export function mendingSvg() {
  const { rays, throws, coreThrow } = geometry();
  const P = (p) => `${p[0]},${p[1]}`;

  // The centre piece: the polygon through every ray's innermost vertex.
  const corePts = rays.map((r) => P(r.core)).join(" ");

  const frags = [
    `<polygon class="mend__frag" clip-path="url(#kamVessel)" points="${corePts}" ` +
      `style="--dx:${coreThrow.dx};--dy:${coreThrow.dy};--rot:${coreThrow.rot};--st:${coreThrow.start}"/>`,
  ];

  for (let i = 0; i < rays.length; i++) {
    const a = rays[i];
    const b = rays[(i + 1) % rays.length];
    const t = throws[i];
    const pts = [a.core, a.j1, a.j2, a.far, b.far, b.j2, b.j1, b.core].map(P).join(" ");
    frags.push(
      `<polygon class="mend__frag" clip-path="url(#kamVessel)" points="${pts}" ` +
        `style="--dx:${t.dx};--dy:${t.dy};--rot:${t.rot};--st:${t.start}"/>`
    );
  }

  // Seams: the core piece's outline, plus every crack running out from it.
  const seams = [
    `<polygon class="mend__seam" points="${corePts}"/>`,
    ...rays.map(
      (r) => `<path class="mend__seam" d="M${P(r.core).replace(",", " ")} L${P(r.j1).replace(",", " ")} L${P(r.j2).replace(",", " ")} L${P(r.far).replace(",", " ")}"/>`
    ),
  ];

  return `
<svg class="mend__fig" data-mend viewBox="0 0 ${VIEW.w} ${VIEW.h}" role="img"
     aria-label="A clay jar broken into twelve pieces, drawn back together with gold running along every crack."
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="kamVessel"><path d="${VESSEL}"/></clipPath>
    <linearGradient id="kamClay" x1="0.15" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="#54402A"/>
      <stop offset="0.46" stop-color="#33271A"/>
      <stop offset="1" stop-color="#1A120C"/>
    </linearGradient>
  </defs>

  <path class="mend__ghost" d="${VESSEL}" fill="none"/>
  <g class="mend__shards">${frags.join("")}</g>
  <g class="mend__seams" fill="none" clip-path="url(#kamVessel)">${seams.join("")}</g>
  <path class="mend__rim" d="${VESSEL}" fill="none"/>
</svg>`;
}
