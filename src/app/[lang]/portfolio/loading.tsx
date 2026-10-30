'use client';

/** Portfolyo yükleme durumu: gerçek başlık + filtre ve masonry iskeleti */
import { PortfolioGridSkeleton, PortfolioHero } from '@/templates/PortfolioTemplate';
import { usePfT } from '@/components/portfolio/usePfT';
import { useLocale } from '@/hooks/useLocale';

export default function PortfolioLoading() {
  const lang = useLocale();
  const t = usePfT();
  return (
    <>
      <PortfolioHero lang={lang} />
      <section className="fx-sec fx-pf-list">
        <div className="fx-wrap">
          <div className="fx-pf-skel-bar" aria-hidden="true">
            {[64, 120, 96, 140, 88].map((w, i) => (
              <span key={i} className={`fx-pf-skel-chip fx-pf-skel-chip--${w}`} />
            ))}
          </div>
          <PortfolioGridSkeleton label={t('loading')} />
        </div>
      </section>
    </>
  );
}
