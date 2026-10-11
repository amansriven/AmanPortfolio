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

/* --- Viewfinder cursor ------------------------------------------------ */

const TARGETS = 'a[href], button, [role="button"], summary, label[for], select';
const RETICLE = 26;
const FRAME_PAD = 6;

/**
 * Four corner brackets, like the ones round the portrait, that trail the
 * pointer and frame whatever link or button it rests on (`.cursor`,
 * base.css). The native cursor stays: this only decorates it. Skipped on
 * touch and for reduced motion.
 */
export function initCursor(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<i></i><i></i><i></i><i></i>';
  document.body.append(el);

  const px = { x: -100, y: -100 };
  const box = { x: -100, y: -100, w: RETICLE, h: RETICLE };
  let target: Element | null = null;
  let frame = 0;

  const goal = () => {
    const rect = target?.getBoundingClientRect();
    // Frame the element unless it's gone or too big to read as one control.
    if (rect && rect.width && rect.width < innerWidth * 0.7 && rect.height < innerHeight * 0.7) {
      return {
        x: rect.left - FRAME_PAD,
        y: rect.top - FRAME_PAD,
        w: rect.width + FRAME_PAD * 2,
        h: rect.height + FRAME_PAD * 2,
      };
    }
    return { x: px.x - RETICLE / 2, y: px.y - RETICLE / 2, w: RETICLE, h: RETICLE };
  };

  const tick = () => {
    const g = goal();
    let moving = false;
    for (const k of ['x', 'y', 'w', 'h'] as const) {
      const d = g[k] - box[k];
      box[k] = Math.abs(d) < 0.1 ? g[k] : box[k] + d * 0.22;
      if (box[k] !== g[k]) moving = true;
    }
    el.style.transform = `translate(${box.x}px, ${box.y}px)`;
    el.style.width = `${box.w}px`;
    el.style.height = `${box.h}px`;
    // Idle when settled; pointer moves and scrolls start it again.
    frame = moving ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      px.x = event.clientX;
      px.y = event.clientY;
      const over = (event.target as Element).closest?.(TARGETS) ?? null;
      el.classList.toggle('is-framing', !!over);
      target = over;
      // Under an open modal, or over a text field, the reticle only gets in the way.
      const hidden =
        !!document.querySelector('dialog[open]') ||
        !!(event.target as Element).closest?.('input, textarea, [contenteditable]');
      el.classList.toggle('is-visible', !hidden);
      wake();
    },
    { passive: true },
  );
  document.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => el.classList.remove('is-pressed'));
  document.documentElement.addEventListener('pointerleave', () =>
    el.classList.remove('is-visible'),
  );
  window.addEventListener('scroll', wake, { passive: true });
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
