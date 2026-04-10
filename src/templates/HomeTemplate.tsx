'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import HeroSlider from '@/components/home/HeroSlider';
import ServicesGrid from '@/components/home/ServicesGrid';
import HomePortfolioSection from '@/components/portfolio/HomePortfolioSection';
import NewsCarousel from '@/components/NewsCarousel';
import SectionWrapper from '@/components/ui/SectionWrapper';
import EyebrowTag from '@/components/ui/EyebrowTag';
import { ScrollReveal, ScrollRevealItem } from '@/components/ui/ScrollReveal';

interface HomeTemplateProps {
  sliderItems?: any[];
  portfolioItems?: any[];
  services?: any[];
  lang?: string;
}

export default function HomeTemplate({
  sliderItems = [],
  portfolioItems = [],
  services = [],
  lang = 'tr',
}: HomeTemplateProps) {
  return (
    <>
      <HeroSlider items={sliderItems} />

      <main>
        {/* Services Section */}
        <SectionWrapper
          className="bg-white"
          ariaLabel="Hizmetlerimiz"
        >
          <ScrollReveal>
            <div className="mb-12 md:mb-16">
              <EyebrowTag className="mb-5">Hizmetler</EyebrowTag>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4"
                style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
              >
                Sunduğumuz Çözümler
              </h2>
              <p className="text-zinc-500 text-base md:text-lg leading-relaxed max-w-xl">
                Modern teknoloji ve uzman kadromuzla projelerinizi hayata geçirmek için
                kapsamlı mühendislik çözümleri sunuyoruz.
              </p>
            </div>
          </ScrollReveal>

          <ServicesGrid services={services} />

          <ScrollReveal>
            <div className="flex justify-start">
              <Link
                href={`/${lang}/services`}
                className="group inline-flex items-center gap-3 rounded-full font-medium text-sm active:scale-[0.98]"
                style={{
                  padding: '12px 8px 12px 24px',
                  background: '#0c1a24',
                  color: 'rgba(255,255,255,0.9)',
                  transition: 'all 500ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <span>Tüm Hizmetleri Gör</span>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                >
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-[1px]"
                    style={{ transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                </span>
              </Link>
            </div>
          </ScrollReveal>
        </SectionWrapper>

        {/* News Section */}
        <SectionWrapper className="bg-white" ariaLabel="Son Haberler">
          <ScrollReveal>
            <div className="mb-16 md:mb-20">
              <EyebrowTag className="mb-5">Haberler</EyebrowTag>
              <h2 className="section-title text-zinc-900 mb-4">
                Son Gelişmeler
              </h2>
              <p className="section-subtitle">
                En son haberler, duyurular ve güncellemeler.
              </p>
            </div>
          </ScrollReveal>

          <NewsCarousel language="tr" limit={6} autoplay={true} />

          <ScrollReveal>
            <nav className="mt-12 flex justify-start" aria-label="Haberler navigasyonu">
              <Link
                href={`/${lang}/${lang === 'es' ? 'noticias' : 'haberler'}`}
                className="group inline-flex items-center gap-3 rounded-full font-medium text-sm active:scale-[0.98]"
                style={{
                  padding: '12px 8px 12px 24px',
                  border: '1px solid rgba(0,52,80,0.12)',
                  color: '#3f3f46',
                  transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                }}
              >
                <span>Tüm Haberleri Görüntüle</span>
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
            </nav>
          </ScrollReveal>
        </SectionWrapper>

        {/* Portfolio Section */}
        <HomePortfolioSection
          portfolioItems={portfolioItems}
          isLoading={false}
        />

        {/* CTA Section -- mesh gradient, no generic patterns */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #09141d 0%, #003450 40%, #002a3f 100%)',
            padding: '6rem 0',
          }}
          aria-label="Proje çağrısı"
        >
          {/* Mesh gradient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 animate-float"
              style={{ background: 'radial-gradient(circle, rgba(0,105,161,0.4) 0%, transparent 70%)' }}
            />
            <div
              className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-15"
              style={{
                background: 'radial-gradient(circle, rgba(0,52,80,0.5) 0%, transparent 70%)',
                animationDelay: '3s',
              }}
            />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <span
                  className="inline-flex items-center rounded-full px-3.5 py-1 text-[11px] uppercase font-medium tracking-[0.15em] mb-6"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  Proje Başvurusu
                </span>
                <h2
                  className="text-3xl md:text-5xl font-bold text-white mb-6"
                  style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
                >
                  Projenizi Gerçeğe Dönüştürün
                </h2>
                <p className="text-lg leading-relaxed mb-10 max-w-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Uzman ekibimiz ve modern teknolojilerimizle fikirlerinizi hayata geçirmeye hazırız.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                <Link
                  href={`/${lang}/contact`}
                  className="group inline-flex items-center gap-3 rounded-full font-medium text-sm active:scale-[0.98]"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    color: '#09141d',
                    padding: '14px 10px 14px 28px',
                    transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  <span>İletişime Geçin</span>
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,52,80,0.08)' }}
                  >
                    <ArrowRight
                      size={14}
                      weight="bold"
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-[1px]"
                      style={{ transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                    />
                  </span>
                </Link>

                <Link
                  href={`/${lang}/portfolio`}
                  className="inline-flex items-center gap-2 rounded-full font-medium text-sm active:scale-[0.98]"
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    padding: '14px 28px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  Projelerimizi İnceleyin
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
