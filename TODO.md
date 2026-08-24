# Remaining work

Ground rules for anyone (or anything) picking this up:

- **Never fabricate.** No invented metrics, user counts, revenue, retention,
  awards, testimonials, or technologies. Every claim on the site traces to the
  résumé in `public/` or Aman's own project repos. If a value isn't known, omit
  it or leave a `TODO`. Roleward is newly launched and must carry **no** usage
  metrics until they're real.
- **Stack is fixed.** Astro + Svelte islands + TypeScript + vanilla CSS tokens,
  on Cloudflare. No React, Next.js, Tailwind, component frameworks, animation
  libraries, database, or auth. Add dependencies only when genuinely necessary.
- Commit as `Aman Sriven <amansriven757@gmail.com>`, no tool attribution.

## Assets still needed

| What                  | Where                                                 | Notes         |
| --------------------- | ----------------------------------------------------- | ------------- |
| Social preview images | `public/og/default.png`, `public/og/<project-id>.png` | 1200×630 each |

Project screenshots are in place, under `src/assets/media/<project>/`. Ahvaan's
is portrait App Store art rather than a product capture — a real in-app screen
would sit better next to the other three.

## Design refinement pass

The build is a complete, working v1. It has **not** had a critical design
review. Worth going through at 1440 / 1280 / 768 / 390 px:

- Typographic hierarchy and rhythm — is the scale doing real work?
- Section spacing; generous whitespace was a stated goal.
- The `lead` project layout (first feature, full width) is the least resolved.
- Mobile should be _designed_, not just reflowed — especially the project
  features, experience timeline, and the nested `TreeDiagram` on Odyssey.
- Hover and focus states throughout.

## Not yet done

- No accessibility audit. Specifically unverified: colour contrast of
  `--text-muted` / `--text-faint` against `--bg` at WCAG AA, keyboard traversal
  of the mobile nav sheet, heading hierarchy on case-study pages.
- OG images don't exist, so social previews currently 404.
- Cloudflare Web Analytics is stubbed in `src/layouts/BaseLayout.astro` — needs
  a token, then uncomment.
- Real Turnstile keys and a real Resend API key (see README).
- `www` → apex redirect rule, and the custom domain binding.

## Verified working

- `npm run build` clean; `astro check` 0 errors, 0 warnings.
- 6 routes prerender: `/`, `/404`, and the four case studies.
- Contact endpoint tested against the real Workers runtime — valid submission
  clears validation and Turnstile and reaches Resend; honeypot silently 200s;
  missing token 400s; field errors return per-field; CRLF injection rejected;
  GET 405s.
- No secret material in `dist/client/`.
- Client payload: ~19 KB gzipped JS, ~12 KB gzipped CSS.
