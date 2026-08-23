import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build-time check for a file under `public/`.
 *
 * Lets image components render a labelled placeholder until the real
 * screenshot is dropped in — no code change needed when it arrives.
 * Only ever called while prerendering, never inside the Worker.
 */
export function publicAssetExists(src: string): boolean {
  if (!src.startsWith('/')) return false;
  const relative = src.split('?')[0]!.replace(/^\//, '');
  return existsSync(join(process.cwd(), 'public', relative));
}
