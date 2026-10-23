/* ---------------------------------------------------------------------------
   THE MENDING, in three dimensions.

   Progressive enhancement over the SVG jar in src/mending.mjs. The SVG stays
   in the page and is what anyone gets with reduced motion, without WebGL 2,
   or before this module has loaded. When the 3D scene is ready it takes over
   the same spot on the same scroll: the engine publishes --sc-p on the act
   and this reads it every frame, so both versions keep identical timing.

   The jar is a lathe of the SVG silhouette, so it is the same vessel, with a
   real wall: a glazed outside, an unglazed inside and a lip. It breaks into
   shards around an impact point on the front, and the break is drawn per
   PIXEL, not per triangle: every shard is the same lathe mesh, and its shader
   keeps only the fragments whose nearest fracture seed is that shard. So the
   cracks are smooth, irregular curves at any resolution, the pieces tile
   exactly with no gaps, and the gold that fills them is the same function's
   distance to the next-nearest seed. Each shard only carries the grid cells
   near its own region, so nothing is drawn twenty times over.

   Timing matches the CSS version: shards travel for 0.34 of the act, the last
   one starts by 0.18, all home by about 0.52, then gold flows outward from
   the impact point along every crack from 0.5 to 0.7.
   ------------------------------------------------------------------------- */

const act = document.getElementById("mending");
const art = act && act.querySelector(".mend__art");
const fig = act && act.querySelector(".mend__fig");
const stage = act && act.querySelector("[data-sc-stage]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (act && art && fig && stage && !reduced && hasWebGL2()) {
  // Load three.js only when the reader is getting close to the jar.
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    start().catch((err) => {
      console.warn("Mending 3D unavailable, keeping the SVG jar.", err);
      act.classList.remove("is-3d");
    });
  }, { rootMargin: "150% 0px" });
  io.observe(act);
}

function hasWebGL2() {
  try { return !!document.createElement("canvas").getContext("webgl2"); }
  catch (e) { return false; }
}

/* ---- the jar's silhouette, lifted straight from the SVG path ---------- */
/* Right-hand half of VESSEL in src/mending.mjs, as cubic segments in SVG
   units. x - 200 is the radius, y runs down. World units: height 1.0, centred
   on 0, top at +0.5. */
const SEGS = [
  [[264, 22], [270, 22], [272, 28], [268, 34]],
  [[268, 34], [261, 42], [253, 50], [246, 58]],
  [[246, 58], [244, 92], [240, 120], [232, 140]],
  [[232, 140], [312, 178], [350, 238], [350, 318]],
  [[350, 318], [350, 406], [310, 472], [262, 510]],
  [[262, 510], [262, 521], [262, 531], [262, 542]],
];
const toWorld = ([x, y]) => [(x - 200) / 520, (282 - y) / 520];

function bez(s, t) {
  const u = 1 - t;
  const f = (k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k];
  return [f(0), f(1)];
}

/* Dense polyline down the profile, then resampled to even arc length so the
   rows are evenly spaced over the shoulder as well as the straight walls. */
function profile(rows) {
  const pts = [];
  SEGS.forEach((s, i) => {
    for (let k = i ? 1 : 0; k <= 60; k++) pts.push(toWorld(bez(s, k / 60)));
  });
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[acc.length - 1];
  const out = [];
  let j = 0;
  for (let r = 0; r <= rows; r++) {
    const want = (r / rows) * total;
    while (j < acc.length - 2 && acc[j + 1] < want) j++;
    const t = (want - acc[j]) / (acc[j + 1] - acc[j] || 1);
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t]);
  }
  // Outward normal of the profile: rotate the downward tangent a quarter turn.
  return out.map((p, i) => {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)];
    const tr = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.hypot(tr, ty) || 1;
    return { r: p[0], y: p[1], nr: -ty / len, ny: tr / len };
  });
}

function radiusAt(prof, y) {
  for (let i = 1; i < prof.length; i++) {
    if (prof[i].y <= y) {
      const a = prof[i - 1], b = prof[i];
      const t = (a.y - y) / (a.y - b.y || 1);
      return a.r + (b.r - a.r) * t;
    }
  }
  return prof[prof.length - 1].r;
}

/* ---- the break ----------------------------------------------------------- */
/* mulberry32, same generator as the SVG build: deterministic, so the jar
   breaks the same way on every visit. */
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* The warp bends straight Voronoi edges into cracks that wander. It must be
   bit-for-bit the same idea in JS (choosing which grid cells each shard
   carries) and in GLSL (deciding each pixel), so it is plain sines of small
   arguments, which agree between the two to far less than one cell. */
