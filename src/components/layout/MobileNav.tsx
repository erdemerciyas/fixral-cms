'use client';

/**
 * MobileNav — FIXRAL tam ekran mobil menü (Radix Dialog: odak tuzağı + Escape).
 * Her temada koyu ada; büyük Space Grotesk linkler, sağda mono meta, altta
 * dil anahtarı, hesap bağlantısı ve tek turuncu "Teklif Al" butonu.
 */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FxLogo } from '@/components/fx/FxLogo';
import { ArrowRight, CloseIcon } from '@/components/fx/FxIcons';
import LanguageSwitch from '../ui/LanguageSwitch';
import { isNavActive } from './DesktopNav';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface NavLink {
  href: string;
  label: string;
  icon?: unknown;
  isExternal?: boolean;
}

interface MobileNavProps {
  isOpen: boolean;
  navLinks: NavLink[];
  pathname: string;
  onClose: () => void;
  onOpenProjectModal: () => void;
  navLoaded: boolean;
  logoText?: string;
}

export default function MobileNav({ isOpen, navLinks, pathname, onClose, onOpenProjectModal }: MobileNavProps) {
  const { data: session } = useSession();
  const { t } = useAppTranslations('fx');
  const { t: tNav } = useAppTranslations('nav');
  const { t: tHeader } = useAppTranslations('header');
  const currentLang = pathname.split('/')[1] === 'tr' ? pathname.split('/')[1] : 'tr';

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fx-drawer public-theme public-dark" aria-describedby={undefined}>
          <div className="fx-drawer__top">
            <Link href={`/${currentLang}`} onClick={onClose} className="fx-hdr__logo-link" aria-label={tHeader('goToHome')}>
              <FxLogo tone="light" />
            </Link>
            <DialogPrimitive.Close className="fx-iconbtn" aria-label={tHeader('closeMenu')}>
              <CloseIcon />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Title className="sr-only">{t('nav.menu')}</DialogPrimitive.Title>
          <nav aria-label={t('nav.menu')}>
            {navLinks.map((link, i) =>
              link.isExternal ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                  {link.label}
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </a>
              ) : (
                <Link key={link.href} href={link.href} onClick={onClose} aria-current={isNavActive(link.href, pathname) ? 'page' : undefined}>
                  {link.label}
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </Link>
              ),
            )}
          </nav>
          <div className="fx-drawer__foot">
            <div className="fx-drawer__row">
              <LanguageSwitch currentLang={currentLang} variant="segmented" />
              <Link
                href={session?.user ? `/${currentLang}/account` : `/${currentLang}/login`}
                onClick={onClose}
                className="fx-link"
              >
                {session?.user ? tNav('account') : tNav('login')} <ArrowRight />
              </Link>
            </div>
            <button
              type="button"
              className="fx-btn fx-btn--primary"
              onClick={() => { onClose(); onOpenProjectModal(); }}
            >
              {t('nav.quote')} <ArrowRight />
            </button>
            <p className="fx-eyebrow">{t('nav.slogan')}</p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
