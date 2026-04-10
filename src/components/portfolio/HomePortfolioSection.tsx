'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
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
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
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
      <section className="py-24 md:py-32 lg:py-40 bg-zinc-50/50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-16">
            <div className="w-24 h-6 rounded-full bg-zinc-200 animate-pulse mb-5" />
            <div className="w-80 h-10 rounded-lg bg-zinc-200 animate-pulse mb-4" />
            <div className="w-64 h-5 rounded bg-zinc-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`${i < 2 ? 'md:col-span-6' : 'md:col-span-4'} rounded-3xl bg-zinc-100 animate-pulse`}
                style={{ height: i < 2 ? '360px' : '280px' }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProjects.length) {
    return (
      <section className="py-24 md:py-32 lg:py-40 bg-zinc-50/50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-16">
            <EyebrowTag className="mb-5">Portfolyo</EyebrowTag>
            <h2 className="section-title text-zinc-900 mb-4">
              Öne Çıkan Projelerimiz
            </h2>
            <p className="section-subtitle">
              Tamamladığımız başarılı projelerden örnekler.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(0,52,80,0.04)' }}
            >
              <ArrowRight size={32} weight="light" className="text-zinc-300" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-700 mb-2">
              Projeler Yükleniyor
            </h3>
            <p className="text-zinc-400 text-sm">
              Yakında burada örnek projelerimizi görebileceksiniz.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 lg:py-40 bg-zinc-50/50 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mb-16 md:mb-20"
        >
          <EyebrowTag className="mb-5">Portfolyo</EyebrowTag>
          <h2
            className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Öne Çıkan Projelerimiz
          </h2>
          <p className="text-lg text-zinc-500 max-w-xl">
            Tamamladığımız başarılı projelerden örnekler. Kalite ve yenilik odaklı
            çalışmalarımızı keşfedin.
          </p>
        </motion.div>

        {/* Bento Grid -- 2 large + remaining smaller */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5"
        >
          {featuredProjects.map((item, index) => {
            const spanClass = index < 2
              ? 'md:col-span-6'
              : 'md:col-span-4';

            return (
              <motion.div
                key={item._id}
                variants={itemVariants}
                className={spanClass}
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
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          <Link
            href={`/${currentLang}/portfolio`}
            className="group inline-flex items-center gap-3 rounded-full font-medium text-sm active:scale-[0.98]"
            style={{
              padding: '12px 8px 12px 24px',
              border: '1px solid rgba(0,52,80,0.12)',
              color: '#3f3f46',
              transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <span>Tüm Projeleri Görüntüle</span>
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,52,80,0.06)' }}
            >
              <ArrowRight
                size={14}
                weight="bold"
                className="text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-[1px]"
                style={{ transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
              />
            </span>
          </Link>

          {/* Stats row */}
          <div className="flex items-center gap-8 md:gap-12">
            <div>
              <div className="text-2xl font-bold text-zinc-900 font-mono" style={{ letterSpacing: '-0.02em' }}>
                {portfolioItems.length}+
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">Tamamlanan Proje</div>
            </div>
            <div className="w-px h-8 bg-zinc-200" />
            <div>
              <div className="text-2xl font-bold text-zinc-900 font-mono" style={{ letterSpacing: '-0.02em' }}>
                {new Date().getFullYear() - 2020}+
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">Yıllık Deneyim</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
