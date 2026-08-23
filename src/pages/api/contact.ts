import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 4000;
const NAME_MAX = 100;
const EMAIL_MAX = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
  turnstileToken?: unknown;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

function asString(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Escapes untrusted input before it goes anywhere near an HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Rejects header-injection attempts in anything used as a header value. */
function hasHeaderInjection(value: string): boolean {
  return /[\r\n]/.test(value);
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!env?.RESEND_API_KEY || !env?.TURNSTILE_SECRET_KEY) {
    console.error('contact: missing RESEND_API_KEY or TURNSTILE_SECRET_KEY binding');
    return json({ ok: false, error: 'The contact form is not configured right now.' }, 500);
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ ok: false, error: 'Unsupported content type.' }, 415);
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return json({ ok: false, error: 'Could not read that request.' }, 400);
  }

  // Honeypot. Accept silently so a bot learns nothing from the response.
  if (asString(payload.company, 200)) {
    return json({ ok: true });
  }

  const name = asString(payload.name, NAME_MAX);
  const email = asString(payload.email, EMAIL_MAX);
  const message = asString(payload.message, MESSAGE_MAX + 1);

  const fields: Record<string, string> = {};
  if (!name) fields.name = 'Please add your name.';
  if (!email) fields.email = 'Please add an email so I can reply.';
  else if (!EMAIL_PATTERN.test(email)) fields.email = 'That address looks incomplete.';
  if (!message) fields.message = 'Please add a message.';
  else if (message.length < MESSAGE_MIN) fields.message = 'That message is too short.';
  else if (message.length > MESSAGE_MAX) fields.message = 'That message is too long.';
  if (hasHeaderInjection(name) || hasHeaderInjection(email)) {
    fields.email = 'That input is not valid.';
  }

  if (Object.keys(fields).length > 0) {
    return json({ ok: false, error: 'Please check the highlighted fields.', fields }, 400);
  }

  const token = asString(payload.turnstileToken, 4096);
  if (!token) {
    return json({ ok: false, error: 'Verification is still loading. Please try again.' }, 400);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? clientAddress ?? null;
  const verified = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);
  if (!verified) {
    return json({ ok: false, error: 'Verification failed. Please try again.' }, 403);
  }

  const to = env.CONTACT_TO_EMAIL || 'sriven.aman@gmail.com';
  const from = env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `amansriven.com — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#111">
          <p style="margin:0 0 4px;font-size:13px;color:#666">New message from amansriven.com</p>
          <p style="margin:0 0 16px;font-size:15px">
            <strong>${escapeHtml(name)}</strong>
            &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;
          </p>
          <div style="padding:16px;background:#f6f6f6;border-radius:8px;white-space:pre-wrap;font-size:15px">${escapeHtml(message)}</div>
        </div>
      `,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text().catch(() => '');
    console.error('contact: resend failed', resendResponse.status, detail);
    return json(
      { ok: false, error: 'The message could not be sent. Please email me directly.' },
      502,
    );
  }

  return json({ ok: true });
};

/** Anything other than POST on this route is a mistake worth stating plainly. */
export const ALL: APIRoute = () => json({ ok: false, error: 'Method not allowed.' }, 405);
