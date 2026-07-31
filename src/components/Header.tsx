'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu as List, X, Search as MagnifyingGlass, Send as PaperPlaneTilt } from 'lucide-react';
import { resolveIcon, getIconForPage } from '../lib/icons';
import DesktopNav from './layout/DesktopNav';
import MobileNav from './layout/MobileNav';
import SearchModal from './layout/SearchModal';
import LanguageSwitch from './ui/LanguageSwitch';
import ProjectModal from './features/ProjectModal';
import { MagneticButton } from './ui/MagneticButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { locales } from '@/i18n';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { m, AnimatePresence } from 'framer-motion';

interface SiteSettings {
  siteName: string;
  logoText: string;
  slogan: string;
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
}

interface PageSetting {
  pageId: string;
  title: string;
  path: string;
  icon?: string;
  isExternal?: boolean;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
}

function getDefaultNavLinks() {
  return [
    { href: '/', label: 'Anasayfa', icon: null },
    { href: '/haberler', label: 'Haberler', icon: null },
    { href: '/services', label: 'Hizmetler', icon: null },
    { href: '/portfolio', label: 'Portföy', icon: null },
    { href: '/videos', label: 'Videolar', icon: null },
    { href: '/contact', label: 'İletişim', icon: null },
  ];
}

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState<Array<{ href: string; label: string; icon: any; isExternal?: boolean }>>([]);
  const [navLoaded, setNavLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const { t: tHeader } = useAppTranslations('header');

  const pathname = usePathname() || '';

  // Scroll durumu: ana sayfada hero üzerinde saydam → scroll sonrası token yüzey
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isMobileMenuOpen]);

  type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
  const getGtag = useCallback((): GtagFn | undefined => {
    if (typeof window === 'undefined') return undefined;
    const w = window as typeof window & { gtag?: GtagFn };
    return w.gtag;
  }, []);

  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    const gtag = getGtag();
    if (gtag) gtag('event', eventName, params);
  }, [getGtag]);

  const openProjectModal = useCallback(() => {
    trackEvent('open_project_modal', { location: 'header' });
    setIsProjectModalOpen(true);
    setIsMobileMenuOpen(false);
  }, [trackEvent]);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/public/settings', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setSiteSettings({
            siteName: data?.siteName || '',
            logoText: data?.logoText || '',
            slogan: data?.slogan || '',
            logo: {
              url: typeof data?.logo === 'string' ? data.logo : (data?.logo?.url || ''),
              alt: 'Logo',
              width: 200,
              height: 60,
            },
          });
        }
      } catch {
        setSiteSettings(null);
      }
    };
    fetchSiteSettings();
  }, []);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/admin/page-settings?t=${timestamp}&r=${Math.random()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const pages = await response.json();
          const navPages = pages
            .filter((page: PageSetting) => page.isActive && page.showInNavigation)
            .sort((a: PageSetting, b: PageSetting) => a.order - b.order)
            .map((page: PageSetting) => ({
              href: page.path.startsWith('http') || page.path.startsWith('/') ? page.path : `/${page.path}`,
              label: page.title,
              icon: resolveIcon(page.icon) || getIconForPage(page.pageId),
              isExternal: page.isExternal
            }));
          setNavLinks(navPages);
          setNavLoaded(true);
        } else {
          setNavLinks(getDefaultNavLinks());
          setNavLoaded(true);
        }
      } catch (error) {
        console.error('Navigation fetch error:', error);
        setNavLinks(getDefaultNavLinks());
        setNavLoaded(true);
      }
    };
    fetchNavigation();
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handleOpen: EventListener = () => openProjectModal();
    window.addEventListener('openProjectModal', handleOpen);
    return () => window.removeEventListener('openProjectModal', handleOpen);
  }, [openProjectModal]);

  if (pathname?.startsWith('/admin')) return null;

  const toggleMobileMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const firstSegment = pathname.split('/')[1];
  const currentLang = (locales as readonly string[]).includes(firstSegment) ? firstSegment : 'tr';

  /* Semantik route tespiti: yalnızca ana sayfa hero'su always-dark scope'ta
   * başlıyor; header tepedeyken hero'nun üzerine saydam biner ve kendi
   * `public-theme public-dark` scope'u ile tüm token'ları grafit palete çevirir
   * (açık metin/ikon). Scroll'da veya alt sayfalarda token yüzeye döner. */
  const isHome = pathname === '/' || pathname === `/${currentLang}` || pathname === `/${currentLang}/`;
  const overHero = isHome && !isScrolled;

  const ROUTE_SEGMENT_MAP: Record<string, Record<string, string>> = {
    tr: { noticias: 'haberler' },
    es: { haberler: 'noticias' },
  };

  const localizedNavLinks = navLinks.map(link => {
    if (link.isExternal || link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) return link;
    const cleanPath = link.href.startsWith('/') ? link.href : `/${link.href}`;
    if (cleanPath.startsWith(`/${currentLang}/`) || cleanPath === `/${currentLang}`) return link;

    let targetPath = cleanPath;
    const mapping = ROUTE_SEGMENT_MAP[currentLang];
    if (mapping) {
      const pathSegment = cleanPath.split('/').filter(Boolean)[0];
      if (pathSegment && mapping[pathSegment]) {
        targetPath = cleanPath.replace(`/${pathSegment}`, `/${mapping[pathSegment]}`);
      }
    }
    const newHref = `/${currentLang}${targetPath === '/' ? '' : targetPath}`;
    return { ...link, href: newHref };
  });

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-9999 focus:bg-background focus:text-primary focus:px-4 focus:py-2 focus:rounded-xs focus:shadow-[var(--shadow-lg)] focus:border focus:border-border"
      >
        {tHeader('skipToContent')}
      </a>

      {/* Precision chrome: flat, dark-capable bar. Ana sayfa tepesinde hero'nun
          always-dark scope'uyla aynı teknikle saydamlaşır, sonrasında token zemin. */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 motion-reduce:transition-none ${
          overHero
            ? 'public-theme public-dark bg-transparent border-b border-transparent'
            : 'bg-background border-b border-border'
        }`}
        role="banner"
      >
        <div className="container-boxed">
          <div className="flex items-center gap-3 h-14">
            {/* Logo — sol blok: token tabanlı kutu + foreground metin */}
            <Link
              href={`/${currentLang}`}
              className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 rounded-xs"
              aria-label={tHeader('goToHome')}
            >
              {siteSettings?.logo?.url && (
                <div className="relative w-9 h-9 rounded-sm overflow-hidden bg-card border border-border transition-transform duration-150 group-hover:scale-[1.03]">
                  <Image
                    src={siteSettings.logo.url}
                    alt={siteSettings.logo.alt}
                    fill
                    className="object-contain p-1"
                    sizes="36px"
                    priority
                  />
                </div>
              )}
              {siteSettings?.logoText && (
                <span className="font-semibold tracking-tight text-base text-foreground">
                  {siteSettings.logoText}
                </span>
              )}
            </Link>

            {/* Arama kontrolü — precision: turuncu dolgu, 2px radius, hover/focus'ta genişler.
                Token tabanlı: primary/primary-foreground her iki temada da geçerli. */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 h-9 w-48 hover:w-64 focus-visible:w-64 px-4 rounded-xs bg-primary text-sm text-primary-foreground hover:bg-primary/90 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`${tHeader('search')} (Ctrl+K)`}
            >
              <MagnifyingGlass size={15} className="shrink-0 text-primary-foreground" aria-hidden="true" />
              <span className="flex-1 text-left truncate text-primary-foreground/90">{tHeader('searchPlaceholder')}</span>
              <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded-xs bg-primary-foreground/15 font-mono text-[10px] font-medium tracking-wide text-primary-foreground/85">
                Ctrl K
              </kbd>
            </button>

            {/* Desktop Nav — sade metin linkleri (orta blok) */}
            <div className="hidden lg:flex flex-1 items-center ml-3">
              <DesktopNav
                navLinks={localizedNavLinks}
                pathname={pathname || ''}
              />
            </div>

            {/* Sağ blok: dil + tema + arama (mobil) + CTA + hamburger */}
            <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
              <div className="hidden lg:block">
                <LanguageSwitch currentLang={currentLang} variant="compact" />
              </div>

              <ThemeToggle />

              {/* Mobile search trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 rounded-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                aria-label={tHeader('search')}
              >
                <MagnifyingGlass size={18} />
              </button>

              {/* CTA — tek turuncu dolgu, 2px kontrol radius'u */}
              <div className="hidden lg:block">
                <MagneticButton
                  onClick={openProjectModal}
                  className="rounded-xs bg-primary text-primary-foreground text-sm px-4 py-2 font-semibold hover:bg-primary/90 transition-colors duration-200 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <PaperPlaneTilt size={14} className="mr-1.5 inline-block" aria-hidden="true" />
                  Teklif Al
                </MagneticButton>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={toggleMobileMenu}
                aria-label={tHeader('openMenu')}
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden p-2 rounded-xs text-foreground hover:bg-accent transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <m.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <X size={24} />
                    </m.div>
                  ) : (
                    <m.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <List size={24} />
                    </m.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileMenuOpen}
        navLinks={localizedNavLinks}
        pathname={pathname || ''}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenProjectModal={openProjectModal}
        logoText={siteSettings?.logoText}
        navLoaded={navLoaded}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </>
  );
};

export default Header;
