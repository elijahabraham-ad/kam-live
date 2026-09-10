# Kingdom Assembly Missions

The Kingdom Assembly Missions website. Static, no framework, no build
dependencies. Nineteen pages generated from one layout by `build.mjs`.

## Editing the site

Almost everything an administrator needs to change lives in **`src/config.mjs`**:
contact details, the donation link, events, program copy, volunteer roles,
partner types, giving designations and the verified crisis numbers.

Edit that file, commit to `main`, and GitHub Actions rebuilds and redeploys.

Values left as `"TBD"` render on the page as a visible "to be announced"
marker rather than an invented fact. Fill them in as they are confirmed:

| What | Where |
|---|---|
| Public email, phone, mailing address | `site` in `src/config.mjs` |
| Donation link (Givelify, Tithe.ly, Stripe) | `site.donateUrl` |
| Forms endpoint | `site.formEndpoint`, after deploying `worker/` |
| Social profiles | `site.social` |
| Open Mic venue, time, address, ticket link | `events[0]` |
| Live domain | `site.origin` |

Adding an event is one object in the `events` array. It appears on the
homepage, the events page, the sitemap and the structured data automatically.

## Running it locally

```bash
npm run dev      # builds, serves on http://localhost:4500, rebuilds on refresh
npm run build    # writes dist/
```

Node 18 or newer. No dependencies are needed to build; `playwright-core` is
only used by the checks in `lab/`.

## Forms

All nine forms post to one Cloudflare Worker in `worker/`. See
[`worker/README.md`](worker/README.md). Until `site.formEndpoint` is set, the
forms tell the visitor plainly that submissions are not connected yet instead
of pretending to send.

## The safety page

`/need-help/` is built for someone whose device may be monitored. It carries a
quick-exit button (and three presses of Escape), it never asks anyone to
describe what happened to them, and it leads with crisis numbers rather than
with a form.

**The numbers in `crisisResources` were each verified against their own primary
source on 2026-09-10. Do not edit them without re-verifying. A wrong number on
that page is dangerous.**

## Checks

Run the dev server, then:

```bash
node lab/contrast.mjs   http://localhost:4500/ ...   # WCAG AA, measured on the render
node lab/functional.mjs http://localhost:4500        # links, menu, forms, safety, a11y
node lab/reveal.mjs     / /about/ ...                # nothing stuck invisible
node lab/shots.mjs      http://localhost:4500/ out   # frames across the scroll
```

They need a Chromium binary; point `SCROLLCRAFT_CHROME` at one.

## Deploying

GitHub Actions builds and publishes to GitHub Pages on every push to `main`.

While the site previews at the project Pages URL, `.github/workflows/deploy.yml`
sets `BASE_PATH` and `SITE_ORIGIN`, which prefixes every internal path and makes
`robots.txt` disallow indexing so the preview never competes with the real
domain.

**When the real domain is connected:** delete those two `env` lines from the
workflow, add a `static/CNAME` file containing the domain, point the domain's
DNS at GitHub Pages, and set `site.origin` in `src/config.mjs`.

## Reusable content components

Four arrays in `src/config.mjs` drive optional sections. **Each renders only when
its array has entries**, so an empty section never ships and there is never a
placeholder to explain away.

| Array | Renders on | Shape |
|---|---|---|
| `testimonials` | `/stories/` | `{ name, program, quote, body: [], consent }` |
| `team` | `/about/` | `{ name, role, bio, email }` |
| `campaigns` | `/give/` | `{ title, blurb, goal, raised, closes, url }` |
| `posts` | generates `/news/` and adds it to the footer | `{ slug, title, date, summary, body: [] }` |

Two rules that are not negotiable:

- **A testimonial without a `consent` date does not publish.** `consent` is the
  date the person gave written permission for their story to appear.
- **Leave `goal` and `raised` out entirely unless the figures are real.** Never
  put an aspirational number in either one.
