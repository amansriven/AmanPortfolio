import type { ImageMetadata } from 'astro';

/**
 * Images live in `src/assets/media/` so Astro can optimise them — WebP
 * conversion, responsive `srcset`, and content-hashed filenames.
 *
 * Content still refers to them by a simple public-style path
 * (`/media/roleward/hero1.png`); this maps that back to the real module.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/media/**/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

export function resolveImage(src: string): ImageMetadata | undefined {
  return modules[`/src/assets${src}`]?.default;
}
