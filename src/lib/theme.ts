/**
 * Light / dark theme switching.
 *
 * The initial theme is set by an inline script in BaseLayout's <head> before
 * the first paint (saved choice, else the system preference), so pages never
 * flash the wrong colours. This module handles switching afterwards.
 */

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/** Browser UI colour (mobile address bar etc.): each theme's --bg. */
const THEME_COLOR: Record<Theme, string> = { light: '#faf8f5', dark: '#1b1617' };

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLOR[theme]));
}

/**
 * Switches theme and remembers the choice. The new theme spreads out in a
 * circle from `origin` (the toggle) where View Transitions are supported, and
 * cross-fades elsewhere. Reduced-motion users get an instant switch.
 */
export async function toggleTheme(origin?: HTMLElement | null): Promise<void> {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage: the switch still works for this page.
  }

  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(next);
    return;
  }

  if (!document.startViewTransition) {
    root.classList.add('theme-fade');
    applyTheme(next);
    window.setTimeout(() => root.classList.remove('theme-fade'), 350);
    return;
  }

  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : 0;
  // Far enough to cover the farthest corner of the viewport.
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  root.style.setProperty('--theme-x', `${x}px`);
  root.style.setProperty('--theme-y', `${y}px`);
  root.style.setProperty('--theme-r', `${radius}px`);

  root.classList.add('theme-switching');
  try {
    await document.startViewTransition(() => applyTheme(next)).finished;
  } finally {
    root.classList.remove('theme-switching');
  }
}
