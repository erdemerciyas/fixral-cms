'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useActiveTheme } from '../providers/ActiveThemeProvider';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  Envelope,
  Phone,
  MapPin,
  ArrowUp,
  LinkedinLogo,
  TwitterLogo,
  InstagramLogo,
  FacebookLogo,
  GithubLogo,
  YoutubeLogo,
} from '@phosphor-icons/react';

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

const TRANSITION = 'cubic-bezier(0.32, 0.72, 0, 1)';
const DURATION = '700ms';

const socialIconMap: Record<string, React.ElementType> = {
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
  const { theme } = useActiveTheme();
  const { t, locale } = useAppTranslations('footer');

  const footerConfig = theme?.footer;
  const isAdminPage = pathname?.startsWith('/admin');

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

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  const bgColor = footerConfig?.backgroundColor || '#09141d';
  const textColor = footerConfig?.textColor || 'rgba(255,255,255,0.4)';
  const headingColor = footerConfig?.headingColor || 'rgba(255,255,255,0.9)';
  const linkColor = footerConfig?.linkColor || 'rgba(255,255,255,0.6)';
  const accentColor = footerConfig?.accentColor || '#003450';
  const borderColor =
    footerConfig?.borderColor || 'rgba(255,255,255,0.06)';
  const bottomTextColor =
    footerConfig?.bottomTextColor || 'rgba(255,255,255,0.4)';

  return (
    <footer
      style={{
        backgroundColor: bgColor,
        fontFamily: 'var(--font-geist-sans)',
        transition: `background-color ${DURATION} ${TRANSITION}`,
      }}
      className="relative overflow-hidden"
      role="contentinfo"
    >
      {/* ── Top section: brand + quick links ── */}
      <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-10 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Left column: brand + description + contact */}
          <section aria-labelledby="footer-about">
            <h2 id="footer-about" className="sr-only">
              {t('aboutTitle')}
            </h2>

            {/* Logo & site name */}
            <div className="mb-6 flex items-center gap-3">
              {site?.logo?.url && (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
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
                <span
                  style={{
                    color: headingColor,
                    transition: `color ${DURATION} ${TRANSITION}`,
                  }}
                  className="text-lg font-semibold tracking-tight"
                >
                  {site.siteName}
                </span>
              )}
            </div>

            {/* Description */}
            <p
              style={{
                color: linkColor,
                transition: `color ${DURATION} ${TRANSITION}`,
              }}
              className="max-w-md text-[15px] leading-relaxed"
            >
              {settings.mainDescription}
            </p>

            {/* Contact info */}
            {settings.visibility.showContactInfo && (
              <div className="mt-8 flex flex-col gap-3">
                {settings.contactInfo.email && (
                  <a
                    href={`mailto:${settings.contactInfo.email}`}
                    className="group inline-flex items-center gap-2.5"
                    style={{
                      color: textColor,
                      transition: `color ${DURATION} ${TRANSITION}`,
                    }}
                  >
                    <Envelope
                      weight="light"
                      className="h-4 w-4 shrink-0"
                      style={{ color: accentColor }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        transition: `color ${DURATION} ${TRANSITION}`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = textColor)
                      }
                    >
                      {settings.contactInfo.email}
                    </span>
                  </a>
                )}
                {settings.contactInfo.phone && (
                  <a
                    href={`tel:${settings.contactInfo.phone.replace(/\s/g, '')}`}
                    className="group inline-flex items-center gap-2.5"
                    style={{
                      color: textColor,
                      transition: `color ${DURATION} ${TRANSITION}`,
                    }}
                  >
                    <Phone
                      weight="light"
                      className="h-4 w-4 shrink-0"
                      style={{ color: accentColor }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        transition: `color ${DURATION} ${TRANSITION}`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = textColor)
                      }
                    >
                      {settings.contactInfo.phone}
                    </span>
                  </a>
                )}
                {settings.contactInfo.address && (
                  <div
                    className="inline-flex items-start gap-2.5"
                    style={{ color: textColor }}
                  >
                    <MapPin
                      weight="light"
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: accentColor }}
                    />
                    <span className="text-sm">
                      {settings.contactInfo.address}
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Right column: quick links */}
          {settings.visibility.showQuickLinks &&
            settings.quickLinks.length > 0 && (
              <nav aria-label="Footer navigation" role="navigation">
                <h3
                  style={{
                    color: headingColor,
                    transition: `color ${DURATION} ${TRANSITION}`,
                  }}
                  className="mb-6 text-xs font-medium uppercase tracking-[0.15em]"
                >
                  {t('quickLinks')}
                </h3>
                <ul className="flex flex-col gap-3">
                  {settings.quickLinks.map((link, index) => {
                    const linkUrl =
                      link.isExternal || link.url.startsWith('http')
                        ? link.url
                        : link.url.startsWith(`/${locale}`)
                          ? link.url
                          : `/${locale}${link.url.startsWith('/') ? link.url : `/${link.url}`}`;

                    const sharedClasses =
                      'text-[15px] inline-block rounded-md px-0 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003450]/50';

                    return (
                      <li key={index}>
                        {link.isExternal ? (
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={sharedClasses}
                            style={{
                              color: linkColor,
                              transition: `color ${DURATION} ${TRANSITION}`,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color =
                                'rgba(255,255,255,0.9)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = linkColor)
                            }
                          >
                            {link.title}
                          </a>
                        ) : (
                          <Link
                            href={linkUrl}
                            className={sharedClasses}
                            style={{
                              color: linkColor,
                              transition: `color ${DURATION} ${TRANSITION}`,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color =
                                'rgba(255,255,255,0.9)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = linkColor)
                            }
                          >
                            {link.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div
          className="h-px w-full"
          style={{ backgroundColor: borderColor }}
        />
      </div>

      {/* ── Bottom section: copyright + social + back-to-top ── */}
      <div className="mx-auto max-w-[1400px] px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Copyright & meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p
              className="font-mono text-[12px]"
              style={{
                color: bottomTextColor,
                transition: `color ${DURATION} ${TRANSITION}`,
              }}
            >
              &copy; {settings.copyrightInfo.year}{' '}
              {settings.copyrightInfo.companyName}.{' '}
              {settings.copyrightInfo.additionalText}
            </p>
            <Version variant="badge" />
            {settings.visibility.showDeveloperInfo && (
              <span
                className="font-mono text-[12px]"
                style={{
                  color: bottomTextColor,
                  transition: `color ${DURATION} ${TRANSITION}`,
                }}
              >
                {t('developer')}{' '}
                <a
                  href={settings.developerInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white/10 underline-offset-2"
                  style={{
                    color: linkColor,
                    transition: `color ${DURATION} ${TRANSITION}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = linkColor)
                  }
                >
                  {settings.developerInfo.name}
                </a>
              </span>
            )}
          </div>

          {/* Social links + back-to-top */}
          <div className="flex items-center gap-2">
            {settings.visibility.showSocialLinks &&
              socialEntries.length > 0 && (
                <nav aria-label="Social media" className="flex items-center gap-2">
                  {socialEntries.map((item) => {
                    const IconComp = socialIconMap[item.key];
                    return (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003450]/50"
                        style={{
                          color: linkColor,
                          transition: `all ${DURATION} ${TRANSITION}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'rgba(255,255,255,0.1)';
                          e.currentTarget.style.color =
                            'rgba(255,255,255,0.9)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'rgba(255,255,255,0.05)';
                          e.currentTarget.style.color = linkColor;
                        }}
                      >
                        {IconComp && (
                          <IconComp weight="light" className="h-[18px] w-[18px]" />
                        )}
                      </a>
                    );
                  })}
                </nav>
              )}

            {/* Back to top */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label={t('backToTop')}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003450]/50"
              style={{
                color: linkColor,
                transition: `all ${DURATION} ${TRANSITION}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = linkColor;
              }}
            >
              <ArrowUp weight="light" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ConditionalFooter;
