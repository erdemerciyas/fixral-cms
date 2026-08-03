/**
 * Edge instrumentation — optional Sentry.
 * Turbopack Edge Runtime forbids eval/dynamic require, so we never load
 * @sentry/nextjs here unless it is an explicit static dependency.
 * Package is currently not installed; this remains a safe no-op.
 */
export function register() {
  if (process.env.NEXT_RUNTIME === 'edge' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn(
      'Sentry DSN is set but @sentry/nextjs is not wired for Edge/Turbopack; skipping edge instrumentation',
    );
  }
}
