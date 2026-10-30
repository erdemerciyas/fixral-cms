'use client';

/**
 * DesktopNav — FIXRAL header menüsü (redesign 2026).
 * Linkler yönetim panelindeki sayfa ayarlarından gelir (Header → PageSettingRow);
 * aktif sayfa turuncu alt çizgiyle işaretlenir. AccountMenu oturum durumuna göre
 * hesap / yönetim / çıkış ya da giriş / kayıt bağlantılarını gösterir.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import PrefetchLink from '../PrefetchLink';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface NavLink {
  href: string;
  label: string;
  icon?: unknown;
  isExternal?: boolean;
}

interface DesktopNavProps {
  navLinks: NavLink[];
  pathname: string;
}

/** Bir nav linkinin aktif olup olmadığı: tam eşleşme ya da alt sayfa (anasayfa hariç) */
export function isNavActive(href: string, pathname: string) {
  if (href === pathname) return true;
  const segs = href.split('/').filter(Boolean);
  if (segs.length < 2) return false; // /tr gibi dil kökü yalnız tam eşleşir
  return pathname.startsWith(`${href}/`);
}

export default function DesktopNav({ navLinks, pathname }: DesktopNavProps) {
  const { t } = useAppTranslations('header');
  return (
    <nav className="fx-nav" aria-label={t('mainNav') !== 'mainNav' ? t('mainNav') : 'Ana menü'}>
      {navLinks.map((link) => {
        const active = isNavActive(link.href, pathname);
        if (link.isExternal) {
          return (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          );
        }
        return (
          <PrefetchLink key={link.href} href={link.href} aria-current={active ? 'page' : undefined}>
            {link.label}
          </PrefetchLink>
        );
      })}
    </nav>
  );
}

export function AccountMenu({ currentLang }: { currentLang: string }) {
  const { data: session } = useSession();
  const { t } = useAppTranslations('nav');
  const { t: tf } = useAppTranslations('fx');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = Boolean(session?.user && (session.user as { role?: string }).role === 'admin');
  const initial = (session?.user?.name?.[0] || session?.user?.email?.[0] || 'U').toUpperCase();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className="fx-account">
      <button
        type="button"
        className="fx-iconbtn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('account')}
      >
        {session?.user ? (
          <span className="fx-avatar fx-avatar--sm">{initial}</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        )}
      </button>
      {open && (
        <div className="fx-account__menu" role="menu">
          {session?.user ? (
            <>
              <div className="fx-account__who">
                <span className="fx-avatar">{initial}</span>
                <span className="fx-minw0">
                  <b>{session.user.name || t('account')}</b>
                  <span>{session.user.email}</span>
                </span>
              </div>
              {isAdmin && (
                <Link role="menuitem" href="/admin/dashboard" onClick={() => setOpen(false)}>
                  {tf('nav.admin')}
                </Link>
              )}
              <Link role="menuitem" href={`/${currentLang}/account`} onClick={() => setOpen(false)}>
                {t('account')}
              </Link>
              <Link role="menuitem" href="/api/auth/signout" className="is-danger" onClick={() => setOpen(false)}>
                {t('logout')}
              </Link>
            </>
          ) : (
            <div className="fx-account__btns">
              <Link role="menuitem" href={`/${currentLang}/login`} className="fx-btn fx-btn--primary fx-btn--sm" onClick={() => setOpen(false)}>
                {t('login')}
              </Link>
              <Link role="menuitem" href={`/${currentLang}/register`} className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setOpen(false)}>
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
