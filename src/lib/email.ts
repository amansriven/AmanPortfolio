/**
 * The contact form's email check, shared by the form and the API route so they
 * always agree. It is the HTML spec's `type="email"` pattern plus a letters-only
 * top-level domain, which is close to what Resend accepts for `reply_to`: a
 * stray character like a trailing backtick fails here, with a field error,
 * instead of being rejected by Resend after the visitor presses send.
 */
export const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
