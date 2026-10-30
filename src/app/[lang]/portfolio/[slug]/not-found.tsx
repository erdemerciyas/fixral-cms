'use client';

/** Proje bulunamadı (404) — portfolyo bağlamında tasarlanmış durum */
import Link from 'next/link';
import PageHero from '@/components/common/PageHero';
import { QuoteBand } from '@/components/fx/home/HomeSections';
import { ArrowRight } from '@/components/fx/FxIcons';
import { usePfT } from '@/components/portfolio/usePfT';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocale } from '@/hooks/useLocale';

export default function PortfolioProjectNotFound() {
  const lang = useLocale();
  const t = usePfT();
  const { t: tf } = useAppTranslations('fx');
  return (
    <>
      <PageHero
        title={t('notFound')}
        description={t('notFoundBody')}
        badge={t('notFoundCode')}
        crumbs={[
          { label: tf('nav.home'), href: `/${lang}` },
          { label: t('crumb'), href: `/${lang}/portfolio` },
        ]}
      >
        <div className="fx-hero__ctas">
          <Link className="fx-btn fx-btn--primary" href={`/${lang}/portfolio`}>
            {t('all')} <ArrowRight />
          </Link>
          <Link className="fx-btn fx-btn--ghost" href={`/${lang}`}>
            {tf('nav.home')}
          </Link>
        </div>
      </PageHero>
      <QuoteBand lang={lang} />
    </>
  );
}
