/**
 * Server instrumentation — SiteSettings bootstrap + optional Sentry.
 * Avoid eval/require of @sentry/nextjs (not installed; breaks Turbopack).
 */

/**
 * Ensure SiteSettings has default values on startup
 */
async function initializeSiteSettings() {
  try {
    const SiteSettings = (await import('./models/SiteSettings')).default;

    await SiteSettings.getSiteSettings();
    console.log('✓ SiteSettings initialized');
  } catch (error) {
    console.error('Failed to initialize site settings:', error);
  }
}

export function register() {
  initializeSiteSettings().catch((error) => {
    console.error('Failed to initialize site settings:', error);
  });

  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn(
      'Sentry DSN is set but @sentry/nextjs is not wired for server/Turbopack; skipping server instrumentation',
    );
  }
}
