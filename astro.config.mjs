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
  build: { inlineStylesheets: 'auto' },
  vite: {
    build: { cssCodeSplit: false },
  },
});
