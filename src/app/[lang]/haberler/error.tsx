'use client';

/** Haber listesi/yazısı hata sınırı (redesign 2026). */
import { useEffect } from 'react';
import Link from 'next/link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { newsBase } from '@/content/fixral';
import { FxSystemPage } from '@/components/fx/FxSystem';

export default function NewsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, locale: lang } = useAppTranslations('fx');
  useEffect(() => {
    console.error('News error:', error);
  }, [error]);

  return (
    <FxSystemPage
      eyebrow={t('system.error.eyebrow')}
      title={t('system.newsError.title')}
      lede={t('system.newsError.lede')}
      crumb={t('system.error.eyebrow')}
      actions={
        <>
          <button type="button" className="fx-btn fx-btn--primary" onClick={reset}>{t('system.error.retry')}</button>
          <Link className="fx-btn fx-btn--ghost" href={newsBase(lang)}>{t('system.newsError.list')}</Link>
          <Link className="fx-btn fx-btn--ghost" href={`/${lang}`}>{t('system.home')}</Link>
        </>
      }
    >
      {error.digest && (
        <p className="fx-sys-path"><span>{t('system.error.code')}</span><code>{error.digest}</code></p>
      )}
    </FxSystemPage>
  );
}
