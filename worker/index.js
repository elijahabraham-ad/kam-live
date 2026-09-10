/* ---------------------------------------------------------------------------
   Kingdom Assembly Missions: form endpoint.

   One Cloudflare Worker behind every form on the site. It validates, rate
   limits, and emails KAM. It stores nothing.

   Deploy:
     cd worker
     npx wrangler secret put RESEND_API_KEY
     npx wrangler deploy

   Then paste the deployed URL into src/config.mjs as site.formEndpoint and
   rebuild. Until that value is set, the site's forms tell the visitor plainly
   that submissions are not connected yet rather than pretending to send.
   ------------------------------------------------------------------------- */

const FORMS = {
  contact: { subject: "Contact form", to: "general" },
  prayer: { subject: "PRAYER REQUEST", to: "prayer", confidential: true },
  volunteer: { subject: "Volunteer application", to: "general" },
  partner: { subject: "Partnership enquiry", to: "general" },
  discipleship: { subject: "DISCIPLESHIP signup", to: "general" },
  give: { subject: "Giving enquiry", to: "general" },
  rsvp: { subject: "Event RSVP", to: "general" },
  newsletter: { subject: "Outreach date signup", to: "general" },
  help: { subject: "*** SOMEONE NEEDS HELP ***", to: "help", confidential: true, priority: true },
};

/* Free-text fields that may carry something private. They are never echoed into
   a subject line, and they are moved to the END of the email body, under a
   divider, so a notification preview on a lock screen shows who wrote in rather
   than what they wrote. */
const SENSITIVE = new Set(["request", "note", "message", "reach", "skills"]);

const MAX_FIELD = 4000;
const MAX_FIELDS = 40;

function cors(origin, allowed) {
  const ok = allowed === "*" || (origin && allowed.split(",").map((s) => s.trim()).includes(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin || allowed : allowed.split(",")[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

/* A small in-memory limiter. Workers isolates are short-lived, so this stops
   a burst rather than a determined attacker; Cloudflare's own rate limiting
   rules are the real control and should be enabled on the route. */
const seen = new Map();
function tooFast(ip) {
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 60_000) seen.delete(k);
  const last = seen.get(ip) || 0;
  seen.set(ip, now);
  return now - last < 4000;
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "*";
    const origin = request.headers.get("Origin");
    const headers = cors(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ error: "method" }, 405, headers);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ error: "bad body" }, 400, headers);
    }

    // Honeypot. A real person never fills this in.
    if ((form.get("_hp") || "").toString().trim()) return json({ ok: true }, 200, headers);

    const kind = (form.get("_form") || "contact").toString();
    const spec = FORMS[kind];
    if (!spec) return json({ error: "unknown form" }, 400, headers);

    /* The burst limiter is deliberately skipped for the confidential forms.
       A shelter, a library or a church wifi puts many people behind one IP, and
       turning away the second person who reached out for help that minute is a
       far worse failure than accepting a duplicate. */
    if (!spec.confidential && tooFast(ip)) return json({ error: "slow down" }, 429, headers);

    const fields = [];
    let count = 0;
    for (const [key, value] of form.entries()) {
      if (key.startsWith("_")) continue;
      if (++count > MAX_FIELDS) break;
      const v = value.toString().slice(0, MAX_FIELD).trim();
      if (!v) continue;
      const existing = fields.find((f) => f.key === key);
      if (existing) existing.value += ", " + v;
      else fields.push({ key, value: v });
    }

    if (!fields.length) return json({ error: "empty" }, 400, headers);

    const label = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const name = fields.find((f) => f.key === "name")?.value;

    // Ordinary fields first, anything sensitive last.
    const plain = fields.filter((f) => !SENSITIVE.has(f.key));
    const priv = fields.filter((f) => SENSITIVE.has(f.key));
    const subject =
      (spec.priority ? "[URGENT] " : "") +
      spec.subject +
      (name && !spec.confidential ? ` from ${name}` : "");

    const row = (f) => 
      `<tr><td style="padding:8px 16px 8px 0;vertical-align:top;color:#7a7267;font:600 12px/1.4 system-ui;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap">${esc(
        label(f.key)
      )}</td><td style="padding:8px 0;vertical-align:top;color:#14110c;font:400 15px/1.55 system-ui;white-space:pre-wrap">${esc(
        f.value
      )}</td></tr>`;

    const rows =
      plain.map(row).join("") +
      (priv.length
        ? `<tr><td colspan="2" style="padding:18px 0 6px;border-top:1px solid #e7e0d2"></td></tr>` +
          priv.map(row).join("")
        : "");

    const notice = spec.confidential
      ? `<p style="margin:0 0 20px;padding:12px 16px;background:#fdf3e6;border-left:3px solid #8a6a14;color:#3b3327;font:400 14px/1.6 system-ui">This message is confidential. Do not forward it, quote it in a group chat, or read it aloud without the sender's permission.</p>`
      : "";

    const html = `<div style="max-width:640px;margin:0 auto;padding:28px;background:#fff">
<p style="margin:0 0 4px;color:#8a6a14;font:700 11px/1 system-ui;text-transform:uppercase;letter-spacing:.18em">Kingdom Assembly Missions</p>
<h1 style="margin:0 0 20px;color:#14110c;font:600 22px/1.25 Georgia,serif">${esc(spec.subject)}</h1>
${notice}
<table style="border-collapse:collapse;width:100%">${rows}</table>
<p style="margin:24px 0 0;padding-top:14px;border-top:1px solid #e7e0d2;color:#8b8377;font:400 12px/1.5 system-ui">Sent from ${esc(
      (form.get("_page") || "/").toString()
    )} at ${new Date().toISOString()}</p>
</div>`;

    const text = plain.concat(priv).map((f) => `${label(f.key)}:\n${f.value}`).join("\n\n");

    const to = env[`TO_${spec.to.toUpperCase()}`] || env.TO_GENERAL;
    if (!env.RESEND_API_KEY || !to) {
      return json({ error: "not configured" }, 500, headers);
    }

    const replyTo = fields.find((f) => f.key === "email")?.value;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || "KAM Website <website@kingdomassemblymissions.org>",
        to: to.split(",").map((s) => s.trim()),
        subject,
        html,
        text,
        ...(replyTo && /.+@.+\..+/.test(replyTo) ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      // Never leak the provider's response to the browser.
      console.log("send failed", res.status, await res.text());
      return json({ error: "send failed" }, 502, headers);
    }

    return json({ ok: true }, 200, headers);
  },
};
