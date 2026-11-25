# Kingdom Assembly Missions

The Kingdom Assembly Missions website. Static, no framework, no build
dependencies. Five pages (Home, About Us, Our Outreach, Get Involved, Donate)
plus a privacy policy, generated from one layout by `build.mjs`.

Simplified 2026-11-25 on KAM's direction: the site shows only what KAM is
doing now. Love. Serve. Impact. Monthly feeding outreach, retail-location
tabling, Zoom Bible study, discipleship.

## Editing the site

Almost everything an administrator changes lives in **`src/config.mjs`**:
the impact numbers, the Bible study link, the donation link, contact email,
social links, photos and video.

Edit that file, commit to `main`, and GitHub Actions rebuilds and redeploys.

| What | Where |
|---|---|
| Bible study Zoom link (every JOIN BIBLE STUDY button) | `bibleStudy.url` |
| Impact numbers (exact figures only, never rounded up) | `impact` |
| Donation link | `site.donateUrl` |
| Social profiles (footer) | `site.social` |
| Photos and video | `gallery`, files in `static/img/gallery/` and `static/media/` |

While `bibleStudy.url` is `"TBD"`, JOIN BIBLE STUDY opens the contact form
with "Join the Bible study" already chosen, so the button never dead-ends.

## Retired addresses

Every page from the old site (programs, prayer line, events, need-help and
so on) is a small noindex stub that forwards to the page that replaced it.
The map is `REDIRECTS` in `build.mjs`. None of the old content is published.

## Running it locally

```bash
npm run dev      # builds, serves on http://localhost:4500, rebuilds on refresh
npm run build    # writes dist/
```

## Forms

The volunteer and contact forms post to the Cloudflare Worker in `worker/`,
which emails kingdomassemblymissions@gmail.com. Set `site.formEndpoint` to
`"TBD"` and the forms fall back to an email draft instead.

## Checks

Run the dev server, then (with `SCROLLCRAFT_CHROME` pointed at a Chromium):

```bash
node lab/qc-simplify.mjs http://localhost:4500 lab/simplify   # pages, links, forms (stubbed), redirects
node lab/contrast.mjs http://localhost:4500/ ...              # WCAG AA, measured on the render
node lab/sharecard.mjs                                        # regenerate the share image
```

`qc-simplify` stubs the forms endpoint, so it never emails KAM.

## Deploying

GitHub Actions builds and publishes to GitHub Pages on every push to `main`.
The custom domain is kingdomassemblymissions.org.
