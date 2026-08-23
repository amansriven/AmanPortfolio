/// <reference types="astro/client" />

/**
 * Secrets bound to the Worker, read via `cloudflare:workers`.
 * Never imported from client code — see `src/pages/api/contact.ts`.
 */
declare interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

/**
 * Only the slice of the Workers runtime this project uses.
 *
 * The full `wrangler types` output declares the whole Workers global scope,
 * which collides with DOM types in the client-side scripts — so this stays
 * deliberately narrow.
 */
declare module 'cloudflare:workers' {
  export const env: Env;
}

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Cloudflare Turnstile, loaded on demand by the contact form. */
interface TurnstileRenderOptions {
  sitekey: string;
  execution?: 'render' | 'execute';
  appearance?: 'always' | 'execute' | 'interaction-only';
  theme?: 'auto' | 'light' | 'dark';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'timeout-callback'?: () => void;
}

interface Turnstile {
  render(element: HTMLElement, options: TurnstileRenderOptions): string;
  execute(widgetId: string): void;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

interface Window {
  turnstile?: Turnstile;
}