const W1 = 0.022, F1 = 11.0, P1 = [1.3, 2.1, 0.7];
const W2 = 0.007, F2 = 31.0, P2 = [0.4, 1.9, 2.6];
function warp([x, y, z]) {
  return [
    x + W1 * Math.sin(y * F1 + P1[0]) + W2 * Math.sin(z * F2 + P2[0]),
    y + W1 * Math.sin(z * F1 + P1[1]) + W2 * Math.sin(x * F2 + P2[1]),
    z + W1 * Math.sin(x * F1 + P1[2]) + W2 * Math.sin(y * F2 + P2[2]),
  ];
}
const GLSL_WARP = `
vec3 kamWarp(vec3 p) {
  return p + ${W1.toFixed(4)} * sin(p.yzx * ${F1.toFixed(1)} + vec3(${P1.join(", ")}))
           + ${W2.toFixed(4)} * sin(p.zxy * ${F2.toFixed(1)} + vec3(${P2.join(", ")}));
}`;

/* Seeds: one at the impact, a ring of six close around it (radial wedges),
   eight further out (the concentric break), and a handful across the back,
   neck and foot so the far side breaks too. Placed on the surface in
   (arc length around, height) around the impact, then lifted to 3D. */
function seeds(prof) {
  const rand = rng(20261009);
  const impact = { a: -0.15, y: (282 - 344) / 520 };
  const onSurface = (a, y) => {
    y = Math.max(-0.47, Math.min(0.46, y));
    const r = radiusAt(prof, y);
    return [r * Math.sin(a), y, r * Math.cos(a)];
  };
  const r0 = radiusAt(prof, impact.y);
  const list = [onSurface(impact.a, impact.y)];
  const ring = (n, rad, jit, phase) => {
    for (let i = 0; i < n; i++) {
      const ang = phase + (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.5;
      const d = rad * (1 + (rand() - 0.5) * jit);
      const s = Math.cos(ang) * d, dy = Math.sin(ang) * d;
      list.push(onSurface(impact.a + s / r0, impact.y + dy));
    }
  };
  ring(6, 0.1, 0.35, 0.3);
  ring(8, 0.25, 0.3, 0.0);
  [[Math.PI, 0.0], [Math.PI - 1.2, -0.28], [Math.PI + 1.3, 0.18], [0.5, 0.33], [2.6, 0.31],
   [-1.7, -0.41], [1.8, -0.4]].forEach(([a, y]) => list.push(onSurface(a, y)));
  return { list, warped: list.map(warp), impactPos: list[0] };
}

function labelOf(w, S) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < S.length; i++) {
    const dx = w[0] - S[i][0], dy = w[1] - S[i][1], dz = w[2] - S[i][2];
    const d = dx * dx + dy * dy + dz * dz;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

/* ---- build ------------------------------------------------------------- */
async function start() {
  const THREE = await import("./vendor/three.module.min.js");
  const { RoomEnvironment } = await import("./vendor/RoomEnvironment.js");

  const ROWS = 160, COLS = 192, T = 6 / 520;
  const prof = profile(ROWS);
  const { list: seedPts, warped: S, impactPos } = seeds(prof);
  const NS = S.length;

  /* Vertex grids. aRest is always the OUTER surface point, on the inside
     wall and the lip as well, so a pixel on the inside of a shard asks the
     same "which piece am I" question as the glaze directly outside it. */
  const nV = (ROWS + 1) * (COLS + 1);
  const outerPos = new Float32Array(nV * 3), outerNrm = new Float32Array(nV * 3);
  const innerPos = new Float32Array(nV * 3), innerNrm = new Float32Array(nV * 3);
  const label = new Uint8Array(nV);
  for (let i = 0; i <= ROWS; i++) {
    const p = prof[i];
    const ri = Math.max(0.004, p.r - T * p.nr), yi = p.y - T * p.ny;
    for (let j = 0; j <= COLS; j++) {
      const a = (j / COLS) * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
      const v = i * (COLS + 1) + j, k = v * 3;
      outerPos.set([p.r * s, p.y, p.r * c], k);
      outerNrm.set([p.nr * s, p.ny, p.nr * c], k);
      innerPos.set([ri * s, yi, ri * c], k);
      innerNrm.set([-p.nr * s, -p.ny, -p.nr * c], k);
      label[v] = labelOf(warp([p.r * s, p.y, p.r * c]), S);
    }
  }

  // Lip: a ring from the outer top row to the inner top row, facing up.
  const lipPos = new Float32Array((COLS + 1) * 2 * 3), lipNrm = new Float32Array((COLS + 1) * 2 * 3);
  const lipRest = new Float32Array((COLS + 1) * 2 * 3);
  for (let j = 0; j <= COLS; j++) {
    for (let side = 0; side < 2; side++) {
      const k = (side * (COLS + 1) + j) * 3;
      lipPos.set((side ? innerPos : outerPos).subarray(j * 3, j * 3 + 3), k);
      lipRest.set(outerPos.subarray(j * 3, j * 3 + 3), k);
      lipNrm.set([0, 1, 0], k);
    }
  }

  /* Which cells each shard carries: every cell with a corner of that label
     anywhere in its 4 x 4 corner neighbourhood. The one-cell margin covers
     the slivers a wandering crack can push between corners. */
  const cells = Array.from({ length: NS }, () => []);
  const lipCells = Array.from({ length: NS }, () => []);
  const L = (i, j) => label[Math.max(0, Math.min(ROWS, i)) * (COLS + 1) + ((j % COLS) + COLS) % COLS];
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const seen = new Set();
      for (let di = -1; di <= 2; di++) for (let dj = -1; dj <= 2; dj++) seen.add(L(i + di, j + dj));
      seen.forEach((k) => cells[k].push(i, j));
      if (i < 2) seen.forEach((k) => { if (!lipCells[k].includes(j)) lipCells[k].push(j); });
    }
  }

  const attr = (arr, n = 3) => new THREE.BufferAttribute(arr, n);
  const outerAttrs = { position: attr(outerPos), normal: attr(outerNrm), aRest: attr(outerPos) };
  const innerAttrs = { position: attr(innerPos), normal: attr(innerNrm), aRest: attr(outerPos) };
  const lipAttrs = { position: attr(lipPos), normal: attr(lipNrm), aRest: attr(lipRest) };

  function geom(attrs, idx) {
    const g = new THREE.BufferGeometry();
    for (const k in attrs) g.setAttribute(k, attrs[k]);
    g.setIndex(idx);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0.8);
    return g;
  }
  const C1 = COLS + 1;

  /* ---- materials: physical glaze outside, raw clay inside -------------- */
  const shared = {
    uSeeds: { value: S.map((p) => new THREE.Vector3(...p)) },
    uGold: { value: 0 },
    uImpact: { value: new THREE.Vector3(...impactPos) },
    uSeamW: { value: 0.0042 },
  };

  function kamMaterial(base, isOuter, shard) {
    const m = isOuter
      ? new THREE.MeshPhysicalMaterial(base)
      : new THREE.MeshStandardMaterial(base);
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, shared, { uShard: { value: shard }, uIsOuter: { value: isOuter ? 1 : 0 } });
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute vec3 aRest;\nvarying vec3 vRest;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRest = aRest;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>
#define KAM_NS ${NS}
uniform vec3 uSeeds[KAM_NS];
uniform float uShard, uGold, uSeamW, uIsOuter;
uniform vec3 uImpact;
varying vec3 vRest;
float kamGold, kamCrack;
${GLSL_WARP}`)
        .replace("#include <clipping_planes_fragment>", `
  {
    vec3 kw = kamWarp(vRest);
    float d1 = 1e9, d2 = 1e9, id1 = -1.0;
    for (int i = 0; i < KAM_NS; i++) {
      float d = distance(kw, uSeeds[i]);
      if (d < d1) { d2 = d1; d1 = d; id1 = float(i); }
      else if (d < d2) { d2 = d; }
    }
    if (abs(id1 - uShard) > 0.5) discard;
    float e = d2 - d1;
    float aa = fwidth(e) + 1e-5;
    float seam = 1.0 - smoothstep(uSeamW - aa, uSeamW + aa, e);
    // Gold runs outward from the impact along the cracks as uGold rises.
    float reach = uGold * 1.3;
    float flow = 1.0 - smoothstep(reach - 0.06, reach, distance(vRest, uImpact));
    kamGold = seam * flow * uIsOuter * step(0.0005, uGold);
    kamCrack = (1.0 - smoothstep(0.0, uSeamW * 0.6 + aa, e)) * uIsOuter;
  }
