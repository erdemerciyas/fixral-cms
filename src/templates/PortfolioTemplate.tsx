'use client';

/**
 * Portfolyo listesi (redesign 2026) — prototip `PAGES.isler()`.
 * PageHero → filtreler (kategori çipleri, arama, sıralama, teknoloji/tarih)
 * → WorkCard masonry (8/4 · 4/8 · 6/6) → "daha fazla göster" → QuoteBand.
 * Filtre durumu URL'de tutulur (usePortfolioFilters).
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/common/PageHero';
import { WorkCard } from '@/components/fx/FxCards';
import { QuoteBand } from '@/components/fx/home/HomeSections';
import { ArrowRight } from '@/components/fx/FxIcons';
import PortfolioFilters, { EMPTY_FILTERS } from '@/components/portfolio/PortfolioFilters';
import { usePfT } from '@/components/portfolio/usePfT';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFx } from '@/components/fx/FxData';
import { masonrySpans, toProjectCard, type PfCategory, type PfProject } from '@/components/portfolio/portfolio-data';
import { usePortfolioFilters } from '@/hooks/usePortfolioFilters';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';

const PAGE_SIZE = 12;

interface PortfolioTemplateProps {
  lang: string;
  items: PfProject[];
  categories: PfCategory[];
  /** Veritabanına ulaşılamadı */
  loadError?: boolean;
}

/** Yükleme iskeleti — loading.tsx ve Suspense yedeği olarak da kullanılır */
export function PortfolioGridSkeleton({ label }: { label: string }) {
  return (
    <div className="fx-works" aria-busy="true" aria-label={label}>
      {masonrySpans(6).map((s, i) => (
        <div key={i} className={`fx-work fx-skel ${s === 8 ? 'fx-work--wide' : s === 6 ? 'fx-work--s6' : 'fx-work--s4'}`}>
          <div className="fx-work__img" />
          <span className="fx-pf-skel-line" />
          <span className="fx-pf-skel-line fx-pf-skel-line--short" />
        </div>
      ))}
    </div>
  );
}

export function PortfolioHero({ lang }: { lang: string }) {
  const t = usePfT();
  const { t: tf } = useAppTranslations('fx');
  const head = useFx(lang).page('portfolio');
  return (
    <PageHero
      title={head.title || t('title')}
      description={head.lede || t('lede')}
      badge={head.eyebrow || t('eyebrow')}
      crumbs={[
        { label: tf('nav.home'), href: `/${lang}` },
        { label: t('crumb'), href: `/${lang}/portfolio` },
      ]}
    />
  );
}

export default function PortfolioTemplate({ lang, items, categories, loadError = false }: PortfolioTemplateProps) {
  const t = usePfT();
  const { t: tf } = useAppTranslations('fx');
  const { filters, setFilters, filteredProjects, totalResults, availableTechnologies } = usePortfolioFilters(items, categories);

  // Yalnızca en az bir projede kullanılan kategoriler çip olur (seçili olanlar her zaman görünür)
  const usedCategories = useMemo(() => {
    const used = new Set(items.flatMap((p) => p.categories.map((c) => c.slug)));
    const list = categories.filter((c) => used.has(c.slug) || filters.categories.includes(c.slug));
    // Kategori listesinde olmayan ama projede adı geçenler (eski tek alan)
    items.forEach((p) => p.categories.forEach((c) => { if (!list.some((x) => x.slug === c.slug)) list.push(c); }));
    return list;
  }, [items, categories, filters.categories]);

  // Filtre değişince sayfalama başa döner
  const filterKey = JSON.stringify(filters);
  const [pageState, setPageState] = useState({ key: filterKey, count: PAGE_SIZE });
  if (pageState.key !== filterKey) setPageState({ key: filterKey, count: PAGE_SIZE });
  const visible = filteredProjects.slice(0, pageState.count);
  const spans = masonrySpans(visible.length);

  return (
    <>
      <PortfolioHero lang={lang} />
      <BreadcrumbsJsonLd
        items={[
          { name: tf('nav.home'), item: `/${lang}` },
          { name: t('crumb'), item: `/${lang}/portfolio` },
        ]}
      />

      <section className="fx-sec fx-pf-list" aria-labelledby="fx-pf-list-title">
        <div className="fx-wrap">
          <h2 id="fx-pf-list-title" className="sr-only">{t('listTitle')}</h2>

          {loadError ? (
            <div className="fx-empty fx-pf-empty" role="alert">
              <b>{t('error')}</b>
              <span>{t('errorBody')}</span>
              <a className="fx-btn fx-btn--ghost fx-btn--sm" href={`/${lang}/portfolio`}>{t('retry')}</a>
            </div>
          ) : items.length === 0 ? (
            <div className="fx-empty fx-pf-empty">
              <b>{t('empty')}</b>
              <span>{t('emptyBody')}</span>
              <Link className="fx-link" href={`/${lang}/contact`}>
                {tf('nav.quote')} <ArrowRight />
              </Link>
            </div>
          ) : (
            <>
              <PortfolioFilters
                categories={usedCategories}
                technologies={availableTechnologies}
                filters={filters}
                onFiltersChange={setFilters}
                totalResults={totalResults}
              />

              {visible.length === 0 ? (
                <div className="fx-empty fx-pf-empty">
                  <b>{t('noResults')}</b>
                  <span>{t('noResultsBody')}</span>
                  <button
                    type="button"
                    className="fx-btn fx-btn--ghost fx-btn--sm"
                    onClick={() => setFilters({ ...EMPTY_FILTERS, sortBy: filters.sortBy, sortOrder: filters.sortOrder })}
                  >
                    {t('filters.clear')}
                  </button>
                </div>
              ) : (
                <div className="fx-works" id="fx-pf-grid">
                  {visible.map((p, i) => (
                    <WorkCard key={p._id} data={toProjectCard(p, lang)} span={spans[i]} priority={i < 2} />
                  ))}
                </div>
              )}

              {filteredProjects.length > visible.length && (
                <div className="fx-pf-more-row">
                  <span className="fx-tag">{t('shown', { shown: visible.length, total: filteredProjects.length })}</span>
                  <button
                    type="button"
                    className="fx-btn fx-btn--ghost"
                    aria-controls="fx-pf-grid"
                    onClick={() => setPageState((s) => ({ ...s, count: s.count + PAGE_SIZE }))}
                  >
                    {t('showMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <QuoteBand lang={lang} />
    </>
  );
}
