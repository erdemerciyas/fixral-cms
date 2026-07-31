'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Mail as Envelope, Phone, MapPin, ArrowUp } from 'lucide-react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MeasureRule } from '@/components/ui';
import {
  LinkedinLogo,
  TwitterLogo,
  InstagramLogo,
  FacebookLogo,
  GithubLogo,
  YoutubeLogo,
} from '@/components/icons/social';

const Version = dynamic(() => import('./Version'), {
  ssr: false,
  loading: () => <span aria-hidden className="inline-block h-5" />,
});

interface FooterSettings {
  mainDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  quickLinks: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    github: string;
    youtube: string;
  };
  copyrightInfo: {
    companyName: string;
    year: number;
    additionalText: string;
  };
  developerInfo: {
    name: string;
    website: string;
    companyName: string;
  };
  visibility: {
    showQuickLinks: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    showDeveloperInfo: boolean;
  };
}

interface SiteSettingsMinimal {
  siteName: string;
  logo?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: LinkedinLogo,
  twitter: TwitterLogo,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  github: GithubLogo,
  youtube: YoutubeLogo,
};

const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<SiteSettingsMinimal | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { t, locale } = useAppTranslations('footer');
  const prefersReducedMotion = useReducedMotion();

  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch('/api/public/footer-settings');
        if (response.ok) {
          const data = await response.json();
          if (data && data.quickLinks) {
            data.quickLinks = data.quickLinks.map((link: any) => ({
              ...link,
              url:
                link.isExternal ||
                link.url.startsWith('http') ||
                link.url.startsWith('/')
                  ? link.url
                  : `/${link.url}`,
            }));
          }
          setSettings(data);
        }
      } catch (error) {
        console.error('Footer settings fetch error:', error);
        setSettings({
          mainDescription:
            'Mühendislik ve teknoloji alanında yenilikçi çözümler sunarak projelerinizi hayata geçiriyoruz.',
          contactInfo: {
            email: 'erdem.erciyas@gmail.com',
            phone: '+90 (500) 123 45 67',
            address: 'Teknoloji Vadisi, Ankara, Türkiye',
          },
          quickLinks: [
            { title: 'Anasayfa', url: '/', isExternal: false },
            { title: 'Hizmetler', url: '/services', isExternal: false },
            { title: 'Projeler', url: '/portfolio', isExternal: false },
            { title: 'İletişim', url: '/contact', isExternal: false },
          ].map((link) => ({
            ...link,
            url:
              link.isExternal || link.url.startsWith('/')
                ? link.url
                : `/${link.url}`,
          })),
          socialLinks: {
            linkedin: '',
            twitter: '',
            instagram: '',
            facebook: '',
            github: '',
            youtube: '',
          },
          copyrightInfo: {
            companyName: 'FIXRAL',
            year: new Date().getFullYear(),
            additionalText: 'Tüm Hakları Saklıdır.',
          },
          developerInfo: {
            name: 'Erdem Erciyas',
            website: 'https://www.erdemerciyas.com.tr',
            companyName: 'Erciyas Engineering',
          },
          visibility: {
            showQuickLinks: true,
            showSocialLinks: true,
            showContactInfo: true,
            showDeveloperInfo: true,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isAdminPage) {
      fetchFooterSettings();
    } else {
      setLoading(false);
    }
  }, [isAdminPage]);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch('/api/public/settings', {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setSite({
            siteName: data?.siteName || '',
            logo: {
              url:
                typeof data?.logo === 'string'
                  ? data.logo
                  : data?.logo?.url || '',
              alt: 'Logo',
              width: 200,
              height: 60,
            },
          });
        }
      } catch {
        setSite(null);
      }
    };

    if (!isAdminPage) fetchSiteSettings();
  }, [isAdminPage]);

  if (isAdminPage || loading || !settings) {
    return null;
  }

  const socialEntries = [
    { key: 'linkedin', label: 'LinkedIn', url: settings.socialLinks.linkedin },
    { key: 'twitter', label: 'Twitter', url: settings.socialLinks.twitter },
    {
      key: 'instagram',
      label: 'Instagram',
      url: settings.socialLinks.instagram,
    },
    { key: 'facebook', label: 'Facebook', url: settings.socialLinks.facebook },
    { key: 'github', label: 'GitHub', url: settings.socialLinks.github },
    { key: 'youtube', label: 'YouTube', url: settings.socialLinks.youtube },
  ].filter((item) => item.url && item.url.trim().length > 0);

  // Split quick links into two columns
  const quickLinksHalf = settings.quickLinks.slice(
    0,
    Math.ceil(settings.quickLinks.length / 2)
  );
  const quickLinksSecondHalf = settings.quickLinks.slice(
    Math.ceil(settings.quickLinks.length / 2)
  );

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  const renderLink = (link: { title: string; url: string; isExternal: boolean }, index: number) => {
    const linkUrl =
      link.isExternal || link.url.startsWith('http')
        ? link.url
        : link.url.startsWith(`/${locale}`)
          ? link.url
          : `/${locale}${link.url.startsWith('/') ? link.url : `/${link.url}`}`;

    const sharedClasses =
      'text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-block py-0.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xs';

    return (
      <li key={index}>
        {link.isExternal ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={sharedClasses}
          >
            {link.title}
          </a>
        ) : (
          <Link href={linkUrl} className={sharedClasses}>
            {link.title}
          </Link>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Always-dark footer: public-theme public-dark scope'u ile her iki temada grafit zemin */}
      <footer
        className="public-theme public-dark relative overflow-hidden bg-background text-foreground border-t border-border"
        role="contentinfo"
      >
        {/* Hairline üst bandı — precision ruler */}
        <div className="container-boxed pt-8">
          <MeasureRule ticks="sparse" />
        </div>

        {/* ── Main grid: 4 columns ── */}
        <div className="container-boxed pt-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Logo + Description + Social */}
            <section aria-labelledby="footer-about" className="lg:col-span-1">
              <h2 id="footer-about" className="sr-only">
                {t('aboutTitle')}
              </h2>

              {/* Logo & site name */}
              <div className="mb-4 flex items-center gap-3">
                {site?.logo?.url && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-card border border-border">
                    <Image
                      src={site.logo.url}
                      alt={site.logo.alt}
                      fill
                      className="object-contain p-1"
                      sizes="40px"
                      priority={false}
                    />
                  </div>
                )}
                {site?.siteName && (
                  <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                    {site.siteName}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {settings.mainDescription}
              </p>

              {/* Social icons — düz ikon satırı, kart arkaplanı yok */}
              {settings.visibility.showSocialLinks && socialEntries.length > 0 && (
                <nav aria-label="Social media" className="mt-6 flex items-center gap-4">
                  {socialEntries.map((item) => {
                    const IconComp = socialIconMap[item.key];
                    return (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="text-muted-foreground hover:text-primary transition-colors duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                      >
                        {IconComp && <IconComp className="h-5 w-5" />}
                      </a>
                    );
                  })}
                </nav>
              )}
            </section>

            {/* Column 2: Quick Links (first half) */}
            {settings.visibility.showQuickLinks && quickLinksHalf.length > 0 && (
              <nav aria-label="Footer navigation">
                <h3 className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t('quickLinks')}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {quickLinksHalf.map(renderLink)}
                </ul>
              </nav>
            )}

            {/* Column 3: Quick Links (second half) or Services */}
            {settings.visibility.showQuickLinks && quickLinksSecondHalf.length > 0 && (
              <nav aria-label="Footer services">
                <h3 className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t('services', { defaultValue: 'Hizmetler' })}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {quickLinksSecondHalf.map(renderLink)}
                </ul>
              </nav>
            )}

            {/* Column 4: Contact Info */}
            {settings.visibility.showContactInfo && (
              <section aria-labelledby="footer-contact">
                <h3
                  id="footer-contact"
                  className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {t('contactTitle', { defaultValue: 'İletişim' })}
                </h3>
                <div className="flex flex-col gap-3">
                  {settings.contactInfo.email && (
                    <a
                      href={`mailto:${settings.contactInfo.email}`}
                      className="group inline-flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      <Envelope className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span>{settings.contactInfo.email}</span>
                    </a>
                  )}
                  {settings.contactInfo.phone && (
                    <a
                      href={`tel:${settings.contactInfo.phone.replace(/\s/g, '')}`}
                      className="group inline-flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span>{settings.contactInfo.phone}</span>
                    </a>
                  )}
                  {settings.contactInfo.address && (
                    <div className="inline-flex items-start gap-2.5 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span>{settings.contactInfo.address}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ── Bottom section ── */}
        <div className="container-boxed">
          <div className="border-t border-border mt-8 pt-8 pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Left: Copyright + Version */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <p className="font-mono text-xs text-muted-foreground">
                  &copy; {settings.copyrightInfo.year}{' '}
                  {settings.copyrightInfo.companyName}.{' '}
                  {settings.copyrightInfo.additionalText}
                </p>
                <Version variant="badge" />
                {settings.visibility.showDeveloperInfo && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {t('developer')}{' '}
                    <a
                      href={settings.developerInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary underline decoration-border-strong underline-offset-2 transition-colors duration-200"
                    >
                      {settings.developerInfo.name}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Fixed Back to Top button ── */}
      <AnimatePresence>
        {showBackToTop && (
          <m.button
            type="button"
            onClick={scrollToTop}
            aria-label={t('backToTop')}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xs bg-primary text-primary-foreground shadow-[var(--shadow-md)] hover:bg-primary/90 transition-colors duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowUp className="h-5 w-5" />
          </m.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConditionalFooter;