#include <clipping_planes_fragment>`)
        .replace("#include <color_fragment>", `#include <color_fragment>
  {
    // Fired clay is never one flat colour: broad mottling plus a fine grain.
    // Cosmetic only, so a sine hash is fine here (no JS twin needed).
    float mott = sin(dot(vRest, vec3(23.0, 17.0, 19.0))) * sin(dot(vRest, vec3(-13.0, 29.0, 7.0)));
    float grain = fract(sin(dot(floor(vRest * 640.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    diffuseColor.rgb *= (0.95 + 0.09 * mott) * (0.93 + 0.12 * grain);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012, 0.008, 0.006), kamCrack * (1.0 - kamGold) * 0.9);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.74, 0.34), kamGold);
  }`)
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 0.24, kamGold);")
        .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n  metalnessFactor = mix(metalnessFactor, 1.0, kamGold);")
        .replace("#include <lights_physical_fragment>", "#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\n  material.clearcoat *= 1.0 - kamGold;\n#endif");
    };
    m.customProgramCacheKey = () => "kam-mend-" + (isOuter ? "o" : "i");
    return m;
  }

  /* A satin, dark clay glaze. A high clearcoat mirrored the studio light as
     a white blob and the jar read as plastic. */
  const GLAZE = { color: 0x35241a, roughness: 0.62, metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.55, envMapIntensity: 0.55 };
  const RAW = { color: 0x1a110b, roughness: 0.95, metalness: 0, envMapIntensity: 0.2 };

  /* ---- scene ----------------------------------------------------------- */
  const canvas = document.createElement("canvas");
  canvas.className = "mend__gl";
  // The SVG carried the description; once it fades out the canvas does.
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", fig.getAttribute("aria-label") || "A clay jar mended with gold.");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffdcae, 2.3);
  key.position.set(-2.4, 2.8, 3.2);
  const rim = new THREE.DirectionalLight(0xd9b450, 1.6);
  rim.position.set(2.8, 1.2, -2.2);
  scene.add(key, rim, new THREE.HemisphereLight(0x3a2a1c, 0x050302, 0.5));

  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 50);
  const jar = new THREE.Group();
  jar.rotation.x = 0.12; // look a little down into the mouth
  scene.add(jar);

  // A soft contact shadow, only once the jar stands whole again.
  const sh = document.createElement("canvas");
  sh.width = sh.height = 128;
  const sg = sh.getContext("2d");
  const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.85)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sg.fillStyle = grad; sg.fillRect(0, 0, 128, 128);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.62),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false, opacity: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.scale.set(1, 0.32, 1);
  floor.position.y = -0.505;
  jar.add(floor);

  /* Each shard: a pivot at its own centroid, so it tumbles about its own
     middle, holding three meshes offset back to the jar's frame. */
  const rand = rng(424242);
  const shards = [];
  for (let k = 0; k < NS; k++) {
    if (!cells[k].length) continue;
    const oi = [], ii = [], li = [];
    let cx = 0, cy = 0, cz = 0, n = 0;
    for (let q = 0; q < cells[k].length; q += 2) {
      const i = cells[k][q], j = cells[k][q + 1];
      const a = i * C1 + j, b = a + 1, c = a + C1, d = c + 1;
      oi.push(a, c, b, b, c, d);
      ii.push(a, b, c, b, d, c);
      if (label[a] === k) { cx += outerPos[a * 3]; cy += outerPos[a * 3 + 1]; cz += outerPos[a * 3 + 2]; n++; }
    }
    for (const j of lipCells[k]) {
      const a = j, b = j + 1, c = C1 + j, d = C1 + j + 1;
      li.push(a, b, c, b, d, c);
    }
    const centre = new THREE.Vector3(cx / (n || 1), cy / (n || 1), cz / (n || 1));
    const pivot = new THREE.Object3D();
    const body = new THREE.Group();
    body.position.copy(centre).multiplyScalar(-1);
    const outer = new THREE.Mesh(geom(outerAttrs, oi), kamMaterial(GLAZE, true, k));
    const inner = new THREE.Mesh(geom(innerAttrs, ii), kamMaterial(RAW, false, k));
    body.add(outer, inner);
    if (li.length) {
      const lipMat = kamMaterial(GLAZE, true, k);
      lipMat.side = THREE.DoubleSide;
      body.add(new THREE.Mesh(geom(lipAttrs, li), lipMat));
    }
    pivot.add(body);
    jar.add(pivot);

    /* The throw: out from the axis, forward toward the reader for the
       front pieces, and down, because things that break fall. The core
       piece at the impact barely moves and arrives last. */
    const isCore = k === 0;
    const out = new THREE.Vector3(centre.x, 0, centre.z);
    if (out.lengthSq() < 1e-6) out.set(rand() - 0.5, 0, rand() - 0.5);
    out.normalize();
    const dist = isCore ? 0.03 : 0.08 + rand() * 0.24;
    const offset = out.multiplyScalar(dist);
    offset.z += centre.z > 0 ? 0.05 + rand() * 0.14 : 0;
    offset.y += isCore ? 0.02 : -0.04 - rand() * 0.14 + (rand() - 0.5) * 0.06;
    offset.x += (rand() - 0.5) * 0.08;
    const axis = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    const spin = new THREE.Quaternion().setFromAxisAngle(axis, isCore ? 0.2 : 0.45 + rand() * 0.9);
    shards.push({ pivot, centre, offset, spin, start: isCore ? 0.16 : rand() * 0.18 });
  }

  /* ---- placement: the 3D jar stands exactly where the SVG jar stands --- */
  let W = 0, H = 0;
  function layout() {
    const sr = stage.getBoundingClientRect();
    const fr = fig.getBoundingClientRect();
    W = Math.max(1, Math.round(sr.width));
    H = Math.max(1, Math.round(sr.height));
    // DPR cap AND a total pixel budget: a 2560x1440 screen at DPR 2 would
    // otherwise be an 11 million pixel antialiased buffer.
    const budget = Math.sqrt(4.5e6 / (W * H));
    renderer.setPixelRatio(Math.max(1, Math.min(window.devicePixelRatio || 1, W < 700 ? 1.6 : 1.75, budget)));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // The vessel spans 520 of the SVG's 570 viewBox units, centred at y 282.
    const jarPx = fr.height * (520 / 570);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(0, 0, H / (jarPx * 2 * tanHalf));
    camera.updateProjectionMatrix();
    const wpp = 1 / jarPx;
    const cx = fr.left - sr.left + fr.width / 2;
    const cy = fr.top - sr.top + fr.height * (282 / 570);
    jar.position.set((cx - W / 2) * wpp, -(cy - H / 2) * wpp, 0);
    dirty = true;
    request();
  }

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const q = new THREE.Quaternion();
  const ident = new THREE.Quaternion();
  function pose(p) {
    for (const s of shards) {
      const lp = clamp01((p - s.start) / 0.34);
      const rest = Math.pow(1 - lp, 3);
      s.pivot.position.copy(s.centre).addScaledVector(s.offset, rest);
      q.copy(ident).slerp(s.spin, rest);
      s.pivot.quaternion.copy(q);
    }
    // A slow quarter-turn into place, so it reads as an object in a room.
    jar.rotation.y = -0.55 * (1 - ease(clamp01(p / 0.6))) + 0.12 * p;
    shared.uGold.value = clamp01((p - 0.5) / 0.2);
    floor.material.opacity = 0.9 * clamp01((p - 0.3) * 2.5);
  }

  /* ---- drawing: event-driven, zero idle work -------------------------- */
  /* The engine writes --sc-p into #mending's inline style on every scroll
     frame, so a MutationObserver on that attribute IS the scroll signal. A
     draw is scheduled only when it fires (or on resize), only while the act
     is on screen, and skipped when p has not actually moved. */
  let dirty = true, lastP = -1, pending = false, onScreen = false;
  const readP = () => {
    const v = parseFloat(act.style.getPropertyValue("--sc-p"));
    return Number.isFinite(v) ? v : 0;
  };
  function draw() {
    pending = false;
    const p = readP();
    if (!dirty && Math.abs(p - lastP) < 1e-4) return;
    lastP = p; dirty = false;
    pose(p);
    renderer.render(scene, camera);
  }
  function request() {
    if (pending || !onScreen) return;
    pending = true;
    requestAnimationFrame(draw);
  }

  // After the glow, so the light still sits behind the jar.
  const glow = stage.querySelector(".mend__glow");
  if (glow) glow.after(canvas); else stage.prepend(canvas);

  const io = new IntersectionObserver((entries) => {
    onScreen = entries.some((e) => e.isIntersecting);
    if (onScreen) { dirty = true; request(); }
  });
  const mo = new MutationObserver(request);
  const ro = new ResizeObserver(() => layout());

  layout();
  pose(readP());
  // Compile off the main thread where the browser allows it, so the first
  // frame does not stall the scroll.
  // (Only where the extension exists: elsewhere three warns and falls back.)
  if (renderer.compileAsync && renderer.extensions.has("KHR_parallel_shader_compile")) await renderer.compileAsync(scene, camera);
  else renderer.compile(scene, camera);
  renderer.render(scene, camera);
  lastP = readP(); dirty = false;
  // The CSS crossfades the SVG out and the canvas in, so if this lands
  // while the jar is on screen it dissolves rather than jumps.
  act.classList.add("is-3d");
  fig.setAttribute("aria-hidden", "true");

  io.observe(act);
  mo.observe(act, { attributes: true, attributeFilter: ["style"] });
  ro.observe(stage);
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    io.disconnect(); mo.disconnect(); ro.disconnect();
    act.classList.remove("is-3d");
    fig.removeAttribute("aria-hidden");
    canvas.remove();
  });
}
