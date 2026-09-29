/**
 * Small, site-wide interaction effects. Each one is progressive: without
 * JavaScript the page is fully usable and nothing moves.
 */

/* --- Cursor spotlight ------------------------------------------------- */

/** Elements with `.spotlight` get a glow that follows the pointer (base.css). */
export function initSpotlight(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  for (const el of document.querySelectorAll<HTMLElement>('.spotlight')) {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--sx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--sy', `${event.clientY - rect.top}px`);
    });
  }
}
