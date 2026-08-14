'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { Check as CheckIcon } from 'lucide-react';
import { PortfolioItem } from '@/types/portfolio';
import PortfolioDetailTemplate from '@/templates/PortfolioDetailTemplate';
import { MeasureRule } from '@/components/ui';
import PortfolioMediaGallery from '@/components/portfolio/PortfolioMediaGallery';
import Portfolio3DFiles from '@/components/portfolio/Portfolio3DFiles';
import ModernProjectGrid from '@/components/portfolio/ModernProjectGrid';
import HTMLContent from '@/components/HTMLContent';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import PortfolioJsonLd from '@/components/seo/PortfolioJsonLd';
import { SITE_URL } from '@/lib/seo-utils';

interface Props {
  portfolioItem: PortfolioItem;
  relatedProjects: PortfolioItem[];
  slug: string;
  lang?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function PortfolioDetailClient({ portfolioItem, relatedProjects, slug, lang = 'tr' }: Props) {
  const allImages = portfolioItem.coverImage
    ? [portfolioItem.coverImage, ...(portfolioItem.images || []).filter(img => img !== portfolioItem.coverImage)]
    : (portfolioItem.images || []);

  const safeDescription = (() => {
    const desc = portfolioItem.description || '';
    let result = '';
    let inTag = false;
    for (let i = 0; i < desc.length; i++) {
      if (desc[i] === '<') { inTag = true; continue; }
      if (desc[i] === '>') { inTag = false; continue; }
      if (!inTag) result += desc[i];
    }
    return result.slice(0, 200);
  })();

  return (
    <PortfolioDetailTemplate
      title={portfolioItem.title}
      eyebrow={portfolioItem.featured ? 'Öne Çıkan Proje' : undefined}
    >
      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: `/${lang}` },
          { name: 'Portföy', item: `/${lang}/portfolio` },
          { name: portfolioItem.title, item: `/${lang}/portfolio/${slug}` },
        ]}
      />
      <PortfolioJsonLd
        name={portfolioItem.title}
        description={safeDescription}
        url={`${SITE_URL}/tr/portfolio/${slug}`}
        images={allImages}
        baseUrl={SITE_URL}
      />

      <section className="relative z-10 py-10 md:py-14">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 space-y-12">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="rounded-sm overflow-hidden border border-border bg-surface-primary shadow-[var(--shadow-md)]"
              >
                <PortfolioMediaGallery
                  images={portfolioItem.images || []}
                  models3D={portfolioItem.models3D || []}
                  title={portfolioItem.title}
                  coverImage={portfolioItem.coverImage}
                />
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              >
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Proje Detayları</h2>
                  <MeasureRule ticks="normal" className="mt-4" />
                </div>
                <div className="rounded-sm border border-border bg-card p-6 md:p-8 lg:p-10">
                  <div className="prose prose-lg max-w-none
                    prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-a:text-accent-foreground prose-a:hover:text-accent-foreground
                    prose-strong:text-foreground
                    prose-li:text-muted-foreground">
                    <HTMLContent content={portfolioItem.description} className="leading-relaxed" />
                  </div>
                </div>
              </m.div>

              {portfolioItem.models3D && portfolioItem.models3D.length > 0 && (
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
                  className="rounded-sm border border-border bg-surface-primary p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-3">3D Modeller</h3>
                  <MeasureRule ticks="sparse" className="mb-4" />
                  <Portfolio3DFiles models3D={portfolioItem.models3D} />
                </m.div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                className="lg:sticky lg:top-24 space-y-6"
              >
                <div className="rounded-sm border border-border bg-surface-primary p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-foreground tracking-tight mb-4">Proje Bilgileri</h3>
                  <MeasureRule ticks="sparse" className="mb-1" />
                  {/* Monospace spec tablosu — hairline satır ayraçları */}
                  <dl className="divide-y divide-border">
                    {portfolioItem.client && (
                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Müşteri</dt>
                        <dd className="text-right text-sm font-medium text-foreground">{portfolioItem.client}</dd>
                      </div>
                    )}
                    {portfolioItem.completionDate && (
                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Tarih</dt>
                        <dd className="text-right font-mono text-sm text-foreground tabular-nums">
                          {new Date(portfolioItem.completionDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </dd>
                      </div>
                    )}
                    {(portfolioItem.category || (portfolioItem.categories && portfolioItem.categories.length > 0)) && (
                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Kategori</dt>
                        <dd className="text-right text-sm font-medium text-foreground">
                          {portfolioItem.categories && portfolioItem.categories.length > 0
                            ? portfolioItem.categories.map(cat => cat.name).join(', ')
                            : portfolioItem.category?.name || 'Genel'}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Durum</dt>
                      <dd>
                        <span className="inline-flex items-center rounded-xs border border-success/30 bg-success/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-success">
                          <CheckIcon className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                          Tamamlandı
                        </span>
                      </dd>
                    </div>
                    {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
                      <div className="py-3">
                        <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-3">Kullanılan Teknolojiler</dt>
                        <dd className="flex flex-wrap gap-2">
                          {portfolioItem.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="rounded-xs border border-border bg-secondary px-2.5 py-1 font-mono text-[11px] text-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-sm p-6 md:p-8 text-center border border-primary/30 bg-card">
                  <div className="relative z-10">
                    <h4 className="text-xl font-semibold mb-3 text-foreground tracking-tight">Benzer Bir Projeniz mi Var?</h4>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      Sizin için de benzer bir çözüm üretebiliriz. Detayları konuşmak için iletişime geçin.
                    </p>
                    <Link
                      href={`/${lang}/contact`}
                      className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-xs hover:bg-primary/90 transition-colors duration-200 active:scale-[0.98] shadow-[var(--shadow-sm)] motion-reduce:transition-none"
                    >
                      Teklif Alın
                    </Link>
                  </div>
                </div>
              </m.div>
            </div>
          </div>

          {relatedProjects.length > 0 && (
            <div className="mt-20 md:mt-28 pt-14 border-t border-border">
              <div className="section-header">
                <h2 className="section-title text-foreground">Benzer Projeler</h2>
                <p className="section-subtitle">Aynı kategoriden ilginizi çekebilecek diğer çalışmalarımız</p>
              </div>
              <div className="mb-12">
                <ModernProjectGrid
                  projects={relatedProjects.map(p => ({
                    id: p._id,
                    slug: p.slug,
                    title: p.title || '',
                    description: p.description || '',
                    coverImage: p.coverImage || '',
                    category: p.categories && p.categories.length > 0
                      ? p.categories.map(cat => cat.name).join(', ')
                      : p.category?.name || 'Genel',
                    client: p.client,
                    completionDate: p.completionDate,
                    technologies: p.technologies,
                    featured: p.featured
                  }))}
                  layout="grid"
                />
              </div>
              <div className="text-center">
                <Link href={`/${lang}/portfolio`} className="btn-outline">Tüm Portföyü Görüntüle</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </PortfolioDetailTemplate>
  );
}
