'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { List, X, MagnifyingGlass, PaperPlaneTilt, User, SignOut, GearSix } from '@phosphor-icons/react';
import { resolveIcon, getIconForPage } from '../lib/icons';
import DesktopNav from './layout/DesktopNav';
import TopBar from './layout/TopBar';
import MobileNav from './layout/MobileNav';
import SearchModal from './layout/SearchModal';
import ProjectModal from './features/ProjectModal';
import { locales } from '@/i18n';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<Array<{ href: string; label: string; icon: any; isExternal?: boolean }>>([]);
  const [navLoaded, setNavLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const { t: tHeader } = useAppTranslations('header');

  const pathname = usePathname() || '';

  const isHomePage = pathname === '/' ||
    /^\/[a-z]{2}\/?$/.test(pathname);

  const isTransparentPage = isHomePage ||
    pathname.includes('/haberler') ||
    pathname.includes('/noticias') ||
    pathname.includes('/portfolio') ||
    pathname.includes('/services') ||
    pathname.includes('/contact') ||
    pathname.includes('/videos');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
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
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

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

  const showFloatingPill = isScrolled || !isTransparentPage;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:bg-brand-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-br-lg"
      >
        {tHeader('skipToContent')}
      </a>

      <header className="fixed top-0 left-0 right-0 z-50" role="banner">
        <TopBar
          currentLang={currentLang}
          isTransparentPage={isTransparentPage}
          visible={!isScrolled}
        />

        <motion.div
          animate={{
            backgroundColor: showFloatingPill ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0)',
            backdropFilter: showFloatingPill ? 'blur(20px)' : 'blur(0px)',
          }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="relative"
          style={{
            borderBottom: showFloatingPill ? '1px solid rgba(0, 52, 80, 0.06)' : '1px solid transparent',
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6">
            <div
              className="flex items-center"
              style={{
                height: isScrolled ? '56px' : '64px',
                transition: 'height 500ms cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              {/* Logo */}
              <Link
                href={`/${currentLang}`}
                className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 rounded-lg"
                aria-label={tHeader('goToHome')}
              >
                {siteSettings?.logo?.url && (
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      width: isScrolled ? '32px' : '38px',
                      height: isScrolled ? '32px' : '38px',
                      transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                  >
                    <Image
                      src={siteSettings.logo.url}
                      alt={siteSettings.logo.alt}
                      fill
                      className="object-contain"
                      sizes="44px"
                      priority
                    />
                  </div>
                )}
                {siteSettings?.logoText && (
                  <span
                    className="font-semibold tracking-tight"
                    style={{
                      fontSize: isScrolled ? '14px' : '16px',
                      color: !showFloatingPill ? '#ffffff' : '#18181b',
                      textShadow: !showFloatingPill ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                      transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                  >
                    {siteSettings.logoText}
                  </span>
                )}
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex flex-1 items-center justify-center ml-8">
                <DesktopNav
                  navLinks={localizedNavLinks}
                  pathname={pathname || ''}
                  isScrolled={isScrolled}
                  isTransparentPage={isTransparentPage}
                  onOpenProjectModal={openProjectModal}
                  onOpenSearch={() => setIsSearchOpen(true)}
                  compact={isScrolled}
                />
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={toggleMobileMenu}
                aria-label={tHeader('openMenu')}
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden ml-auto p-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600"
                style={{
                  color: !showFloatingPill ? '#ffffff' : '#3f3f46',
                  transition: 'color 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <X size={24} weight="light" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <List size={24} weight="light" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </motion.div>
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
