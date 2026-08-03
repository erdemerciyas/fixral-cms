import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Barlow } from 'next/font/google'
import './globals.css'
import { config } from '../core/lib/config'
import Header from '../components/Header'
import MotionProvider from '../components/MotionProvider'
import ConditionalFooter from '../components/ConditionalFooter'
import Providers from '../components/Providers'
import { hasDatabaseUrl } from '../lib/prisma'
import { getCachedSiteSettings } from '../lib/site-settings'
import Script from 'next/script'
import { headers } from 'next/headers'
import GlobalBreadcrumbsJsonLd from '../components/seo/GlobalBreadcrumbsJsonLd';
import PageTransitionWrapper from '../components/PageTransitionWrapper';
import GrainOverlay from '../components/ui/GrainOverlay';

const ENV_GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION
const ENV_GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ENV_GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

const geistSans = GeistSans
const geistMono = GeistMono

/* Public tema (light/dark) blocking init — ThemeScope hydrate olmadan önce
 * <html>'e `public-theme` (+ dark ise `public-dark`) yazar. Admin route'ları
 * next-themes'e bırakılır. Anahtar: localStorage['fixral-public-theme'] */
/* FOUC + hydrate-sonrası yeniden uygulama. React <html> hydrate'i classList'i
   temizleyebilir; bu yüzden load/DOMContentLoaded'da tekrar yazarız. */
const PUBLIC_THEME_INIT_SCRIPT = `try{if(!location.pathname.startsWith('/admin')){(function(){function a(){var t=localStorage.getItem('fixral-public-theme');var d=document.documentElement;d.classList.add('public-theme');if(t==='dark'){d.classList.add('public-dark');d.style.colorScheme='dark'}else{d.classList.remove('public-dark');d.style.colorScheme='light'}}a();document.addEventListener('DOMContentLoaded',a);window.addEventListener('load',a);setTimeout(a,0);setTimeout(a,50);setTimeout(a,200)})()}}catch(e){}`

