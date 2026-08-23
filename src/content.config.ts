import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Project case studies.
 *
 * Add a project by dropping a new `.mdx` file into `src/content/projects/`.
 * The filename becomes the route: `roleward.mdx` -> `/projects/roleward`.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One line. Shows under the title everywhere the project appears. */
    tagline: z.string(),
    /** Two or three sentences for the homepage and social cards. */
    summary: z.string(),
    year: z.string(),
    role: z.string(),
    /** e.g. "Live", "In development", "Archived" */
    status: z.string(),
    stack: z.array(z.string()),
    /**
     * HSL triple (no `hsl()` wrapper) driving this project's ambient tint.
     * Keep these desaturated — they are rendered at single-digit opacity.
     */
    accent: z.string(),
    featured: z.boolean().default(false),
    /** Controls homepage ordering, low to high. */
    order: z.number(),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    /**
     * Path under `public/`. If the file is not there yet, the site renders a
     * labelled placeholder telling you exactly where to drop it.
     */
    heroImage: z.string(),
    heroAlt: z.string(),
    /** Optional supporting shots shown inside the case study. */
    gallery: z
      .array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() }))
      .default([]),
    /** Only real, verifiable numbers. Leave empty rather than inventing any. */
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
  }),
});

export const collections = { projects };
