<script lang="ts">
  interface Props {
    /** Public Turnstile site key. Absent locally until `.dev.vars` is set. */
    siteKey: string;
    /** Fallback shown if the form endpoint is unreachable. */
    email: string;
    /** Shown on the success screen for anything time-sensitive. */
    phone: string;
  }

  let { siteKey, email, phone }: Props = $props();

  type Status = 'idle' | 'submitting' | 'success' | 'error';

  let status = $state<Status>('idle');
  let formError = $state('');
  let values = $state({ name: '', email: '', message: '' });
  let errors = $state<Record<string, string>>({});
  let touched = $state<Record<string, boolean>>({});

  /** Bot trap. Real people never fill a hidden field. */
  let honeypot = $state('');

  let turnstileEl = $state<HTMLDivElement | null>(null);
  let widgetId: string | undefined;
  let resolveToken: ((token: string) => void) | undefined;
  let rejectToken: ((reason: Error) => void) | undefined;

  const MESSAGE_MAX = 4000;

  /** Who the success screen thanks, kept after the fields are cleared. */
  let sent = $state({ name: '', email: '' });

  /** Hands off to the visitor's own mail app, carrying over anything already typed. */
  const mailtoHref = $derived.by(() => {
    const params = new URLSearchParams({ subject: 'Hello from amansriven.com' });
    const body = values.message.trim();
    if (body) params.set('body', body);
    return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`;
  });

  function validateField(field: keyof typeof values, value: string): string {
    const trimmed = value.trim();
    if (field === 'name') {
      if (!trimmed) return 'Please add your name.';
      if (trimmed.length > 100) return 'That name is longer than 100 characters.';
    }
    if (field === 'email') {
      if (!trimmed) return 'Please add an email so I can reply.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return 'That address looks incomplete.';
    }
    if (field === 'message') {
      if (!trimmed) return 'Please add a message.';
      if (trimmed.length > MESSAGE_MAX) return `Please keep it under ${MESSAGE_MAX} characters.`;
    }
    return '';
  }

  function handleBlur(field: keyof typeof values) {
    touched[field] = true;
    errors[field] = validateField(field, values[field]);
  }

  function handleInput(field: keyof typeof values) {
    if (touched[field]) errors[field] = validateField(field, values[field]);
  }

  function validateAll(): boolean {
    const next: Record<string, string> = {};
    for (const field of ['name', 'email', 'message'] as const) {
      const error = validateField(field, values[field]);
      if (error) next[field] = error;
      touched[field] = true;
    }
    errors = next;
    return Object.keys(next).length === 0;
  }

  /* --- Turnstile ------------------------------------------------
     Rendered in `execute` mode with an interaction-only appearance, so
     it stays invisible unless Cloudflare decides a human check is needed. */
  function mountTurnstile() {
    if (!siteKey || !turnstileEl || widgetId !== undefined) return;
    const turnstile = window.turnstile;
    if (!turnstile) return;

    widgetId = turnstile.render(turnstileEl, {
      sitekey: siteKey,
      execution: 'execute',
      appearance: 'interaction-only',
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
      callback: (token: string) => resolveToken?.(token),
      'error-callback': () => rejectToken?.(new Error('Verification failed.')),
      'timeout-callback': () => rejectToken?.(new Error('Verification timed out.')),
    });
  }

  $effect(() => {
    if (!siteKey) return;

    if (window.turnstile) {
      mountTurnstile();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (existing) {
      existing.addEventListener('load', mountTurnstile, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = '';
    script.addEventListener('load', mountTurnstile, { once: true });
    document.head.appendChild(script);
  });

  function getTurnstileToken(): Promise<string> {
    if (!siteKey || widgetId === undefined || !window.turnstile) return Promise.resolve('');

    return new Promise<string>((resolve, reject) => {
      resolveToken = resolve;
      rejectToken = reject;
      window.turnstile!.reset(widgetId!);
      window.turnstile!.execute(widgetId!);
      setTimeout(() => reject(new Error('Verification timed out.')), 20_000);
    });
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (status === 'submitting') return;

    formError = '';
    if (!validateAll()) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }

    status = 'submitting';

    try {
      const token = await getTurnstileToken();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          company: honeypot,
          turnstileToken: token,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok || !result.ok) {
        if (result.fields) errors = { ...errors, ...result.fields };
        throw new Error(result.error || 'Something went wrong sending that.');
      }

      sent = { name: values.name.trim().split(/\s+/)[0], email: values.email.trim() };
      status = 'success';
    } catch (error) {
      status = 'error';
      formError = error instanceof Error ? error.message : 'Something went wrong sending that.';
    }
  }

  function reset() {
    values = { name: '', email: '', message: '' };
    errors = {};
    touched = {};
    formError = '';
    status = 'idle';
  }

  const remaining = $derived(MESSAGE_MAX - values.message.length);
</script>

{#if status === 'success'}
  <div class="sent" role="status" aria-live="polite">
    <p class="sent__mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path
          d="M4 12.5l5.2 5.2L20 7"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </p>
    <h3 class="sent__title">Thanks, {sent.name}. Your message is in.</h3>
    <p class="sent__body">
      It went straight to my inbox, and I'll write back to <strong>{sent.email}</strong> myself. If
      it's time-sensitive, call or text me at <span class="sent__phone">{phone}</span>.
    </p>
    <button class="sent__again" type="button" onclick={reset}>Send another</button>
  </div>
{:else}
  <form class="form" novalidate onsubmit={handleSubmit}>
    <div class="field">
      <label for="contact-name">Name</label>
      <input
        id="contact-name"
        name="name"
        type="text"
        autocomplete="name"
        maxlength="100"
        bind:value={values.name}
        oninput={() => handleInput('name')}
        onblur={() => handleBlur('name')}
        aria-invalid={touched.name && errors.name ? 'true' : undefined}
        aria-describedby={errors.name ? 'error-name' : undefined}
        disabled={status === 'submitting'}
      />
      {#if touched.name && errors.name}
        <p class="field__error" id="error-name">{errors.name}</p>
      {/if}
    </div>

    <div class="field">
      <label for="contact-email">Email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        autocomplete="email"
        maxlength="200"
        bind:value={values.email}
        oninput={() => handleInput('email')}
        onblur={() => handleBlur('email')}
        aria-invalid={touched.email && errors.email ? 'true' : undefined}
        aria-describedby={errors.email ? 'error-email' : undefined}
        disabled={status === 'submitting'}
      />
      {#if touched.email && errors.email}
        <p class="field__error" id="error-email">{errors.email}</p>
      {/if}
    </div>

    <div class="field">
      <div class="field__labelrow">
        <label for="contact-message">Message</label>
        {#if values.message.length > MESSAGE_MAX - 400}
          <span class="field__count mono" aria-live="polite">{remaining} left</span>
        {/if}
      </div>
      <textarea
        id="contact-message"
        name="message"
        rows="5"
        maxlength={MESSAGE_MAX}
        bind:value={values.message}
        oninput={() => handleInput('message')}
        onblur={() => handleBlur('message')}
        aria-invalid={touched.message && errors.message ? 'true' : undefined}
        aria-describedby={errors.message ? 'error-message' : undefined}
        disabled={status === 'submitting'}></textarea>
      {#if touched.message && errors.message}
        <p class="field__error" id="error-message">{errors.message}</p>
      {/if}
    </div>

    <!-- Honeypot: visually and programmatically hidden from real users. -->
    <div class="honeypot" aria-hidden="true">
      <label for="contact-company">Company</label>
      <input
        id="contact-company"
        name="company"
        type="text"
        tabindex="-1"
        autocomplete="off"
        bind:value={honeypot}
      />
    </div>

    <div bind:this={turnstileEl} class="turnstile"></div>

    <div class="form__foot">
      <button class="submit" type="submit" disabled={status === 'submitting'}>
        <span>{status === 'submitting' ? 'Sending' : 'Send message'}</span>
        {#if status === 'submitting'}
          <span class="spinner" aria-hidden="true"></span>
        {:else}
          <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
            <path
              d="M2 7h10M12 7l-4-4M12 7l-4 4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </button>

      <a class="mailapp" href={mailtoHref}>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <path
            d="m4 7 8 6 8-6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Open in my mail app
      </a>

      {#if status === 'error'}
        <p class="form__error" role="alert">
          {formError} You can also email me at <a href="mailto:{email}">{email}</a>.
        </p>
      {/if}
    </div>
  </form>
{/if}

<style>
  .form {
    display: grid;
    gap: var(--space-6);
  }

  /* --- Fields --------------------------------------------------- */
  .field {
    display: grid;
    gap: var(--space-2);
  }

  .field__labelrow {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
  }

  label {
    font-family: var(--font-mono);
    font-size: var(--fs-micro);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--text-muted);
  }

  input,
  textarea {
    width: 100%;
    padding: var(--space-3);
    font-size: var(--fs-body);
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    transition:
      border-color var(--dur) var(--ease-out),
      background-color var(--dur) var(--ease-out);
  }

  textarea {
    resize: vertical;
    min-height: 7rem;
    line-height: 1.6;
  }

  input:hover,
  textarea:hover {
    border-bottom-color: var(--border-bright);
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-bottom-color: var(--accent);
  }

  /* Keep the visible focus ring for keyboard users. */
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }

  input[aria-invalid='true'],
  textarea[aria-invalid='true'] {
    border-bottom-color: var(--danger);
  }

  input:disabled,
  textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .field__error {
    font-size: var(--fs-xs);
    color: var(--danger);
  }

  .field__count {
    font-size: var(--fs-micro);
    color: var(--text-faint);
  }

  .honeypot {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .turnstile:not(:empty) {
    margin-top: calc(-1 * var(--space-2));
  }

  /* --- Submit ---------------------------------------------------- */
  .form__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
  }

  .mailapp {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0.8rem 1.25rem;
    font-size: var(--fs-sm);
    font-weight: 500;
    color: var(--text-secondary);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-full);
    transition:
      color var(--dur) var(--ease-out),
      border-color var(--dur) var(--ease-out),
      transform var(--dur) var(--ease-out);
  }

  .mailapp:hover {
    color: var(--accent);
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .submit {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0.8rem 1.5rem;
    font-size: var(--fs-sm);
    font-weight: 500;
    color: var(--on-accent);
    background: var(--accent-fill);
    border-radius: var(--radius-full);
    transition:
      background-color var(--dur) var(--ease-out),
      opacity var(--dur) var(--ease-out),
      transform var(--dur) var(--ease-out);
  }

  .submit:hover:not(:disabled) {
    background: var(--accent-fill-hover);
    transform: translateY(-1px);
  }

  .submit:hover:not(:disabled) svg {
    transform: translateX(3px);
  }

  .submit svg {
    transition: transform var(--dur) var(--ease-out);
  }

  .submit:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }

  .form__error {
    flex-basis: 100%;
    font-size: var(--fs-xs);
    color: var(--danger);
  }

  .form__error a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* --- Success --------------------------------------------------- */
  .sent {
    display: grid;
    gap: var(--space-3);
    justify-items: start;
    padding-block: var(--space-6);
    animation: sent-in var(--dur-slow) var(--ease-out);
  }

  @keyframes sent-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  .sent__mark {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    color: var(--success);
    border: 1px solid color-mix(in srgb, var(--success) 40%, transparent);
    border-radius: 50%;
  }

  .sent__title {
    font-size: var(--fs-h3);
    font-weight: 500;
    letter-spacing: var(--tracking-tight);
  }

  .sent__body {
    max-width: 32rem;
    color: var(--text-secondary);
    font-size: var(--fs-sm);
  }

  .sent__body strong,
  .sent__phone {
    color: var(--text);
    font-weight: 500;
    white-space: nowrap;
  }

  .sent__again {
    margin-top: var(--space-2);
    padding-block: var(--space-1);
    font-size: var(--fs-xs);
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-strong);
    transition: color var(--dur) var(--ease-out);
  }

  .sent__again:hover {
    color: var(--text);
  }

  @media (prefers-reduced-motion: reduce) {
    .sent {
      animation: none;
    }
    .spinner {
      animation-duration: 2s;
    }
  }
</style>
