# amansriven.com

My personal portfolio. Built with Astro, a few Svelte islands, and vanilla CSS,
deployed to Cloudflare Workers.

```bash
npm install
npm run dev          # http://localhost:4321
```

## Scripts

| Command           | What it does                                           |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Dev server (the contact form endpoint does not run)    |
| `npm run preview` | Build and serve through Wrangler, contact form working |
| `npm run check`   | Type and template checks                               |
| `npm run format`  | Prettier                                               |
| `npm run deploy`  | Build and deploy to Cloudflare                         |

## Where things live

```
src/content/projects/   One .mdx per project; the filename is the URL
src/lib/                site.ts (name, nav, socials), experience.ts, research.ts
src/assets/             Portraits, company logos, project screenshots
src/styles/tokens.css   Every colour, size, and spacing value
src/pages/api/contact.ts  The only server route; everything else is static
```

## Common edits

- **Add a project:** drop an `.mdx` file into `src/content/projects/`. The schema
  in `src/content.config.ts` validates the frontmatter. Set `featured: true` to
  show it on the homepage (keep that to two); `/projects` lists everything.
- **Add a role:** edit `src/lib/experience.ts`. Logos go in `src/assets/logos/`.
- **Share images:** after changing a project, run `node scripts/generate-og.mjs`
  to regenerate the cards in `public/og/`.
- **Research paper:** the `/research` page reads from `src/lib/research.ts`. After
  replacing the PDF, run `node scripts/render-paper-pages.mjs` (macOS only).

## Environment variables

Copy `.env.example` → `.env` and `.dev.vars.example` → `.dev.vars` for local work.

| Variable                       | Where                                                    |
| ------------------------------ | -------------------------------------------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY`    | Build variable (safe to expose)                          |
| `PUBLIC_POSTHOG_PROJECT_TOKEN` | Build variable, optional; analytics is off without it    |
| `PUBLIC_POSTHOG_HOST`          | Build variable, optional; `https://e.amansriven.com`     |
| `TURNSTILE_SECRET_KEY`         | Worker secret                                            |
| `RESEND_API_KEY`               | Worker secret                                            |
| `CONTACT_TO_EMAIL`             | Worker secret                                            |
| `CONTACT_FROM_EMAIL`           | Worker secret, e.g. `Portfolio <contact@amansriven.com>` |

Set secrets in production with `wrangler secret put <NAME>`. The contact form
uses Cloudflare Turnstile for spam protection and Resend to deliver email.

`e.amansriven.com` is PostHog's managed reverse proxy (a DNS-only CNAME in
Cloudflare), so ad blockers don't drop events; `https://us.i.posthog.com` also
works without it.

Analytics (PostHog) only runs in production builds with both `PUBLIC_POSTHOG_*`
build variables set. Open the site once with `?notrack` to exclude your own
browser; `?track` undoes it. Short links such as `/cv` and `/li` live in
`public/_redirects` and show up in PostHog as the `source` property.

## Deployment

The repo is connected to Cloudflare Workers: pushes to `main` deploy to
production, and other branches get preview URLs. Build command `npm run build`,
with `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_POSTHOG_PROJECT_TOKEN` and
`PUBLIC_POSTHOG_HOST` set under build variables. A build without the PostHog
pair ships with analytics silently off, even though local builds (which read
`.env`) include it. To deploy by hand,
run `npm run deploy` (this reads your local `.env`).
