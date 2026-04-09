'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  MagnifyingGlass,
  X,
  Sparkle,
  ArrowRight,
  FunnelSimple,
  SortAscending,
  CaretDown,
  Cube,
} from '@phosphor-icons/react';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageHero from '@/components/common/PageHero';
import EyebrowTag from '@/components/ui/EyebrowTag';
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: DURATION, delay, ease: EASING }}
      className={className}
    >
      {children}
    </motion.div>
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
        className="relative px-4 py-2 rounded-2xl text-sm font-medium transition-colors"
        style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        {allActive && (
          <motion.div
            layoutId="category-indicator"
            className="absolute inset-0 rounded-2xl bg-[#003450]"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <span className={`relative z-10 ${allActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-800'}`}>
          Tumunu Goster
        </span>
      </button>

      {categories.map((cat) => {
        const isActive = activeCategories.includes(cat.slug);
        return (
          <button
            key={cat._id}
            onClick={() => onToggle(cat.slug)}
            className="relative px-4 py-2 rounded-2xl text-sm font-medium transition-colors"
            style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            {isActive && (
              <motion.div
                layoutId="category-indicator"
                className="absolute inset-0 rounded-2xl bg-[#003450]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-800'}`}>
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
          <div className="rounded-3xl border border-zinc-200/60 bg-zinc-100/40 p-1.5">
            <div className="rounded-[20px] overflow-hidden bg-white border border-zinc-100">
              <div className={`${i % 3 === 0 ? 'aspect-[16/9]' : 'aspect-[3/2]'} bg-zinc-100`} />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-zinc-100 rounded-lg w-3/4" />
                <div className="h-4 bg-zinc-100 rounded-lg w-full" />
                <div className="h-3 bg-zinc-100 rounded-lg w-1/2" />
              </div>
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
    description: props.heroData?.description || 'Tamamladigimiz basarili projeler ve yaratici cozumler',
    buttonText: props.heroData?.buttonText || 'Projeleri Incele',
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h3 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-zinc-800 mb-4">
            Bir Hata Olustu
          </h3>
          <p className="text-zinc-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <PageHero
        title={hero.title}
        description={hero.description}
        buttonText={hero.buttonText}
        buttonLink={hero.buttonLink}
        showButton={true}
      />

      {/* Breadcrumbs */}
      <section className="container-content py-3">
        <Breadcrumbs />
      </section>

      {/* Projects section */}
      <section id="projects" className="py-8 md:py-12">
        <div className="container-content">
          {/* Section header */}
          <ScrollReveal className="mb-8 md:mb-10">
            <EyebrowTag>Projeler</EyebrowTag>
            <h2 className="font-[family-name:var(--font-geist-sans)] text-2xl md:text-3xl font-semibold text-zinc-800 mt-4 tracking-tight">
              Calisma Galeri
            </h2>
            <p className="text-zinc-500 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
              Farkli sektorlerden tamamladigimiz projeler ve yaratici cozumler.
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
                <MagnifyingGlass weight="light" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Proje ara..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-12 pr-10 py-3 bg-white rounded-2xl border border-zinc-200 text-zinc-700 placeholder-zinc-400 outline-none transition-all font-[family-name:var(--font-geist-sans)] text-sm focus:border-[#003450]/40 focus:ring-2 focus:ring-[#003450]/10"
                  style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: '' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 transition-colors"
                  >
                    <X weight="light" className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <SortAscending weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                    setFilters({ ...filters, sortBy, sortOrder });
                  }}
                  className="appearance-none pl-9 pr-9 py-3 bg-white rounded-2xl border border-zinc-200 text-zinc-700 text-sm font-[family-name:var(--font-geist-sans)] outline-none cursor-pointer transition-all focus:border-[#003450]/40 focus:ring-2 focus:ring-[#003450]/10"
                  style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  aria-label="Sirala"
                >
                  <option value="newest-desc">En Yeni</option>
                  <option value="oldest-asc">En Eski</option>
                  <option value="title-asc">A-Z</option>
                  <option value="title-desc">Z-A</option>
                  <option value="category-asc">Kategoriye Gore</option>
                </select>
                <CaretDown weight="light" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>

              {/* Advanced toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
                  showAdvanced || activeFiltersCount > 0
                    ? 'bg-[#003450] text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
                style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                aria-expanded={showAdvanced}
              >
                <FunnelSimple weight="light" className="w-4 h-4" />
                Filtreler
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced filters panel */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: EASING }}
                  className="overflow-hidden"
                >
                  <div className="pt-5 mt-5 border-t border-zinc-200/60">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Categories */}
                      <div>
                        <h4 className="font-[family-name:var(--font-geist-sans)] text-sm font-semibold text-zinc-700 mb-3">Kategoriler</h4>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {categories.map((cat: any) => (
                            <label key={cat._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={filters.categories.includes(cat.slug)}
                                onChange={() => handleCategoryMultiToggle(cat.slug)}
                                className="w-4 h-4 rounded border-zinc-300 text-[#003450] focus:ring-[#003450]/30"
                              />
                              <span className="text-sm text-zinc-600">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h4 className="font-[family-name:var(--font-geist-sans)] text-sm font-semibold text-zinc-700 mb-3">Teknolojiler</h4>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {availableTechnologies.map((tech) => (
                            <label key={tech} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={filters.technologies.includes(tech)}
                                onChange={() => handleTechToggle(tech)}
                                className="w-4 h-4 rounded border-zinc-300 text-[#003450] focus:ring-[#003450]/30"
                              />
                              <span className="font-[family-name:var(--font-geist-mono)] text-sm text-zinc-600">{tech}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Date range */}
                      <div>
                        <h4 className="font-[family-name:var(--font-geist-sans)] text-sm font-semibold text-zinc-700 mb-3">Tarih Araligi</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1.5">Baslangic</label>
                            <input
                              type="date"
                              value={filters.dateRange.start}
                              onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                              className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 outline-none focus:border-[#003450]/40 focus:ring-2 focus:ring-[#003450]/10 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1.5">Bitis</label>
                            <input
                              type="date"
                              value={filters.dateRange.end}
                              onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                              className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 outline-none focus:border-[#003450]/40 focus:ring-2 focus:ring-[#003450]/10 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count + clear */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200/40">
              <span className="font-[family-name:var(--font-geist-mono)] text-xs text-zinc-400">
                {totalResults} proje bulundu
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-[#003450] hover:text-[#003450]/80 font-medium transition-colors"
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
              <motion.div
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
              </motion.div>
            ) : portfolioItems.length > 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION, ease: EASING }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MagnifyingGlass weight="light" className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-zinc-800 mb-3">
                  Arama Sonucu Bulunamadi
                </h3>
                <p className="text-zinc-500 max-w-md mx-auto mb-5 text-sm">
                  Arama kriterlerinize uygun proje bulunamadi. Filtreleri degistirmeyi veya temizlemeyi deneyin.
                </p>
                <button onClick={clearAll} className="px-5 py-2.5 rounded-2xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 transition-colors">
                  Filtreleri Temizle
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-24 bg-[#003450] relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />

        <div className="container-content text-center relative z-10">
          <ScrollReveal>
            <EyebrowTag variant="light">Birlikte Calisalim</EyebrowTag>
            <h2 className="font-[family-name:var(--font-geist-sans)] text-2xl md:text-4xl font-semibold text-white mt-5 mb-4 tracking-tight">
              Projenizi Birlikte Gerceklestirelim
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8 text-sm md:text-base leading-relaxed">
              Portfolyomuzdeki projeler gibi sizin de fikirlerinizi hayata gecirmeye haziriz.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#003450] rounded-2xl text-sm font-semibold hover:bg-zinc-100 transition-colors"
                style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              >
                <Sparkle weight="light" className="w-4 h-4" />
                Proje Baslatalim
              </Link>
              <Link
                href={`/${lang}/services`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-white rounded-2xl text-sm font-medium hover:bg-white/10 transition-colors"
                style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              >
                Hizmetlerimizi Inceleyin
                <ArrowRight weight="light" className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
