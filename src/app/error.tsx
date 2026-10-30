'use client';

/**
 * Uygulama hata sınırı (redesign 2026). Kök seviyede çalışır; dil adres
 * satırından çözülür. Geliştirme ortamında hata mesajı gösterilir.
 */
import { useEffect } from 'react';
import Link from 'next/link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { FxSystemPage } from '@/components/fx/FxSystem';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, locale: lang } = useAppTranslations('fx');
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <FxSystemPage
      eyebrow={t('system.error.eyebrow')}
      title={t('system.error.title')}
      lede={t('system.error.lede')}
      crumb={t('system.error.eyebrow')}
      actions={
        <>
          <button type="button" className="fx-btn fx-btn--primary" onClick={reset}>{t('system.error.retry')}</button>
          <Link className="fx-btn fx-btn--ghost" href={`/${lang}`}>{t('system.home')}</Link>
          <Link className="fx-btn fx-btn--ghost" href={`/${lang}/contact`}>{t('system.error.contact')}</Link>
        </>
      }
    >
      {error.digest && (
        <p className="fx-sys-path"><span>{t('system.error.code')}</span><code>{error.digest}</code></p>
      )}
      {process.env.NODE_ENV === 'development' && error.message && (
        <p className="fx-sys-detail"><span className="sr-only">{t('system.error.details')}: </span>{error.message}</p>
      )}
    </FxSystemPage>
  );
}
