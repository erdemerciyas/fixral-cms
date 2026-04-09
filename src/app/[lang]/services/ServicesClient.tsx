'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Star, CheckCircle, Sparkle } from '@phosphor-icons/react';
import HTMLContent from '@/components/HTMLContent';
import EyebrowTag from '@/components/ui/EyebrowTag';
import { ScrollReveal, ScrollRevealItem } from '@/components/ui/ScrollReveal';
import { useLocale } from '@/hooks/useLocale';

const ease = [0.32, 0.72, 0, 1] as const;

const featureVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const featureItemVariants = {
  hidden: { opacity: 0, x: -12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease },
  },
};

interface Service {
  _id: string;
  title: string;
  description: string;
  image?: string;
  features?: string[];
  price?: string;
  duration?: string;
  rating?: number;
  createdAt: string;
}

interface ServicesClientProps {
  services: Service[];
  hero: {
    title: string;
    description: string;
  };
}

function ServiceSection({ service, index }: { service: Service; index: number }) {
  const lang = useLocale();
  const [expanded, setExpanded] = useState(false);
  const isReversed = index % 2 === 1;
  const anchor = service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');

  return (
    <section
      id={anchor}
      className={`relative py-20 md:py-28 ${
        index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/60'
      }`}
    >
      <div className="container-content">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            isReversed ? 'lg:direction-rtl' : ''
          }`}
        >
          {/* Image Column */}
          <ScrollReveal
            className={isReversed ? 'lg:order-2' : ''}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#003450] to-[#00567a] flex items-center justify-center">
                  <span
                    className="text-white/10 font-bold select-none"
                    style={{ fontFamily: 'var(--font-geist-sans)', fontSize: 'clamp(6rem, 12vw, 10rem)' }}
                  >
                    {service.title.charAt(0)}
                  </span>
                </div>
              )}
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/10 to-transparent pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* Content Column */}
          <div className={isReversed ? 'lg:order-1' : ''}>
            <ScrollReveal>
              <EyebrowTag className="mb-5">
                {String(index + 1).padStart(2, '0')} / {service.title}
              </EyebrowTag>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2
                className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-zinc-900 tracking-tight leading-[1.15] mb-6"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
              >
                {service.title}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="text-zinc-500 leading-relaxed text-base md:text-[17px] mb-8">
                <HTMLContent
                  content={service.description}
                  truncate={expanded ? undefined : 200}
                  showMore={expanded}
                  onToggle={() => setExpanded(!expanded)}
                />
              </div>
            </ScrollReveal>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <motion.ul
                variants={featureVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="space-y-3 mb-8"
              >
                {service.features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    variants={featureItemVariants}
                    className="flex items-start gap-3 text-zinc-600 text-[15px]"
                  >
                    <CheckCircle
                      weight="light"
                      className="w-5 h-5 text-[#003450] mt-0.5 flex-shrink-0"
                    />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {/* Meta strip */}
            {(service.duration || service.rating || service.price) && (
              <ScrollReveal delay={0.25}>
                <div
                  className="flex flex-wrap items-center gap-5 mb-8 py-4 border-y border-zinc-100"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {service.duration && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <Clock weight="light" className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                  {service.rating && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <Star weight="light" className="w-4 h-4 text-amber-500" />
                      <span>{service.rating}/5</span>
                    </div>
                  )}
                  {service.price && (
                    <span className="text-[#003450] font-medium text-sm">
                      {service.price}
                    </span>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* CTA */}
            <ScrollReveal delay={0.3}>
              <Link
                href={`/${lang}/contact?service=${encodeURIComponent(service.title)}`}
                className="group inline-flex items-center gap-2.5 bg-[#003450] text-white px-6 py-3 rounded-lg text-sm font-medium
                  transition-all duration-700 hover:bg-[#004a6e] active:scale-[0.98]"
                style={{
                  fontFamily: 'var(--font-geist-sans)',
                  transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
                }}
              >
                <span>Detayli Bilgi Al</span>
                <ArrowRight
                  weight="light"
                  className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-1"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesClient({ services, hero }: ServicesClientProps) {
  const lang = useLocale();

  return (
    <>
      {/* Section Intro */}
      <section id="services" className="pt-16 pb-8 bg-white">
        <div className="container-content">
          <ScrollReveal className="max-w-2xl">
            <EyebrowTag className="mb-5">Hizmetler</EyebrowTag>
            <h2
              className="text-2xl md:text-3xl font-semibold text-zinc-900 tracking-tight leading-snug mb-3"
              style={{ fontFamily: 'var(--font-geist-sans)' }}
            >
              Detayli Hizmet Aciklamalari
            </h2>
            <p className="text-zinc-500 text-base md:text-[17px] leading-relaxed">
              Her bir hizmetimizin detaylarini inceleyin ve ihtiyaclariniza en uygun cozumu kesfedin.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Service Sections */}
      {services.length === 0 ? (
        <section className="py-24 bg-white">
          <div className="container-content text-center">
            <ScrollReveal>
              <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-6">
                <Sparkle weight="light" className="w-8 h-8 text-zinc-400" />
              </div>
              <h2
                className="text-2xl font-semibold text-zinc-800 mb-3"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
              >
                Henuz hizmet bulunmuyor
              </h2>
              <p className="text-zinc-500 text-base">
                Yakinda sizlere hizmet sunmaya baslayacagiz.
              </p>
            </ScrollReveal>
          </div>
        </section>
      ) : (
        services.map((service, index) => (
          <ServiceSection key={service._id} service={service} index={index} />
        ))
      )}

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 bg-[#003450] overflow-hidden">
        {/* Geometric accents */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-12 left-12 w-24 h-24 rounded-full border border-white/[0.06]" />
          <div className="absolute top-40 right-16 w-16 h-16 border border-white/[0.06] rotate-45" />
          <div className="absolute bottom-16 left-1/4 w-32 h-32 rounded-full border border-white/[0.04]" />
          <div className="absolute bottom-12 right-12 w-14 h-14 border border-white/[0.06] rotate-12" />
        </div>

        <div className="container-content relative z-10 text-center">
          <ScrollReveal>
            <EyebrowTag variant="light" className="mb-6 mx-auto">
              Ozel Proje
            </EyebrowTag>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight mb-5"
              style={{ fontFamily: 'var(--font-geist-sans)' }}
            >
              Ozel Bir Projeniz mi Var?
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Size ozel cozumler gelistirmek icin buradayiz. Projenizi birlikte degerlendirelim.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}/contact`}
              className="group inline-flex items-center justify-center gap-2.5 bg-white text-[#003450] px-7 py-3.5 rounded-lg text-sm font-medium
                transition-all duration-700 hover:bg-zinc-100 active:scale-[0.98]"
              style={{
                fontFamily: 'var(--font-geist-sans)',
                transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              <Sparkle weight="light" className="w-4 h-4" />
              <span>Proje Teklifi Al</span>
            </Link>

            <Link
              href={`/${lang}/portfolio`}
              className="group inline-flex items-center justify-center gap-2.5 border border-white/20 text-white px-7 py-3.5 rounded-lg text-sm font-medium
                transition-all duration-700 hover:bg-white/[0.06] active:scale-[0.98]"
              style={{
                fontFamily: 'var(--font-geist-sans)',
                transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              <span>Ornek Projelerimizi Inceleyin</span>
              <ArrowRight
                weight="light"
                className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-1"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