/* Kurumsal ana yazı tipi — Thingiverse mantığı: tek sans (Barlow) her yerde */
const barlow = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    if (!hasDatabaseUrl()) {
      throw new Error('DB_DISABLED');
    }
    const siteSettings = await getCachedSiteSettings();
    const seoConfig = siteSettings.seoConfig || {};
    const analyticsConfig = siteSettings.analyticsConfig || {};

    let title = siteSettings.siteName || 'Fixral CMS';
    let description = siteSettings.slogan || siteSettings.description || 'Kişisel blog ve portfolyo sitesi';
    let keywords = siteSettings.seo?.keywords || [];

    if (seoConfig.metaTitleSuffix && siteSettings.siteName) {
      title = `${siteSettings.siteName}${seoConfig.metaTitleSuffix}`;
    }
    if (seoConfig.globalMetaDescription) {
      description = seoConfig.globalMetaDescription;
    }
    if (seoConfig.globalKeywords && Array.isArray(seoConfig.globalKeywords)) {
      keywords = [...keywords, ...seoConfig.globalKeywords];
    }

    if (!seoConfig.metaTitleSuffix) {
      if (siteSettings.seo?.metaTitle) title = siteSettings.seo.metaTitle;
      if (siteSettings.seo?.metaDescription) description = siteSettings.seo.metaDescription;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fixral.com';
    const logoUrl = typeof siteSettings.logo === 'string' ? siteSettings.logo : siteSettings.logo?.url;
    const googleVerification = analyticsConfig.googleSiteVerification || siteSettings?.analytics?.googleSiteVerification || ENV_GOOGLE_VERIFICATION;

    return {
      title: title,
      description: description,
      keywords: keywords,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: title,
        description: description,
        url: baseUrl,
        siteName: siteSettings.siteName,
        locale: 'tr_TR',
        alternateLocale: ['es_ES'],
        type: 'website',
        images: [
          {
            url: siteSettings.logo?.url || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [siteSettings.logo?.url || '/og-image.jpg'],
      },
      verification: {
        google: googleVerification || undefined,
      },
      alternates: {
        languages: {
          'tr-TR': `${baseUrl}/tr`,
          'es-ES': `${baseUrl}/es`,
          'x-default': baseUrl,
        },
      },
      icons: {
        icon: siteSettings.favicon || logoUrl || '/favicon.svg',
        apple: siteSettings.favicon || logoUrl || '/favicon.svg',
      },
      other: {
        'apple-mobile-web-app-title': title,
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: config.app.name,
      description: 'Modern kişisel blog ve portfolio sitesi',
      icons: {
        icon: '/favicon.svg',
        apple: '/favicon.svg',
      },
      metadataBase: new URL(config.app.url || 'http://localhost:3000'),
    };
  }
}

import ThemeScope from '../components/providers/ThemeScope';
import { LoadingBar } from '../components';
import PublicToaster from '../components/PublicToaster';
import { ConfirmProvider } from '../hooks/use-confirm';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let gaId: string | undefined;
  let gtmId: string | undefined;
  let siteName = config.app.name;
  let siteUrl = config.app.url;

  if (hasDatabaseUrl()) {
    try {
      const siteSettings = await getCachedSiteSettings();
      siteName = siteSettings.siteName || config.app.name;
      siteUrl = siteSettings.siteUrl || config.app.url;

      const analyticsConfig = siteSettings.analyticsConfig;
      if (analyticsConfig && analyticsConfig.enablePageViewTracking) {
        gaId = analyticsConfig.googleAnalyticsId || undefined;
        gtmId = analyticsConfig.googleTagManagerId || undefined;
      }

      if (!gaId && !gtmId && siteSettings?.analytics?.enableAnalytics) {
        gaId = siteSettings.analytics.googleAnalyticsId || undefined;
        gtmId = siteSettings.analytics.googleTagManagerId || undefined;
      }
    } catch (e) {
      console.error('Layout settings load error:', e);
    }
  }

  if (!gaId) gaId = ENV_GA_ID || undefined;
  if (!gtmId) gtmId = ENV_GTM_ID || undefined;

  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'tr';

  return (
    // html className yok: React hydrate FOUC/ThemeScope public-theme sınıflarını ezerdi.
    // scroll-smooth body'de.
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* FOUC önleme: public tema sınıfları CSS'ten önce, senkron yazılır */}
        <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_INIT_SCRIPT }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#FA6831" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="manifest" href="/manifest.json" />

        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteName,
              url: siteUrl,
              logo: `${siteUrl}/favicon.svg`,
              sameAs: [
                'https://www.linkedin.com',
                'https://github.com/erdemerciyas'
              ]
            })
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteName,
              url: siteUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        {gtmId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-gtag-init" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${barlow.variable} font-sans min-h-screen bg-page-bg flex flex-col text-foreground antialiased scroll-smooth`}>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              title="Google Tag Manager"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10000 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-sm focus:border focus:border-border" aria-label="Skip to main content">
          Skip to content
        </a>
        <ThemeScope />
        <ConfirmProvider>
          <LoadingBar />
          <Providers>
            <MotionProvider>
              <Header />
              <GlobalBreadcrumbsJsonLd />
              <PageTransitionWrapper>
                <div className="relative grow">
                  <main id="main-content" className="relative">
                    <div>{children}</div>
                  </main>
                </div>
              </PageTransitionWrapper>

              <ConditionalFooter />
              <GrainOverlay />
            </MotionProvider>
          </Providers>
          <PublicToaster />
        </ConfirmProvider>

        {config.isDevelopment && (
          <div id="dev-tools" className="hidden md:block fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white p-2 rounded text-xs">
              <div>ENV: {config.nodeEnv}</div>
              <div>Cloudinary: {config.cloudinary.isConfigured ? '✅' : '❌'}</div>
              <div>OpenAI: {config.openai.isConfigured ? '✅' : '❌'}</div>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}
