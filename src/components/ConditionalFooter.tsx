'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ArrowUp } from 'lucide-react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FxLogo, FxWordmark } from '@/components/fx/FxLogo';
import { serviceHref, softwareHref, toFxLocale } from '@/content/fixral';
import { useFx } from '@/components/fx/FxData';
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
  const { t: tFx } = useAppTranslations('fx');
  const fx = useFx(locale);
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
    }
    // Admin sayfalarında footer zaten render edilmez; setLoading'e gerek yok
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
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  const lang = toFxLocale(locale);
  const localize = (url: string, isExternal: boolean) => {
    if (isExternal || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) return url;
    if (url.startsWith(`/${locale}/`) || url === `/${locale}`) return url;
    let clean = url.startsWith('/') ? url : `/${url}`;
    clean = clean.replace(/^\/noticias(?=\/|$)/, '/haberler');
    return `/${locale}${clean === '/' ? '' : clean}`;
  };
  const year = settings.copyrightInfo?.year || new Date().getFullYear();
  const company = settings.copyrightInfo?.companyName || site?.siteName || 'FIXRAL';
  const description = settings.mainDescription || tFx('footer.about');

  return (
    <footer className="fx-ftr public-theme public-dark" role="contentinfo">
      <div className="fx-wrap">
        <div className="fx-ftr__top">
          <div className="fx-ftr__brand">
            <Link href={`/${locale}`} aria-label={company} className="fx-hdr__logo-link">
              <FxLogo tone="light" title={company} />
            </Link>
            <p>{description}</p>
            <p className="fx-eyebrow">{tFx('footer.slogan')}</p>
            {settings.visibility?.showSocialLinks && socialEntries.length > 0 && (
              <ul className="fx-ftr__social" aria-label="Sosyal medya">
                {socialEntries.map((item) => {
                  const Icon = socialIconMap[item.key];
                  return (
                    <li key={item.key}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="fx-iconbtn">
                        {Icon ? <Icon className="h-4 w-4" /> : item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="fx-ftr__col">
            <h4>{tFx('footer.services')}</h4>
            {fx.services.map((svc) => (
              <Link key={svc.key} href={serviceHref(locale, svc)}>{svc.text[lang].name}</Link>
            ))}
          </div>

          <div className="fx-ftr__col">
            <h4>{tFx('footer.software')}</h4>
            {fx.software.map((sw) => (
              <Link key={sw.slug} href={softwareHref(locale, sw)}>{sw.name}</Link>
            ))}
            <a href="https://github.com/fixral3d" target="_blank" rel="noopener noreferrer">{tFx('footer.github')}</a>
            {settings.visibility?.showQuickLinks && settings.quickLinks?.length > 0 && (
              <>
                <h4 className="fx-ftr__sub">{tFx('footer.site')}</h4>
                {settings.quickLinks.map((link, index) =>
                  link.isExternal ? (
                    <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
                  ) : (
                    <Link key={index} href={localize(link.url, false)}>{link.title}</Link>
                  ),
                )}
              </>
            )}
          </div>

          <div className="fx-ftr__col">
            <h4>{tFx('footer.contact')}</h4>
            {settings.visibility?.showContactInfo !== false && (
              <>
                {settings.contactInfo?.email && <span className="fx-mono fx-ftr__select">{settings.contactInfo.email}</span>}
                {settings.contactInfo?.phone && <span className="fx-mono fx-ftr__select">{settings.contactInfo.phone}</span>}
                {settings.contactInfo?.address && <span className="fx-ftr__muted">{settings.contactInfo.address}</span>}
              </>
            )}
            <Link href={`/${locale}/contact`}>{tFx('nav.quote')}</Link>
          </div>
        </div>

        <FxWordmark className="fx-ftr__mega" />

        <div className="fx-ftr__bot">
          <span>
            © {year} {company}. {settings.copyrightInfo?.additionalText && lang === 'tr' ? settings.copyrightInfo.additionalText : tFx('footer.rights')}
          </span>
          <span className="fx-ftr__meta">
            {settings.visibility?.showDeveloperInfo && settings.developerInfo?.name && (
              <>
                {t('developer')}{' '}
                {settings.developerInfo.website ? (
                  <a href={settings.developerInfo.website} target="_blank" rel="noopener noreferrer">{settings.developerInfo.name}</a>
                ) : (
                  settings.developerInfo.name
                )}
                <span aria-hidden="true"> · </span>
              </>
            )}
            <Version />
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <m.button
            type="button"
            onClick={scrollToTop}
            className="fx-totop"
            aria-label={tFx('footer.backToTop')}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </m.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default ConditionalFooter;
