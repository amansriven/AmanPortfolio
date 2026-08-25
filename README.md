# amansriven.com

Personal engineering portfolio. Astro for the static site, Svelte islands where
interaction actually needs them, vanilla CSS with a token system, deployed to
Cloudflare Workers.

```bash
npm install
npm run dev          # http://localhost:4321
```

## Scripts

| Command           | What it does                                                       |
| ----------------- | ------------------------------------------------------------------ |
| `npm run dev`     | Astro dev server                                                   |
| `npm run build`   | Production build into `dist/`                                      |
| `npm run preview` | Builds, then serves through Wrangler so the contact endpoint works |
| `npm run check`   | `astro check` — types, unused imports, template errors             |
| `npm run format`  | Prettier over the whole tree                                       |
| `npm run deploy`  | Build and deploy to Cloudflare                                     |

`npm run dev` does **not** run the contact endpoint — it needs the Workers
runtime. Use `npm run preview` to exercise the form end to end.

## Structure

```
src/
  components/     UI. Two Svelte islands (ContactForm, MobileNav); the rest is Astro.
  content/
    projects/     One .mdx file per case study. Filename becomes the URL.
  layouts/        BaseLayout — document shell, SEO, structured data.
  lib/            site.ts (identity/nav), experience.ts, research.ts, small helpers.
  pages/
    index.astro           Homepage.
    projects/[...slug]    Case study template.
    research.astro        The SCRAN paper write-up.
    api/contact.ts        The only server-rendered route.
  styles/
    tokens.css      Every colour, size, space, and timing value.
    base.css        Reset, base elements, shared primitives.
content.config.ts   Typed schema for the projects collection.
```

Only `src/pages/api/contact.ts` runs on a server. Everything else is prerendered
to static HTML at build time.

## Adding or editing a project

Drop a new `.mdx` file into `src/content/projects/`. The filename becomes the
route — `foo.mdx` renders at `/projects/foo`. Frontmatter is validated by the
schema in `src/content.config.ts`, so a typo fails the build rather than the page.

Fields worth knowing:

- `order` — homepage ordering, low to high.
- `featured` — whether it appears on the homepage at all.
- `accent` — an HSL triple _without_ the `hsl()` wrapper, e.g. `'28 68% 58%'`.
  Drives that project's ambient tint. Keep it desaturated; it renders at
  single-digit opacity.
- `metrics` — only real numbers. Leave the array empty rather than inventing one.

Inside the body you can import `Figure`, `Pipeline`, `TreeDiagram`, `Callout`,
and `SpecList` from `../../components/`. Figures and diagrams break out to the
full content width automatically; prose stays in the narrow column.

## The research page

`/research` is a single hand-built page rather than a content collection —
there is one paper. Everything it displays comes from `src/lib/research.ts`,
which is a straight transcription of the PDF: per-class metrics, the two
comparison tables, the ablation, and the training setup. **Do not round, restate,
or omit a weak result there.** The paper is one click away on the same page, so
every number is checkable, and the layout deliberately marks the rows where the
model loses.

The page renders the PDF itself in two places — a cover in the masthead and a
seven-page strip at the bottom. Those images are build inputs, not screenshots:

```
public/research/<file>.pdf          the paper, linked and downloadable
src/assets/media/research/page-N.png  one render per page, Astro-optimised
```

Regenerating the page renders after replacing the PDF (macOS only — it drives
PDFKit through the Swift interpreter in the Xcode Command Line Tools rather than
adding a rasteriser to `package.json`):

```bash
node scripts/render-paper-pages.mjs
```

Custom components on this page: `ModelDiagram` (the architecture band and its
five glyphs), `MetricSpans` (the per-class precision-to-recall chart),
`EgaComparison`, `BaselineCards`, `PaperCover`, `PaperShelf`, and `CiteBlock`.
All of them read `research.ts` and none take props.

## Screenshots

Images live under `public/media/<project>/`. Until a file exists, the site
renders a labelled placeholder showing the exact path it wants — no code change
is needed when you add the real thing.

| Drop the file here                 | Appears as                            |
| ---------------------------------- | ------------------------------------- |
| `public/media/roleward/hero.png`   | Roleward homepage + case study hero   |
| `public/media/delta-code/hero.png` | Delta Code homepage + case study hero |
| `public/media/odyssey/hero.png`    | Odyssey homepage + case study hero    |
| `public/media/ahvaan/hero.png`     | Ahvaan homepage + case study hero     |

Shoot at 2560×1440 (16:9) where possible. Additional in-body shots can be added
per project via the `gallery` frontmatter field or an inline `<Figure />`.

**Social preview images** are generated, not hand-made:

```bash
node scripts/generate-og.mjs
```

