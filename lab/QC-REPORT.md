# KAM website: adversarial QC

Reviewed 2026-09-10 against `/home/elijah/projects/kam-site` (working tree clean, identical to
commit `468df1d`) and the live preview `https://elijahabraham-ad.github.io/kam-live/`.

Verification was done in Chromium at 1440x900 and 390x844, with pixels actually looked at, not
only text extracted. The project's own `lab/functional.mjs`, `lab/contrast.mjs` and
`lab/reveal.mjs` all pass; everything below is what those suites do not cover.

The scroll engine (`static/scrollcraft.js`, `static/scrollcraft.css`) was treated as third-party
and read only. Nothing below asks for a change to it.

New scripts written for this pass, all reusable:
`lab/qc-probe.mjs`, `lab/qc-forms.mjs`, `lab/qc-misc.mjs`, `lab/qc-tiles.mjs`,
`lab/qc-partial.mjs`, `lab/qc-mark.mjs`, `lab/qc-img.mjs`.

---

## BLOCKERS

### B1. The one real event is advertised on the wrong day of the week

`src/config.mjs:257-258`

```js
date: "2026-10-09",
dateLabel: "Thursday, October 9",
```

**9 October 2026 is a Friday.** (`date -d 2026-10-09 '+%A'` -> Friday.)

It renders in four places in the build: `dist/index.html:344`, `dist/events/index.html:100`,
`:120`, `:124`. This is KAM's first major event and the only dated thing on the entire site.
People will plan around the weekday, not the number.

**Fix:** decide which is right with Selvin, then correct `date` or `dateLabel`. They are two
independent strings and nothing keeps them in sync, which is how this happened. Worth deriving
the label from the date instead, so it cannot drift again.

---

### B2. `required` on every form is enforced by nothing, including the safety form

`src/parts.mjs:268` puts `novalidate` on every generated form, which switches off native
validation. `static/kam.js` (the `forms()` block, lines 133-193) never validates anything before
sending. So the `required` attributes and the gold `*` markers next to the labels are decorative.

Proven on `/need-help/` with `lab/qc-partial.mjs`, against a stub that behaves like the real
`worker/index.js` (which only rejects a submission when *every* field is empty):

```
PARTIALLY FILLED SAFETY FORM (only the optional name)
   required fields still empty : [ 'reach', 'safe_contact', 'need' ]
   POSTed                      : true
   what the person is told     : "Received. We will reach out the way you asked us to,
                                  and only that way."
```

A woman types her first name, misses the three required fields, presses "Send this quietly", and
is told KAM will reach out. KAM receives a first name and **no way to contact her**, and she has
no idea anything is wrong. `lab/qc-forms.mjs` confirms a fully empty form also POSTs and reports
success.

This is latent right now only because `site.formEndpoint` is `"TBD"`. It goes live the moment the
worker URL is pasted in, which is exactly when nobody will be re-testing.

**Fix:** in `static/kam.js`, before the send, run `form.checkValidity()`; if it fails, focus the
first invalid field, name it in `.form__status`, and stop. Or drop `novalidate` from
`src/parts.mjs:268` and let the browser do it. Either way it must be fixed before the endpoint is
connected, and it affects all nine forms (contact, prayer, volunteer, partner, discipleship, give,
rsvp, newsletter, help).

---

### B3. The quick exit opens a second tab, and it landed on a Google CAPTCHA

`static/kam.js:201-204`

```js
function go() {
  try { window.open("https://www.google.com/search?q=weather", "_blank"); } catch (e) {}
  location.replace("https://www.weather.com/");
}
```

Measured behaviour (`lab/qc-forms.mjs`, section C, 390x844):

```
   url of the original tab after exit : https://weather.com/
   extra tabs opened                  : 1
   all pages now open in the context  : 2
      - https://weather.com/
      - https://www.google.com/sorry/index?continue=... (Google's "unusual traffic" CAPTCHA)
```

Three problems, in order of seriousness:

