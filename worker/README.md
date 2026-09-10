# KAM form endpoint

One Cloudflare Worker behind all nine forms on the site. It validates, rate
limits, emails KAM, and stores nothing.

## Deploy

1. Create a [Resend](https://resend.com) account and verify the sending domain.
   The free tier covers far more than this site will send.
2. Edit `wrangler.toml`: set `TO_GENERAL`, `TO_PRAYER`, `TO_HELP` and
   `FROM_EMAIL`. Prayer and help go to a **small** list of people, because both
   are confidential.
3. `npx wrangler secret put RESEND_API_KEY`
4. `npx wrangler deploy`
5. Paste the deployed URL into `../src/config.mjs` as `site.formEndpoint`, then
   `npm run build` and redeploy the site.
6. Set `ALLOWED_ORIGIN` to the live site origin, and turn on a Cloudflare rate
   limiting rule on the Worker route.

## What it does with the sensitive forms

`prayer` and `help` are marked confidential. Their email carries a visible
notice not to forward or quote it, and the sender's name is kept out of the
subject line so nothing sensitive shows in a notification preview on a phone
that somebody else can see. Nothing is written to storage or logs.
