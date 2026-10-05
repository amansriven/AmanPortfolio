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

/* --- Sideways-scrolling rows ------------------------------------------ */

/**
 * Marks which ends of a horizontally scrolling row have content hidden past
 * them (`data-more-start`, `data-more-end`). Give the row `.scroll-fade`
 * (base.css) and those edges fade out, so a cut-off item reads as "there is
 * more this way" rather than as a layout bug. Rows that fit get neither.
 */
export function trackScrollEdges(row: HTMLElement): void {
  const update = () => {
    const max = row.scrollWidth - row.clientWidth;
    row.toggleAttribute('data-more-start', row.scrollLeft > 1);
    row.toggleAttribute('data-more-end', row.scrollLeft < max - 1);
  };
  update();
  row.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(row);
}

/**
 * A region that scrolls sideways must be reachable by keyboard so arrow keys
 * can scroll it (WCAG 2.1.1). Only while it actually overflows, though: a tab
 * stop on a box that fits is just one more key press to get past.
 */
export function focusableWhenScrollable(region: HTMLElement): void {
  const update = () => {
    if (region.scrollWidth > region.clientWidth + 1) region.tabIndex = 0;
    else region.removeAttribute('tabindex');
  };
  update();
  new ResizeObserver(update).observe(region);
}
