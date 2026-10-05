/**
 * Keyboard-modifier naming for shortcut hints. Apple platforms use ⌘;
 * everyone else (Windows, Linux, ChromeOS) uses Ctrl. The shortcuts
 * themselves accept either key; this only decides what the hint says.
 *
 * iPadOS reports itself as a Mac, which is the right answer here too.
 */
const platform =
  (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
  navigator.platform ||
  navigator.userAgent;

export const isApple = /mac|iphone|ipad|ipod/i.test(platform);

/** "⌘" or "Ctrl", for hints like "⌘K" / "Ctrl K". */
export const modKey = isApple ? '⌘' : 'Ctrl';

/** A full shortcut as it should read on this platform: ⌘K / Ctrl+K. */
export const shortcut = (key: string) => (isApple ? `⌘${key}` : `Ctrl+${key}`);
