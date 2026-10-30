import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Barlow, Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { config } from '../core/lib/config'
import Header from '../components/Header'
import MotionProvider from '../components/MotionProvider'
import ConditionalFooter from '../components/ConditionalFooter'
import Providers from '../components/Providers'
import { hasDatabaseUrl } from '../lib/prisma'
import { getCachedSiteSettings } from '../lib/site-settings'
import { SITE_URL } from '../lib/seo-utils'
import Script from 'next/script'
import PageTransitionWrapper from '../components/PageTransitionWrapper';

const ENV_GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION
const ENV_GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ENV_GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

const geistSans = GeistSans
const geistMono = GeistMono

/* Public tema (light/dark) blocking init — varsayılan KOYU (marka sistemi, redesign 2026);
 * yalnızca kullanıcı açık temayı seçtiyse ('light') açık uygulanır. */
/* Public tema (light/dark) blocking init — ThemeScope hydrate olmadan önce
 * <html>'e `public-theme` (+ dark ise `public-dark`) yazar. Admin route'ları
 * aşağıdaki ADMIN_THEME_INIT_SCRIPT'e bırakılır. Anahtar: localStorage['fixral-public-theme'] */
/* FOUC + hydrate-sonrası yeniden uygulama. React <html> hydrate'i classList'i
   temizleyebilir; bu yüzden load/DOMContentLoaded'da tekrar yazarız. */
const PUBLIC_THEME_INIT_SCRIPT = `try{if(!location.pathname.startsWith('/admin')){(function(){function a(){var t=localStorage.getItem('fixral-public-theme');var d=document.documentElement;d.classList.add('public-theme');if(t!=='light'){d.classList.add('public-dark');d.style.colorScheme='dark'}else{d.classList.remove('public-dark');d.style.colorScheme='light'}}a();document.addEventListener('DOMContentLoaded',a);window.addEventListener('load',a);setTimeout(a,0);setTimeout(a,50);setTimeout(a,200)})()}}catch(e){}`

/* Admin tema (light/dark/system) blocking init — AdminThemeProvider hydrate
 * olmadan önce <html>'e `dark`/`light` sınıfını yazar (FOUC önleme).
 * next-themes'in React ağacı içi script'i React 19'da console error
 * ürettiği için script burada, server-render <head>'de tutulur.
 * Anahtar: localStorage['fixral-admin-theme'] */
const ADMIN_THEME_INIT_SCRIPT = `try{if(location.pathname.startsWith('/admin')){(function(){function a(){var d=document.documentElement,c=d.classList,t=localStorage.getItem('fixral-admin-theme');c.remove('light','dark');if(!t||t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}c.add(t);d.style.colorScheme=t}a();document.addEventListener('DOMContentLoaded',a);window.addEventListener('load',a)})()}}catch(e){}`

/* Kurumsal ana yazı tipi — Thingiverse mantığı: tek sans (Barlow) her yerde */
const barlow = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

/* Public site marka yazı tipleri (FIXRAL marka sistemi): Inter gövde,
 * Space Grotesk başlık, JetBrains Mono teknik etiket. Değişkenler globals.css
 * .public-theme içinde --font-ui-* üzerinden kullanılır; admin Barlow'da kalır. */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-inter-ui',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
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

    const baseUrl = SITE_URL;
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
        url: `${baseUrl}/tr`,
        siteName: siteSettings.siteName,
        locale: 'tr_TR',
        type: 'website',
        images: [
          {
            url: '/og-image.jpg',
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
        images: ['/og-image.jpg'],
      },
      verification: {
        google: googleVerification || undefined,
      },
      alternates: {
        languages: {
          'tr-TR': `${baseUrl}/tr`,
          'x-default': `${baseUrl}/tr`,
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
      metadataBase: new URL(SITE_URL),
    };
  }
}

import ThemeScope from '../components/providers/ThemeScope';
import { LoadingBar } from '../components';
import PublicToaster from '../components/PublicToaster';
import { ConfirmProvider } from '../hooks/use-confirm';
import { FxDataProvider } from '../components/fx/FxData';
import { getFxData } from '../lib/fx-data-server';
import { defaultFxData } from '../content/fx-data';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let gaId: string | undefined;
  let gtmId: string | undefined;
  let siteName = config.app.name;
  let sameAs: string[] = [];

  if (hasDatabaseUrl()) {
    try {
      const siteSettings = await getCachedSiteSettings();
      siteName = siteSettings.siteName || config.app.name;
      sameAs = Object.values(siteSettings.socialMedia || {}).filter(
        (u): u is string => typeof u === 'string' && /^https?:\/\/[^/]+\/.+/.test(u)
      );

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

  /* FIXRAL site verisi (panel + varsayılan) — Header, Footer ve tüm sayfalar paylaşır */
  let fxData = defaultFxData();
  try {
    fxData = await getFxData();
  } catch (e) {
    console.error('FX data load error:', e);
  }

  return (
    // html className yok: React hydrate FOUC/ThemeScope public-theme sınıflarını ezerdi.
    // scroll-smooth body'de. Tek dil (tr): headers() okunmaz, aksi halde tüm rotalar dinamikleşir (ISR kapanır).
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* FOUC önleme: public tema sınıfları CSS'ten önce, senkron yazılır */}
        <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_INIT_SCRIPT }} />
        {/* Admin tema FOUC koruması (admin route'larında çalışır) */}
        <script dangerouslySetInnerHTML={{ __html: ADMIN_THEME_INIT_SCRIPT }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#101828" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="manifest" href="/manifest.json" />

        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />

        <link rel="preconnect" href="https://res.cloudinary.com" />

        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        <link rel="dns-prefetch" href="//res.cloudinary.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteName,
              url: `${SITE_URL}/tr`,
              logo: `${SITE_URL}/logo.png`,
              ...(sameAs.length > 0 && { sameAs }),
            }).replace(/</g, '\\u003c')
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteName,
              url: `${SITE_URL}/tr`,
            }).replace(/</g, '\\u003c')
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${barlow.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-page-bg flex flex-col text-foreground antialiased scroll-smooth`}>
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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10000 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-[var(--radius-button)] focus:border focus:border-border focus:outline-2 focus:outline-offset-2 focus:outline-ring" aria-label="Skip to main content">
          Skip to content
        </a>
        <ThemeScope />
        <FxDataProvider data={fxData}>
        <ConfirmProvider>
          <LoadingBar />
          <Providers>
            <MotionProvider>
              <Header />
              <PageTransitionWrapper>
                <div className="relative grow">
                  <main id="main-content" className="relative">
                    <div>{children}</div>
                  </main>
                </div>
              </PageTransitionWrapper>

              <ConditionalFooter />
            </MotionProvider>
          </Providers>
          <PublicToaster />
        </ConfirmProvider>
        </FxDataProvider>

        {config.isDevelopment && (
          <div id="dev-tools" className="hidden md:block fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-card text-foreground border border-border p-2 rounded text-xs">
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
