/**
 * Reveals `[data-reveal]` elements as they scroll into view.
 *
 * Deliberately tiny: no animation library, no scroll listener. Users who
 * prefer reduced motion never enter the observer path, and the CSS keeps
 * elements fully visible for them.
 */
export function initReveal(): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  elements.forEach((el) => observer.observe(el));
}