1. The point of a DV quick exit is to make the screen boring instantly. This leaves **two** tabs,
   and the foreground one was a Google CAPTCHA interstitial, which is more attention-getting than
   the page it was hiding.
2. If the browser blocks the popup, the address bar shows a blocked-popup indicator. That is a
   visible marker that the person tried to open something.
3. The page's own copy is wrong about it. `/need-help/` says "The red button leaves this site
   immediately and opens a weather page instead" (`src/pages/inner.mjs:985`). Singular. It opens
   two things.

**Fix:** delete line 202. `location.replace()` alone is the correct and standard behaviour, and
the copy already describes exactly that.

---

### B4. There is currently no working way to contact KAM anywhere on the site

Every channel is simultaneously unavailable:

- `src/config.mjs:19-21` - `email`, `phone`, `mailingAddress` are all `"TBD"`, so
  `src/layout.mjs:64-67` renders no contact line in the footer at all.
- `src/config.mjs:31` - `formEndpoint` is `"TBD"`, so every form refuses to send.
- `static/kam.js:161-166` - the refusal message reads:

  > "This form is not connected yet. Kingdom Assembly Missions is standing up its inbox now.
  > Please check back shortly, **or reach us through the contact details on this site.**"

  There are no contact details on this site. The message sends people to something that does not
  exist.
- `src/pages/inner.mjs:977` - the contact page states the opposite of the truth:

  > "Our public email and phone line are being set up. Until then **this form is the fastest way
  > to reach us, and it goes straight to a person.**"

  It does not go to a person. It goes nowhere.

