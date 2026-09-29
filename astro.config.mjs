// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://amansriven.com',
  output: 'static',
  // No session store is needed; this avoids requiring a KV binding.
  session: false,
  adapter: cloudflare({
    imageService: 'compile',
    // Prerender in Node, not workerd: build-time helpers need real fs access
    // (see src/lib/assets.ts, which decides image vs. placeholder).
    prerenderEnvironment: 'node',
  }),
  integrations: [svelte(), mdx(), sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Pages build as `projects.html`, not `projects/index.html`, so Cloudflare
  // serves `/projects` directly instead of 307-redirecting to `/projects/`.
  // Links, canonical URLs, and the sitemap all use the no-slash form.
  trailingSlash: 'never',
  build: { inlineStylesheets: 'auto', format: 'file' },
  vite: {
    build: { cssCodeSplit: false },
  },
});
