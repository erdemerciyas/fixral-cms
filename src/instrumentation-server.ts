// Sentry is optional - only import if available
let Sentry: any = null;

function loadSentry() {
  try {
    const moduleName = '@sentry/nextjs';
    return eval('require')(moduleName);
  } catch {
    return null;
  }
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry = loadSentry();
  if (!Sentry) {
    console.warn('Sentry not installed, skipping server instrumentation');
  }
} else {
  console.warn('Sentry not installed, skipping Sentry configuration');
}

/**
 * Ensure SiteSettings has default values on startup
 */
async function initializeSiteSettings() {
  try {
    const SiteSettings = (await import('./models/SiteSettings')).default;
    const connectDB = (await import('./lib/mongoose')).default;

    await connectDB();
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

  if (process.env.NEXT_RUNTIME === 'nodejs' && Sentry) {
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
    const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown';

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      release: SENTRY_RELEASE,
      
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      
      beforeSend(event: any, hint: any) {
        const error = hint.originalException;
        
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message).toLowerCase();
          
          if (
            SENTRY_ENVIRONMENT === 'development' &&
            (message.includes('db_disabled') || message.includes('mongodb'))
          ) {
            return null;
          }
          
          if (
            message.includes('validation failed') ||
            message.includes('cast to objectid failed') ||
            message.includes('duplicate key error')
          ) {
            return null;
          }
        }
        
        return event;
      },
      
      integrations: [
        Sentry.httpIntegration(),
      ],
      
      debug: SENTRY_ENVIRONMENT === 'development',
      
      initialScope: {
        tags: {
          component: 'server'
        }
      }
    });
  }
}
