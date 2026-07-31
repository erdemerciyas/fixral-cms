'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ModernProjectCard from './ModernProjectCard';
import EyebrowTag from '@/components/ui/EyebrowTag';
import type { PortfolioItem } from '../../types/portfolio';

interface HomePortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  isLoading?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
  },
};

export default function HomePortfolioSection({
  portfolioItems,
  isLoading = false
}: HomePortfolioSectionProps) {
  const pathname = usePathname() || '';
  const currentLang = ['tr', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

  const featuredProjects = portfolioItems.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-24 md:py-32 lg:py-40 bg-surface-secondary/50">
        <div className="container-boxed">
          <div className="mb-16">
            <div className="w-24 h-6 rounded-full bg-muted animate-pulse mb-5" />
            <div className="w-80 h-10 rounded-lg bg-muted animate-pulse mb-4" />
            <div className="w-64 h-5 rounded bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm border border-border bg-card overflow-hidden"
              >
                <div className="aspect-4/3 w-full bg-secondary animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-secondary animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProjects.length) {
    return (
      <section className="py-24 md:py-32 lg:py-40 bg-surface-secondary/50">
        <div className="container-boxed">
          <div className="mb-16">
            <EyebrowTag className="mb-5">Portfolyo</EyebrowTag>
            <h2 className="section-title text-foreground mb-4">
              Öne Çıkan Projelerimiz
            </h2>
            <p className="section-subtitle">
              Tamamladığımız başarılı projelerden örnekler.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-sm flex items-center justify-center mb-6 border border-border bg-accent">
              <ArrowRight size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Projeler Yükleniyor
            </h3>
            <p className="text-muted-foreground text-sm">
              Yakında burada örnek projelerimizi görebileceksiniz.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 lg:py-40 bg-surface-secondary/50 relative overflow-hidden">
      <div className="container-boxed relative z-10">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mb-16 md:mb-20"
        >
          <EyebrowTag className="mb-5">Portfolyo</EyebrowTag>
          <h2
            className="text-3xl md:text-5xl font-bold text-foreground mb-4"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Öne Çıkan Projelerimiz
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Tamamladığımız başarılı projelerden örnekler. Kalite ve yenilik odaklı
            çalışmalarımızı keşfedin.
          </p>
        </m.div>

        {/* Printables kart grid: mobil 2 / tablet 3 kolon */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {featuredProjects.map((item, index) => {
            return (
              <m.div
                key={item._id}
                variants={itemVariants}
                className="h-full"
              >
                <ModernProjectCard
                  project={{
                    id: item._id,
                    slug: item.slug,
                    title: item.title,
                    description: item.description,
                    coverImage: item.coverImage,
                    category: item.categories && item.categories.length > 0
                      ? item.categories.map(cat => cat.name).join(', ')
                      : item.category?.name || 'Genel',
                    client: item.client,
                    completionDate: item.completionDate,
                    technologies: item.technologies,
                    featured: item.featured
                  }}
                  index={index}
                  layout="grid"
                />
              </m.div>
            );
          })}
        </m.div>

        {/* View All + Stats */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          <Link
            href={`/${currentLang}/portfolio`}
            className="group inline-flex items-center gap-3 rounded-lg font-medium text-sm active:scale-[0.98] py-3 pl-6 pr-2 border border-border bg-card text-foreground hover:border-primary hover:text-accent-foreground transition-colors duration-200 motion-reduce:transition-none"
          >
            <span>Tüm Projeleri Görüntüle</span>
            <span className="w-8 h-8 rounded-full flex items-center justify-center bg-accent">
              <ArrowRight
                size={14}
                className="text-accent-foreground transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </Link>

          {/* Stats row */}
          <div className="flex items-center gap-8 md:gap-12">
            <div>
              <div className="text-2xl font-bold text-foreground font-mono" style={{ letterSpacing: '-0.02em' }}>
                {portfolioItems.length}+
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Tamamlanan Proje</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-2xl font-bold text-foreground font-mono" style={{ letterSpacing: '-0.02em' }}>
                {new Date().getFullYear() - 2020}+
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Yıllık Deneyim</div>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