It reads each project's title, tagline, stack, and accent straight from the MDX
frontmatter and writes 1200×630 cards into `public/og/`. Re-run it after editing
frontmatter or adding a project. The `default` and `research` cards are literals
in that script — the research one mirrors `paper` in `src/lib/research.ts` and
has to be kept in step by hand.

**Portrait** lives at `src/assets/portrait/aman.jpg` and appears in the hero
identity row and the About section. Replacing that file updates both.

The résumé is deliberately **not** published here. `public/*Resume*.pdf` is
git-ignored; the nav's emphasised action is Contact instead.

## Environment variables

Build-time, public (safe to expose — it is a _site_ key):

```
PUBLIC_TURNSTILE_SITE_KEY
```

Worker secrets, never exposed to the client:

```
RESEND_API_KEY
TURNSTILE_SECRET_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

Locally, copy `.env.example` → `.env` and `.dev.vars.example` → `.dev.vars`.
Both are git-ignored. `npm run preview` copies `.dev.vars` into `dist/server/`
for you — Wrangler resolves it relative to the generated config, not the project
root, which is an easy hour to lose. Cloudflare's test keys (`1x00000000000000000000AA` /
`1x0000000000000000000000000000000AA`) always pass and are fine for development.

In production:

```bash
wrangler secret put RESEND_API_KEY
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put CONTACT_TO_EMAIL
wrangler secret put CONTACT_FROM_EMAIL
```

`PUBLIC_TURNSTILE_SITE_KEY` is a _build_ variable, so set it in the Cloudflare
project's build settings rather than as a secret.

## Contact form

```
form  →  POST /api/contact  →  Turnstile siteverify  →  validation  →  Resend  →  inbox
```

The endpoint validates everything server-side regardless of what the client
did: field lengths, email shape, a honeypot, CRLF header-injection attempts, and
the Turnstile token against Cloudflare's `siteverify` endpoint with the caller's
IP. Client-side validation exists purely for the typing experience and is not
trusted. Message bodies are HTML-escaped before they reach the email template.

### Turnstile setup

1. Cloudflare dashboard → Turnstile → **Add widget**.
2. Widget mode **Managed**, hostname `amansriven.com` (add `localhost` for dev).
3. Site key → `PUBLIC_TURNSTILE_SITE_KEY`. Secret key → `TURNSTILE_SECRET_KEY`.

The widget renders in `execute` mode with `interaction-only` appearance, so most
visitors never see it.

### Resend setup

1. Create an API key at [resend.com](https://resend.com) → `RESEND_API_KEY`.
2. Add `amansriven.com` as a domain and create the DNS records Resend gives you.
   Since DNS is already at Cloudflare, add them there — and set each to
   **DNS only** (grey cloud), not proxied:

   | Type | Name                | Purpose                    |
   | ---- | ------------------- | -------------------------- |
   | MX   | `send`              | bounce handling            |
   | TXT  | `send`              | SPF                        |
   | TXT  | `resend._domainkey` | DKIM                       |
   | TXT  | `_dmarc`            | DMARC policy (recommended) |

   Resend shows the exact values — copy them rather than guessing.

3. Once verified, set `CONTACT_FROM_EMAIL` to
   `Portfolio <contact@amansriven.com>`.

Until the domain is verified, `onboarding@resend.dev` works as a from-address
for testing.

## Deployment

Cloudflare Workers with static assets. `main` and the assets directory are
generated by the Astro adapter into `dist/server/wrangler.json` at build time;
the checked-in `wrangler.jsonc` only holds the settings you actually own.

**Connected to GitHub (what this repo uses):** Cloudflare dashboard → Workers →
Create → Import a repository. Build command `npm run build`, and add
`PUBLIC_TURNSTILE_SITE_KEY` under build variables. Pushes to `main` deploy to
production; other branches get preview URLs.

**Manual:**

```bash
npm run deploy
```

### Custom domain

1. Worker → Settings → Domains & Routes → **Add custom domain** →
   `amansriven.com`. Cloudflare provisions the certificate.
2. For `www`, add a redirect rule: `www.amansriven.com/*` →
   `https://amansriven.com/$1`, 301. This keeps the apex canonical, which is what
   the `<link rel="canonical">` tags and the sitemap already assume.
3. HTTPS and HTTP/3 are on by default. `_headers` (generated at build) sets
   immutable caching for hashed assets in `/_astro/*`.

### Analytics

Cloudflare Web Analytics is stubbed out in `src/layouts/BaseLayout.astro` — add
your token and uncomment the script tag.

## Notes

- The only JavaScript shipped to the client is the contact form, the mobile nav,
  a scroll-reveal observer, and a header scroll listener. Everything else is
  static HTML and CSS.
- All motion is behind `prefers-reduced-motion`.
- Colours, spacing, and type all resolve through `src/styles/tokens.css`. Change
  a value there and it propagates everywhere.
