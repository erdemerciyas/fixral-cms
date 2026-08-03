/**
 * Client instrumentation — optional Sentry.
 * Avoid static/dynamic require of @sentry/nextjs (not installed; Turbopack
 * still resolves the module specifier and fails the build).
 */
export const onRouterTransitionStart = undefined;

export function register() {
  if (process.env.NEXT_RUNTIME === 'browser' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn(
      'Sentry DSN is set but @sentry/nextjs is not wired for client/Turbopack; skipping client instrumentation',
    );
  }
}
