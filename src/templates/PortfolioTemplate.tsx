'use client';

import { useState, useMemo, useRef } from 'react';
import { m, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Search as MagnifyingGlass, X, Sparkles as Sparkle, ArrowRight, Filter as FunnelSimple, ArrowUpNarrowWide as SortAscending, ChevronDown as CaretDown } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import { TechLabel } from '@/components/ui';
import ModernProjectCard from '@/components/portfolio/ModernProjectCard';
import { usePortfolioFilters } from '@/hooks/usePortfolioFilters';
import { useLocale } from '@/hooks/useLocale';

const EASING: [number, number, number, number] = [0.32, 0.72, 0, 1];
const DURATION = 0.7;

/* ------------------------------------------------------------------ */
/*  ScrollReveal wrapper                                               */
/* ------------------------------------------------------------------ */
function ScrollReveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReduced = useReducedMotion();

  return (
    <m.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 32, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : (prefersReduced ? { opacity: 1 } : { opacity: 0, y: 32, filter: 'blur(4px)' })}
      transition={{ duration: prefersReduced ? 0.01 : DURATION, delay: prefersReduced ? 0 : delay, ease: EASING }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Masonry span assignment                                            */
/* ------------------------------------------------------------------ */
function getSpanPattern(index: number, total: number): { colSpan: string; span: 'sm' | 'md' | 'lg' } {
  if (total <= 2) return { colSpan: 'md:col-span-6', span: 'md' };

  const pos = index % 6;
  switch (pos) {
    case 0: return { colSpan: 'md:col-span-8', span: 'lg' };
    case 1: return { colSpan: 'md:col-span-4', span: 'sm' };
    case 2: return { colSpan: 'md:col-span-4', span: 'sm' };
    case 3: return { colSpan: 'md:col-span-8', span: 'lg' };
    case 4: return { colSpan: 'md:col-span-6', span: 'md' };
    case 5: return { colSpan: 'md:col-span-6', span: 'md' };
    default: return { colSpan: 'md:col-span-6', span: 'md' };
  }
}

/* ------------------------------------------------------------------ */
/*  Category filter bar with spring-animated indicator                  */
/* ------------------------------------------------------------------ */
function CategoryFilterBar({ categories, activeCategories, onToggle }: {
  categories: { _id: string; name: string; slug: string }[];
  activeCategories: string[];
  onToggle: (slug: string) => void;
}) {
  const allActive = activeCategories.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => {
          if (!allActive) onToggle('__all__');
        }}
        className="group relative px-4 py-1.5 rounded-xs text-sm font-medium transition-colors duration-200 bg-secondary hover:bg-accent motion-reduce:transition-none"
      >
        {allActive && (
          <m.div
            layoutId="category-indicator"
            className="absolute inset-0 rounded-xs bg-primary"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <span className={`relative z-10 ${allActive ? 'text-primary-foreground' : 'text-secondary-foreground group-hover:text-accent-foreground'}`}>
          Tümünü Göster
        </span>
      </button>

      {categories.map((cat) => {
        const isActive = activeCategories.includes(cat.slug);
        return (
          <button
            key={cat._id}
            onClick={() => onToggle(cat.slug)}
            className="group relative px-4 py-1.5 rounded-xs text-sm font-medium transition-colors duration-200 bg-secondary hover:bg-accent motion-reduce:transition-none"
          >
            {isActive && (
              <m.div
                layoutId="category-indicator"
                className="absolute inset-0 rounded-xs bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-primary-foreground' : 'text-secondary-foreground group-hover:text-accent-foreground'}`}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */
function MasonrySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {[8, 4, 4, 8, 6, 6].map((span, i) => (
        <div key={i} className={`md:col-span-${span} animate-pulse`}>
          <div className="rounded-sm overflow-hidden bg-card border border-border">
            <div className={`${i % 3 === 0 ? 'aspect-[16/9]' : 'aspect-[3/2]'} bg-surface-tertiary`} />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-surface-tertiary rounded-xs w-3/4" />
              <div className="h-4 bg-surface-tertiary rounded-xs w-full" />
              <div className="h-3 bg-surface-tertiary rounded-xs w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Main Template                                                      */
/* ================================================================== */
export default function PortfolioTemplate(props: any) {
  const lang = useLocale();
  const portfolioItems = props.items || [];
  const categories = props.categories || [];
  const loading = false;
  const error = null;

  const hero = {
    title: props.heroData?.title || props.title || 'Portfolyo',
    description: props.heroData?.description || 'Tamamladığımız başarılı projeler ve yaratıcı çözümler',
    buttonText: props.heroData?.buttonText || 'Projeleri İncele',
    buttonLink: props.heroData?.buttonLink || '#projects',
  };

  const {
    filters,
    setFilters,
    filteredProjects,
    totalResults,
    availableTechnologies,
  } = usePortfolioFilters(portfolioItems, categories, loading);

  const [searchFocused, setSearchFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCategoryToggle = (slug: string) => {
    if (slug === '__all__') {
      setFilters({ ...filters, categories: [] });
      return;
    }
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [slug]; // single-select for the pill bar; multi-select in advanced
    setFilters({ ...filters, categories: next });
  };

  const handleCategoryMultiToggle = (slug: string) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    setFilters({ ...filters, categories: next });
  };

  const handleTechToggle = (tech: string) => {
    const next = filters.technologies.includes(tech)
      ? filters.technologies.filter((t) => t !== tech)
      : [...filters.technologies, tech];
    setFilters({ ...filters, technologies: next });
  };

  const clearAll = () => {
    setFilters({
      search: '',
      categories: [],
      technologies: [],
      dateRange: { start: '', end: '' },
      sortBy: 'newest',
      sortOrder: 'desc',
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.categories.length > 0,
    filters.technologies.length > 0,
    filters.dateRange.start || filters.dateRange.end,
  ].filter(Boolean).length;

  /* Map filtered projects for the card interface */
  const mappedProjects = useMemo(() => {
    return filteredProjects.map((item: any) => ({
      id: item._id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      coverImage: item.coverImage,
      category: (() => {
        if (item.categoryIds && Array.isArray(item.categoryIds) && item.categoryIds.length > 0) {
          return item.categoryIds.map((cat: any) => (typeof cat === 'object' ? cat.name : cat) || cat).join(', ');
        }
        if (item.categoryId && typeof item.categoryId === 'object' && 'name' in item.categoryId) {
          return item.categoryId.name;
        }
        if (item.categoryId && typeof item.categoryId === 'string') {
          const found = categories.find((cat: any) => cat._id === item.categoryId);
          return found?.name || 'Genel';
        }
        const legacy = item.categories;
        if (legacy && Array.isArray(legacy) && legacy.length > 0) {
          return legacy.map((cat: any) => (typeof cat === 'object' ? cat.name : cat) || cat).join(', ');
        }
        if (item.category?.name) return item.category.name;
        return 'Genel';
      })(),
      client: item.client,
      completionDate: item.completionDate,
      technologies: item.technologies,
      featured: item.featured,
      models3D: item.models3D,
    }));
  }, [filteredProjects, categories]);

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Bir Hata Oluştu
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Hero */}
      <PageHero
        title={hero.title}
        description={hero.description}
        buttonText={hero.buttonText}
        buttonLink={hero.buttonLink}
        showButton={true}
        showBreadcrumbs={true}
        index={2}
      />

      {/* Projects section */}
      <section id="projects" className="py-8 md:py-12">
        <div className="container-content">
          {/* Section header */}
          <ScrollReveal className="mb-8 md:mb-10">
            <TechLabel as="p" index={1} marker="crosshair">Projeler</TechLabel>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mt-4 tracking-tight">
              Çalışma Galerisi
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base leading-relaxed">
              Farklı sektörlerden tamamladığımız projeler ve yaratıcı çözümler.
            </p>
          </ScrollReveal>

          {/* Filter system */}
          <ScrollReveal delay={0.1} className="mb-8">
            {/* Category pills */}
            <div className="mb-5">
              <CategoryFilterBar
                categories={categories}
                activeCategories={filters.categories}
                onToggle={handleCategoryToggle}
              />
            </div>

            {/* Search + sort + advanced toggle row */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Proje ara..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-12 pr-10 py-3 bg-background rounded-xs border border-input text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] duration-200 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: '' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-xs hover:bg-accent transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <SortAscending className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                    setFilters({ ...filters, sortBy, sortOrder });
                  }}
                  className="appearance-none pl-9 pr-9 py-3 bg-background rounded-xs border border-input text-foreground text-sm outline-none cursor-pointer transition-[border-color,box-shadow] duration-200 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  aria-label="Sırala"
                >
                  <option value="newest-desc">En Yeni</option>
                  <option value="oldest-asc">En Eski</option>
                  <option value="title-asc">A-Z</option>
                  <option value="title-desc">Z-A</option>
                  <option value="category-asc">Kategoriye Göre</option>
                </select>
                <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Advanced toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xs text-sm font-medium transition-colors duration-200 motion-reduce:transition-none ${
                  showAdvanced || activeFiltersCount > 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
                aria-expanded={showAdvanced}
              >
                <FunnelSimple className="w-4 h-4" />
                Filtreler
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-xs bg-primary-foreground/20 font-mono font-semibold tabular-nums">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced filters panel */}
            <AnimatePresence>
              {showAdvanced && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: EASING }}
                  className="overflow-hidden"
                >
                  <div className="pt-5 mt-5 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Categories */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Kategoriler</h4>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {categories.map((cat: any) => (
                            <label key={cat._id} className="flex items-center gap-2.5 p-2 rounded-xs hover:bg-accent cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={filters.categories.includes(cat.slug)}
                                onChange={() => handleCategoryMultiToggle(cat.slug)}
                                className="w-4 h-4 rounded border-input text-accent-foreground focus:ring-ring"
                              />
                              <span className="text-sm text-foreground">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Teknolojiler</h4>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {availableTechnologies.map((tech) => (
                            <label key={tech} className="flex items-center gap-2.5 p-2 rounded-xs hover:bg-accent cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={filters.technologies.includes(tech)}
                                onChange={() => handleTechToggle(tech)}
                                className="w-4 h-4 rounded border-input text-accent-foreground focus:ring-ring"
                              />
                              <span className="font-mono text-sm text-foreground">{tech}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Date range */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Tarih Aralığı</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1.5">Başlangıç</label>
                            <input
                              type="date"
                              value={filters.dateRange.start}
                              onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                              className="w-full px-3 py-2.5 bg-background border border-input rounded-xs text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1.5">Bitiş</label>
                            <input
                              type="date"
                              value={filters.dateRange.end}
                              onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                              className="w-full px-3 py-2.5 bg-background border border-input rounded-xs text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            {/* Results count + clear */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
                {totalResults} proje bulundu
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-accent-foreground hover:text-accent-foreground font-medium transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </ScrollReveal>

          {/* Masonry grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <MasonrySkeleton />
            ) : mappedProjects.length > 0 ? (
              <m.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASING }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5"
              >
                {mappedProjects.map((project: any, index: number) => {
                  const { colSpan, span } = getSpanPattern(index, mappedProjects.length);
                  return (
                    <div key={project.id} className={`col-span-1 ${colSpan}`}>
                      <ModernProjectCard
                        project={project}
                        index={index}
                        span={span}
                      />
                    </div>
                  );
                })}
              </m.div>
            ) : portfolioItems.length > 0 ? (
              <m.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION, ease: EASING }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-surface-secondary border border-border rounded-sm flex items-center justify-center mx-auto mb-5">
                  <MagnifyingGlass className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Arama Sonucu Bulunamadı
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-5 text-sm">
                  Arama kriterlerinize uygun proje bulunamadı. Filtreleri değiştirmeyi veya temizlemeyi deneyin.
                </p>
                <button onClick={clearAll} className="px-5 py-2.5 rounded-xs border border-border bg-card text-sm font-medium text-muted-foreground hover:border-primary hover:text-accent-foreground transition-colors">
                  Filtreleri Temizle
                </button>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
        {/* Ambient background — token tabanlı, tema bağımsız aksan yüzeyi */}
        <div
          className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary-foreground))_0%,transparent_50%),radial-gradient(circle_at_80%_50%,hsl(var(--primary-foreground))_0%,transparent_50%)]"
          aria-hidden="true"
        />

        <div className="container-content text-center relative z-10">
          <ScrollReveal>
            <TechLabel as="p" marker="tick" className="justify-center text-primary-foreground/80 [&>span[aria-hidden]]:bg-primary-foreground">Birlikte Çalışalım</TechLabel>
            <h2 className="text-2xl md:text-4xl font-semibold text-primary-foreground mt-5 mb-4 tracking-tight">
              Projenizi Birlikte Gerçekleştirelim
            </h2>
            <p className="text-primary-foreground/75 max-w-lg mx-auto mb-8 text-sm md:text-base leading-relaxed">
              Portfolyomuzdeki projeler gibi sizin de fikirlerinizi hayata geçirmeye hazırız.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-foreground text-primary rounded-xs text-sm font-semibold hover:bg-primary-foreground/90 transition-colors duration-200 motion-reduce:transition-none"
              >
                <Sparkle className="w-4 h-4" />
                Proje Başlatalım
              </Link>
              <Link
                href={`/${lang}/services`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-primary-foreground/30 text-primary-foreground rounded-xs text-sm font-medium hover:bg-primary-foreground/10 transition-colors duration-200 motion-reduce:transition-none"
              >
                Hizmetlerimizi İnceleyin
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
