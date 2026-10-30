'use client';

/**
 * 404 (redesign 2026) — prototip `PAGES.notfound()`. Kök seviyede, [lang]
 * sağlayıcısının dışında render edilebildiği için dil adres satırından çözülür.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ArrowRight } from '@/components/fx/FxIcons';
import { FxSystemPage } from '@/components/fx/FxSystem';

export default function NotFound() {
  const { t, locale: lang } = useAppTranslations('fx');
  const pathname = usePathname();

  return (
    <FxSystemPage
      eyebrow={t('system.notFound.eyebrow')}
      title={t('system.notFound.title')}
      lede={t('system.notFound.lede')}
      crumb={t('system.notFound.crumb')}
      actions={
        <>
          <Link className="fx-btn fx-btn--primary" href={`/${lang}`}>{t('system.home')} <ArrowRight /></Link>
          <Link className="fx-btn fx-btn--ghost" href={`/${lang}/services`}>{t('system.notFound.services')}</Link>
          <Link className="fx-btn fx-btn--ghost" href={`/${lang}/software`}>{t('system.notFound.software')}</Link>
        </>
      }
    >
      {pathname && pathname !== `/${lang}` && (
        <p className="fx-sys-path">
          <span>{t('system.notFound.path')}</span>
          <code>{pathname}</code>
        </p>
      )}
    </FxSystemPage>
  );
}