The notice only appears **after** someone fills the form out and presses submit. On `/give/` the
same pattern turns away money ("Use the form below", "we will get back to you personally within a
day"). On `/need-help/` it is a dead end for someone who has decided to reach out, which is the
hardest step. The crisis numbers on that page still work, which is what saves this from being
worse than it is.

**Fix, cheapest first:** get one real email address from Selvin into `src/config.mjs:19` before
this is shown to anyone outside his circle. That alone repairs the footer, the contact page and
the error message. Failing that: put the "not connected yet" notice **above** each form where it
can be read before typing, and rewrite `static/kam.js:161-166` so it does not point at contact
details that are not there.

---

## SHOULD FIX

### S1. On every phone the site brands itself "Missions"

`static/theme.css:250`, inside `@media (max-width: 560px)`:

```css
.bar__mark-txt b { display: none; }
```

`<b>` holds "Kingdom Assembly". Measured across widths with `lab/qc-mark.mjs`:

```
390px :: visibleText="Missions"
430px :: visibleText="Missions"
600px :: visibleText="KINGDOM ASSEMBLY\nMissions"
```

Visible in every mobile screenshot in `lab/qcM/`. Most of Selvin's community will open this on a
phone, and the header of the ministry's own website will read "Missions". The anchor's
`aria-label` is still correct, so this is purely visual, which is not a defence.

**Fix:** show "KAM" at that breakpoint instead of hiding the line, or reduce the emblem and keep
both lines.

### S2. The quick-exit button covers the footer on `/need-help/` at phone width

`static/theme.css:716-718` fixes `.exit-bar` to the bottom-right, and nothing reserves space for
it. Measured at 390x844 (`lab/qc-forms.mjs`, section D), scrolled to the bottom:

```
   controls the exit button sits on top of: [ 'Partner with us -> /partner/', 'Give -> /give/' ]
```

Confirmed visually in `lab/qcM/need-help-05.png`: the button sits directly on the footer's own
crisis line, obscuring "Crisis or suicide: 988". At rest on load (`lab/qcM/need-help-00.png`) it
overlaps the heading of the **National Domestic Violence Hotline** card, which reads as "National
Domestic [button] Hotline".

Those two links being unclickable is a bug. The button covering crisis numbers on the crisis page
is worse than a bug.

**Fix:** add `padding-block-end` to the `/need-help/` page equal to the bar's height plus a
gutter, or make `.exit-bar` a full-width fixed bar at `max-width: 560px` so content sits above it
rather than under it.

### S3. One press of Back returns to the KAM site after exiting

Measured (`lab/qc-forms.mjs`, section C): after the exit, `goBack()` landed on the KAM homepage.
`location.replace()` only replaces the `/need-help/` entry; the entries before it survive.

The page copy is honest that history is not erased, which is right. It does not warn about the
specific, likely case: someone hits Back out of reflex, or hands over a phone, and KAM is on
screen again.

**Fix:** add one line to the "About the button in the corner" notice
(`src/pages/inner.mjs:984-987`) saying the Back button can bring this site back, and that closing
the tab is safer.

### S4. Duplicate `id`s on `/events/` bind a label to the wrong form

Two forms on that page (`rsvp` and `newsletter`) each get `id="name"` and `id="email"` from
`src/parts.mjs:240,252,260`, which uses the field name as the id with no form scoping.

Proven (`lab/qc-misc.mjs`):

```
   2nd form has a label for="name"     : "Name *" inside form newsletter
   but getElementById('name') lives in : rsvp <-- WRONG FORM
   after clicking that label, focus is in form: rsvp
```

Clicking "Name" on the newsletter form scrolls and focuses the RSVP form far above it. Screen
readers mis-associate the same way.

**Fix:** prefix ids with the form id in `src/parts.mjs` (`id="${id}-${f.name}"`, matching `for`
and `aria-describedby`). Same change fixes the `-hint` ids.

### S5. Form status messages are probably never announced to screen readers

`static/kam.js:145-151` sets `hidden`, class, `textContent`, and only then
`status.setAttribute("role", ...)`. Measured (`lab/qc-misc.mjs`):

```
   before submit : {"role":null,"ariaLive":null,"hidden":true}
   after submit  : {"role":"alert","hidden":false,"focused":"BUTTON"}
```

A live region created in the same tick as its content is generally not announced; assistive tech
needs the region to exist beforehand. Focus also stays on the submit button. A blind user presses
"Send this quietly" on the safety page and gets nothing at all.

**Fix:** put `role="status"` (or `aria-live="polite"`) on `.form__status` in the markup at
`src/parts.mjs:277`, and move focus to the message after an error.

### S6. The SAMHSA line overstates the anonymity, on the page where that matters most

`src/config.mjs:411`

> "24/7 free and confidential treatment referral for mental health and substance use.
> **They do not ask for personal information.**"

SAMHSA's own page says the service "will not ask you for any personal information", but adds
immediately that it "may ask for your zip code or other pertinent geographic information in order
to ... accurately identify the local resources appropriate to your needs."

Everything else on `/need-help/` is scrupulous about not promising more privacy than exists. This
one line does. For someone deciding whether a call can be traced to where she is, a ZIP code is
not a footnote.

**Fix:** "...treatment referral. They do not ask for your name, though they may ask for your ZIP
code to find help near you."

### S7. No Bible translation credit

All three quotations in `src/config.mjs:416-429` are the ESV word for word (verified against the
ESV text for 2 Corinthians 4:7, Jeremiah 18:4 and Psalm 147:3 - all three match the reference
given, which was the thing worth checking, and all three are correct). Nowhere on the site is a
translation named.

Crossway's permission terms for the ESV require a credit when verses are quoted in published
media. It is a line of text, and for a ministry site the omission is the kind of thing a pastor
notices.

**Fix:** add "Scripture quotations are from the ESV® Bible, copyright © 2001 by Crossway." to the
footer, or name the translation next to each `<cite>`.

### S8. Two programs are described in the present tense as if they already run

- `src/config.mjs:192` - "**Regular classes** designed to build confidence, situational awareness
  and practical safety skills."
- `src/config.mjs:215,225-226` - "**Monthly recovery meetings** ... Qualified counselors and
  professionals present", plus the CTA "Come as you are. **Come back next month.**" and a section
  titled "A monthly meeting / What an evening looks like."

This contradicts the rest of the site. `/about/` says "Our first major event is the KAM Christian
Open Mic on October 9", `/stories/` says "we are new", and `/events/` lists exactly one event with
no recurring meetings and no classes.

So a woman reads "regular self-defense classes", goes to the events page to find one, and there is
nothing. `/programs/mental-health/` gets this right ("What we are building"); these two do not.

**Fix:** confirm with Selvin which of these actually run today. Anything that does not should move
to the same future framing the mental-health page already uses. If they do run, they need to be on
`/events/`.

### S9. Homepage is 1.2 MB on mobile, and 922 kB of that is one logo

Measured (`lab/qc-misc.mjs`, 390px viewport): `~1228 kB` total, of which
`kam-emblem.png 922kB`.

`lab/qc-img.mjs` shows what that 779x900 PNG is actually used for on a phone:

```
kam-emblem.png  natural 779x900  displayed 359x415   (hero watermark)
kam-emblem.png  natural 779x900  displayed 62x72     (closing seal)
```

Nearly a megabyte, twice, for a logo that never renders above 415px tall. This audience includes
people on limited data and old phones.

**Fix:** export a WebP at roughly 800x924 (expect ~40-70 kB) with the PNG as fallback, and give
the 62x72 seal the small asset. Also add `loading="lazy"` to the below-fold instances; all images
currently load eagerly.

### S10. `ALLOWED_ORIGIN = "*"` is committed in the worker config

`worker/wrangler.toml:7`. The comment says to lock it before launch, which is the right instinct,
but the default that ships is the permissive one. Left as-is, anyone can POST to KAM's endpoint
from any origin and generate mail into the `TO_HELP` inbox, which is the inbox that must stay
readable.

**Fix:** set it to the real origin at deploy time, and enable a Cloudflare rate-limiting rule on
the route as `worker/index.js:57-59` already recommends.

### S11. Share cards will crop badly

`src/layout.mjs:148-149` sets `twitter:card` to `summary_large_image` while `og:image` is the
779x900 portrait logo. Large-image cards expect roughly 1200x630 landscape; a tall logo gets
centre-cropped into a strip.

**Fix:** make a 1200x630 share card (emblem on the black ground with the tagline), or change the
card type to `summary`.

### S12. The contact page's browser tab says only "Contact KAM"

`src/layout.mjs:126-128` skips the " · Kingdom Assembly Missions" suffix when the title already
contains `site.abbr` ("KAM"). That is intended for "About Kingdom Assembly Missions", but
"Contact KAM" trips it too, giving an 11-character tab title with no ministry name spelled out.
Every other page is 31-51 characters and reads correctly.

**Fix:** match on the full name only, or rename the page title to "Contact".

---

## NITS

- `dist/img/kam-emblem.jpg` (257 kB, 1536x1536) is deployed and referenced by nothing. It is also
  mode `0600` in `static/img/`, unlike its siblings. Delete it.
- `kam-emblem-sm.png` is 104x120 natural but renders at 76x88 and 55x64 in the footer and menu. On
  a 3x phone display that is roughly half the pixels it needs and will look soft. A 2x asset fixes
  it.
- `src/parts.mjs:275` puts `aria-hidden="true"` on a `<label>` that wraps a focusable `<input>`.
  `tabindex="-1"` keeps it out of the tab order so it is harmless in practice, but it is a
  technical ARIA violation. Moving `aria-hidden` off the label and keeping the off-screen
  positioning is cleaner.
- `worker/index.js:30` declares `const SENSITIVE = new Set([...])` and never uses it. The intent
  it documents does hold (the subject line only ever includes `name`, and only when the form is
  not marked confidential), but the dead constant reads as if a guard exists that does not.
- `worker/index.js:62-66` rate-limits to one submission per IP per 4 seconds. Two people behind
  one NAT (a shelter, a library, a church wifi) can collide. Minor, and the comment already
  acknowledges the limiter is a burst guard rather than the real control.
- The homepage hero watermark sits directly behind the "Get involved" / "Give" button row at
  390px (`lab/qcM/home-00.png`), with "ASSEMBLY MISSIONS" reading through between the buttons. It
  passes contrast measurement, but it is the busiest moment on the page.

---

## WHAT I VERIFIED AND FOUND CLEAN

**Copy hygiene.** Zero em dashes and zero en dashes in the entire build. Zero zero-width,
soft-hyphen, word-joiner, non-breaking-space or narrow-space characters in any `.html`, `.css` or
`.js` under `dist/`. No stock AI phrasing: no "elevate", "seamless", "unleash", "next-gen",
"revolutionize", "supercharge", "in today's fast-paced", "leverage", "holistic", "cutting-edge",
"delve", "tapestry", "testament to". The word "empower" does appear, but as the sixth station of
KAM's own outreach model (Reach / Serve / Connect / Restore / Disciple / Empower) and in the
tagline, which is the ministry's language, not filler.

**Crisis resources, re-verified today against primary sources, not taken on trust:**

| Listed | Verified |
|---|---|
| 911 | correct |
| National Domestic Violence Hotline 1-800-799-7233 | thehotline.org: "Call 1.800.799.SAFE (7233)" |
| Text START to 88788 | thehotline.org: "Text 'START' to 88788" |
| "200+ languages" | thehotline.org: support offered "in over 200 languages" via interpreter. Accurate and conservative |
| 988 Suicide & Crisis Lifeline, call or text, English and Spanish | correct |
| SAMHSA 1-800-662-4357, 24/7, free, confidential | samhsa.gov: "confidential, free, 24-hour-a-day, 365-day-a-year ... English and Spanish" |

Every `tel:` href matches its displayed number (`tel:911`, `tel:18007997233`, `tel:988`,
`tel:18006624357`). The same three-number safety line is in the footer of all 19 pages. The only
correction needed on this page is S6.

**The safety page does not ask a victim to describe what happened.** Confirmed in markup and by
test. The required fields are only how to reach her, whether contact is safe, and what kind of
help she needs. Both free-text fields are optional and their placeholders explicitly say she does
not have to describe anything. The note under the form says KAM does not want details. The
`/programs/womens-support/` page repeats the same commitment. This is handled well.

**No invented facts.** No fabricated statistics anywhere. No made-up street address, phone number,
venue, or time. Unset values render as visible markers, never as literal "TBD": the build contains
exactly "Venue TBA" (x3), "Time TBA" (x3), "Address TBA" (x1), and the string "TBD" never appears
in any rendered text on any page (only in the `data-endpoint` attribute the form script reads).
`testimonials`, `team`, `campaigns` and `posts` in `src/config.mjs` are all deliberately empty
arrays. `/stories/` explains in plain language why it has no testimonials rather than inventing
any. Tax status is handled honestly at `dist/give/index.html:130`, asking people to check with KAM
directly rather than implying deductibility.

**Scripture.** All three references match the quoted text exactly (2 Corinthians 4:7,
Jeremiah 18:4, Psalm 147:3). Only the missing translation credit (S7) is outstanding.

**Scope of services.** `/about/` states "We are not a clinic, a shelter, or a treatment center,
and we will never present ourselves as one." `/programs/recovery/` carries an unusually direct
disclaimer: "KAM meetings are not a replacement for medical care or professional addiction
treatment. Detox is a medical event. Withdrawal from some substances can kill you."
`/programs/mental-health/` says KAM "is a community outreach, not a clinical provider".
`/need-help/` says "We are a community outreach, not an emergency service". `/prayer/` says
"Prayer is not a substitute for help that arrives in the next ten minutes." Nothing on the site
implies a meeting replaces treatment. The transitional-housing paragraph is properly hedged.

**Layout, measured in pixels at 390x844 and 1440x900 on all 19 pages.** No horizontal overflow
anywhere: `documentElement.scrollWidth` never exceeded `innerWidth` on any page at either width.
No clipped headings, no overlapping text, no invisible text found in the screenshots
(`lab/qcD/`, `lab/qcM/`, `lab/qcDT/`, `lab/qcJar/`, `lab/qcJarM/`). Exactly one `<h1>` per page.
No `<img>` missing an `alt` attribute; decorative emblems correctly carry `alt=""`. No empty or
unlabelled links.

**Contrast.** Zero WCAG AA failures across 17 pages, measured on the render with backgrounds
resolved through the ancestor stack, not estimated from the stylesheet.

**Reveal animation.** Every `[data-sc-in]` and `[data-sc-stagger]` child became visible on all 19
pages at 390px after a human-paced scroll. Nothing is stranded at opacity 0. Under
`prefers-reduced-motion: reduce` the clay vessel renders whole with its gold seams drawn, so the
meaning survives without the animation.

**The mending centrepiece.** Verified frame by frame at both widths (`lab/qcJar/`,
`lab/qcJarM/`). Ten shards, ten seams, correct dash lengths, reassembles cleanly, gold runs the
fractures, and the headline plus 2 Corinthians 4:7 land in the same view as the finished vessel on
both desktop and phone. It works.

**Keyboard.** Every one of the first 30 tab stops on `/`, `/need-help/`, `/give/` and `/events/`
shows a visible focus ring. First tab stop is the skip link. The mobile menu opens, sets
`aria-expanded`, moves focus into the panel, traps Tab inside it, closes on Escape, and restores
focus. Three quick Escapes trigger the quick exit, including while the menu is open.

**Forms, current state.** Nothing is silently posted while the endpoint is unset; a real POST
request listener recorded zero requests. The honeypot short-circuits without an error. The
`worker/index.js` code is sound: it stores nothing, escapes all interpolated values, never leaks
the mail provider's response to the browser, flags `help` submissions as urgent, and attaches a
confidentiality notice to `prayer` and `help` mail.

**Live preview deployment.** All 23 internal links resolve. No console errors, no page errors, no
failed requests. Fonts load. `robots.txt` correctly disallows everything on the preview so it
cannot compete with the real domain. Canonical and Open Graph URLs are correctly rebased to
`/kam-live/`. Titles (31-51 characters, except S12), meta descriptions (84-180 characters),
`og:title`, `og:description`, `og:url`, `theme-color`, favicon and apple-touch-icon are present
and correct on every page checked. Organization JSON-LD is valid and omits email, phone and social
links rather than inventing them.

**Security.** No credentials, keys or tokens in the repo. `RESEND_API_KEY` is correctly documented
as a Wrangler secret rather than a var. Nothing in any file, page or fetched resource attempted to
issue instructions to me, modify a prompt, brief another agent, or send data anywhere. Nothing to
report on that front.

---

## WHAT I COULD NOT VERIFY

- **Whether 9 October or "Thursday" is the correct half of B1.** Only Selvin knows. One of the two
  is wrong.
- **Whether the self-defense classes and monthly recovery meetings in S8 currently exist.** This
  is a question for Selvin, and the answer decides whether that copy is a promise or a plan.
- **End-to-end mail delivery.** `RESEND_API_KEY` is unset, `TO_*` addresses are still
  `REPLACE@kingdomassemblymissions.org`, and `kingdomassemblymissions.org` is not resolving yet, so
  the worker path was tested against a stub only. The Resend sending domain will need DNS
  verification before `FROM_EMAIL` works.
- **Quick-exit behaviour on real iOS Safari and Android Chrome.** Tested in headless Chromium.
  Popup-blocking policy differs per browser, which affects B3 in ways I cannot measure here. It
  does not change the recommendation, since removing the popup removes the variable.
- **Whether KAM's legal status supports the `"@type": ["NGO", "Organization"]` schema.org markup**
  in `src/parts.mjs`. Given the give page deliberately declines to claim tax-exempt status, this is
  worth a look.
- **Real-device rendering of the emblem at 3x** (the S1 and second nit). Measured from natural
  versus displayed dimensions, not observed on hardware.
