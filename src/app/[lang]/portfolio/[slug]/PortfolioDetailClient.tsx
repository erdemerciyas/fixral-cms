'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { Check as CheckIcon } from 'lucide-react';
import { PortfolioItem } from '@/types/portfolio';
import PageHero from '@/components/common/PageHero';
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
    <div className="min-h-dvh bg-background">
      <PageHero
        title={portfolioItem.title}
        showButton={false}
        variant="compact"
        showBreadcrumbs={true}
        featuredBadge={portfolioItem.featured ? 'Öne Çıkan Proje' : undefined}
      />

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
                className="rounded-2xl overflow-hidden border border-border bg-surface-primary shadow-[0_8px_40px_hsl(var(--shadow-color)/0.35)]"
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
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight shrink-0">Proje Detayları</h2>
                  <div className="h-px flex-1 bg-linear-to-l from-primary/30 to-transparent" />
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8 lg:p-10">
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
                  className="rounded-2xl border border-border bg-surface-primary p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">3D Modeller</h3>
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
                <div className="rounded-2xl border border-border bg-surface-primary p-6 md:p-8 relative overflow-hidden group">
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)' }}
                    aria-hidden="true"
                  />
                  <h3 className="relative text-xl font-semibold text-foreground tracking-tight mb-6 pb-4 border-b border-border">Proje Bilgileri</h3>
                  <dl className="relative space-y-6">
                    {portfolioItem.client && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">Müşteri</dt>
                        <dd className="text-base font-semibold text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                          {portfolioItem.client}
                        </dd>
                      </div>
                    )}
                    {portfolioItem.completionDate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">Tarih</dt>
                        <dd className="text-base font-semibold text-foreground font-mono">
                          {new Date(portfolioItem.completionDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </dd>
                      </div>
                    )}
                    {(portfolioItem.category || (portfolioItem.categories && portfolioItem.categories.length > 0)) && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">Kategori</dt>
                        <dd className="text-base font-semibold text-foreground">
                          {portfolioItem.categories && portfolioItem.categories.length > 0
                            ? portfolioItem.categories.map(cat => cat.name).join(', ')
                            : portfolioItem.category?.name || 'Genel'}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-1">Durum</dt>
                      <dd>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <CheckIcon className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                          Tamamlandı
                        </span>
                      </dd>
                    </div>
                    {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <dt className="text-sm font-medium text-muted-foreground mb-3">Kullanılan Teknolojiler</dt>
                        <dd className="flex flex-wrap gap-2">
                          {portfolioItem.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-accent text-primary border border-border rounded-lg text-xs font-semibold font-mono hover:bg-accent transition-colors duration-200 cursor-default"
                            >
                              {tech}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-2xl p-6 md:p-8 text-center relative overflow-hidden border border-primary/30 bg-linear-to-br from-primary/20 via-primary/12 to-primary/15">
                  <div
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)' }}
                    aria-hidden="true"
                  />
                  <div className="relative z-10">
                    <h4 className="text-xl font-semibold mb-3 text-foreground tracking-tight">Benzer Bir Projeniz mi Var?</h4>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      Sizin için de benzer bir çözüm üretebiliriz. Detayları konuşmak için iletişime geçin.
                    </p>
                    <Link
                      href={`/${lang}/contact`}
                      className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-[hsl(var(--primary)/0.85)] transition-colors duration-200 active:scale-[0.98] shadow-[0_8px_30px_hsl(var(--primary)/0.35)]"
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
    </div>
  );
}
