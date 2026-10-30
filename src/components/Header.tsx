'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveIcon, getIconForPage } from '../lib/icons';
import DesktopNav, { AccountMenu } from './layout/DesktopNav';
import { FxLogo } from './fx/FxLogo';
import { MenuIcon, SearchIcon } from './fx/FxIcons';
import MobileNav from './layout/MobileNav';
import SearchModal from './layout/SearchModal';
import LanguageSwitch from './ui/LanguageSwitch';
import ProjectModal from './features/ProjectModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { locales } from '@/i18n';
import { useAppTranslations } from '@/hooks/useAppTranslations';

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

type HeaderNavLink = { href: string; label: string; icon: unknown; pageId?: string; isExternal?: boolean };

function getDefaultNavLinks(): HeaderNavLink[] {
  return [
    { href: '/', label: 'Anasayfa', pageId: 'home', icon: null },
    { href: '/services', label: 'Hizmetler', pageId: 'services', icon: null },
    { href: '/software', label: 'Yazılımlar', pageId: 'software', icon: null },
    { href: '/fx-3d', label: 'FX 3D', pageId: 'fx-3d', icon: null },
    { href: '/portfolio', label: 'Projeler', pageId: 'portfolio', icon: null },
    { href: '/haberler', label: 'Haberler', pageId: 'news', icon: null },
    { href: '/videos', label: 'Videolar', pageId: 'videos', icon: null },
    { href: '/contact', label: 'İletişim', pageId: 'contact', icon: null },
  ];
}

/* Yazılımlar sayfası (redesign 2026) sayfa ayarlarında henüz yoksa menüye
 * Hizmetler'in hemen arkasına eklenir; yönetim panelinden kayıt eklendiğinde
 * (pageId: 'software') oradaki sıra ve görünürlük geçerli olur. */
function withSoftwareLink(links: HeaderNavLink[]): HeaderNavLink[] {
  if (links.some((l) => l.pageId === 'software' || l.href === '/software')) return links;
  const soft: HeaderNavLink = { href: '/software', label: 'Yazılımlar', pageId: 'software', icon: null };
  const i = links.findIndex((l) => l.pageId === 'services' || l.href === '/services');
  const out = links.slice();
  out.splice(i >= 0 ? i + 1 : out.length, 0, soft);
  return out;
}

/* FX 3D (Cults3D modelleri) aynı kuralla Yazılımlar'ın arkasına eklenir. */
function withFx3dLink(links: HeaderNavLink[]): HeaderNavLink[] {
  if (links.some((l) => l.pageId === 'fx-3d' || l.href === '/fx-3d')) return links;
  const fx3d: HeaderNavLink = { href: '/fx-3d', label: 'FX 3D', pageId: 'fx-3d', icon: null };
  const i = links.findIndex((l) => l.pageId === 'software' || l.href === '/software');
  const out = links.slice();
  out.splice(i >= 0 ? i + 1 : out.length, 0, fx3d);
  return out;
}

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState<HeaderNavLink[]>([]);
  const [navLoaded, setNavLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const { t: tHeader } = useAppTranslations('header');
  const { t: tFx } = useAppTranslations('fx');

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
              pageId: page.pageId,
              icon: resolveIcon(page.icon) || getIconForPage(page.pageId),
              isExternal: page.isExternal
            }));
          setNavLinks(withFx3dLink(withSoftwareLink(navPages)));
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

  // Route değişiminde mobil menüyü kapat (render sırasında ayarlama; efekt gerekmez)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

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
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-9999 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-[var(--radius-button)] focus:border focus:border-border"
      >
        {tHeader('skipToContent')}
      </a>

      {/* FIXRAL header — her temada koyu ada (public-theme public-dark), sticky,
          64px. Menü yönetim panelindeki sayfa ayarlarından gelir. */}
      <header className={`fx-hdr public-theme public-dark ${isScrolled ? 'is-scrolled' : ''}`} role="banner">
        <div className="fx-wrap fx-hdr__in">
          <Link href={`/${currentLang}`} className="fx-hdr__logo-link" aria-label={tHeader('goToHome')}>
            <FxLogo tone="light" title={siteSettings?.siteName || 'FIXRAL'} />
          </Link>

          <DesktopNav navLinks={localizedNavLinks.filter((l) => l.pageId !== 'home')} pathname={pathname || ''} />

          <div className="fx-hdr__tools">
            <LanguageSwitch currentLang={currentLang} variant="segmented" />
            <button
              type="button"
              className="fx-searchbtn"
              onClick={() => setIsSearchOpen(true)}
              aria-label={`${tHeader('search')} (Ctrl+K)`}
            >
              <SearchIcon />
              <span>{tFx('nav.searchShort')}</span>
              <kbd>Ctrl K</kbd>
            </button>
            <ThemeToggle className="fx-themebtn" />
            <AccountMenu currentLang={currentLang} />
            <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={openProjectModal}>
              {tFx('nav.quote')}
            </button>
            <button
              type="button"
              className="fx-iconbtn fx-menu-btn"
              onClick={toggleMobileMenu}
              aria-label={tHeader('openMenu')}
              aria-expanded={isMobileMenuOpen}
            >
              <MenuIcon />
            </button>
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
