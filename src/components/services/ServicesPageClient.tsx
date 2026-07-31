'use client';

import { useState, useEffect, useRef } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ArrowRight, Clock, Star, Sparkles, AlertCircle } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import EyebrowTag from '@/components/ui/EyebrowTag';
import { useLocale } from '@/hooks/useLocale';

const ease = [0.32, 0.72, 0, 1] as const;

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/* ------------------------------------------------------------------ */
/*  Skeleton loaders                                                    */
/* ------------------------------------------------------------------ */
function SidebarSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-surface-secondary animate-pulse" />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-2/3 rounded-lg bg-surface-secondary" />
      <div className="aspect-video rounded-2xl bg-surface-secondary" />
      <div className="space-y-3">
        <div className="h-4 rounded bg-surface-secondary w-full" />
        <div className="h-4 rounded bg-surface-secondary w-5/6" />
        <div className="h-4 rounded bg-surface-secondary w-4/6" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Service detail panel                                                */
/* ------------------------------------------------------------------ */
function ServiceDetail({ service, index, lang }: { service: Service; index: number; lang: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatedSection className="space-y-8" delay={0.05}>
      {/* Eyebrow */}
      <EyebrowTag>
        {String(index + 1).padStart(2, '0')} / {service.title}
      </EyebrowTag>

      {/* Title */}
      <h2
        className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight"
      >
        {service.title}
      </h2>

      {/* Image */}
      <div className="relative aspect-video bg-surface-tertiary rounded-sm overflow-hidden border border-border">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
        ) : (
          <div className="absolute inset-0 bg-accent flex items-center justify-center">
            <span
              className="text-primary/20 font-bold select-none"
              style={{ fontSize: 'clamp(5rem, 10vw, 8rem)' }}
            >
              {service.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div
        className="text-muted-foreground leading-relaxed text-base md:text-[17px]"
      >
        {stripHtml(service.description)}
      </div>

      {/* Features */}
      {service.features && service.features.length > 0 && (
        <m.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
          }}
          className="space-y-3"
        >
          {service.features.map((feature, idx) => (
            <m.li
              key={idx}
              variants={{
                hidden: { opacity: 0, x: -12, filter: prefersReduced ? undefined : 'blur(4px)' },
                visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
              }}
              className="flex items-start gap-3 text-muted-foreground text-[15px]"
            >
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span>{feature}</span>
            </m.li>
          ))}
        </m.ul>
      )}

      {/* Meta strip */}
      {(service.duration || service.rating || service.price) && (
        <div
          className="flex flex-wrap items-center gap-5 py-4 border-y border-border"
          style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
        >
          {service.duration && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>{service.duration}</span>
            </div>
          )}
          {service.rating && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Star className="w-4 h-4 text-amber-500" />
              <span>{service.rating}/5</span>
            </div>
          )}
          {service.price && (
            <span className="text-accent-foreground font-medium text-sm">{service.price}</span>
          )}
        </div>
      )}

      {/* CTA */}
      <MagneticButton
        asChild
        className="mt-2"
      >
        <Link
          href={`/${lang}/contact?service=${encodeURIComponent(service.title)}`}
          className="group inline-flex items-center gap-2.5 bg-primary text-primary-foreground px-7 py-3.5 rounded-lg text-sm font-medium
            transition-colors duration-200 hover:bg-[hsl(var(--primary)/0.85)] active:scale-[0.98] shadow-[var(--shadow-sm)]"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <span>Teklif Al</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-1" />
        </Link>
      </MagneticButton>
    </AnimatedSection>
  );
}

/* ================================================================== */
/*  Main Component                                                      */
/* ================================================================== */
export default function ServicesPageClient() {
  const lang = useLocale();
  const prefersReduced = useReducedMotion();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/services');
        if (!res.ok) throw new Error('Servisler yüklenemedi');
        const data = await res.json();
        if (!cancelled) {
          setServices(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Bir hata oluştu');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleNavClick = (index: number) => {
    setActiveIndex(index);
    // Smooth scroll to detail panel on mobile
    if (window.innerWidth < 1024 && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ---- Loading State ---- */
  if (loading) {
    return (
      <section id="services" className="py-16 bg-background">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            <div className="hidden lg:block">
              <SidebarSkeleton />
            </div>
            <DetailSkeleton />
          </div>
        </div>
      </section>
    );
  }

  /* ---- Error State ---- */
  if (error) {
    return (
      <section id="services" className="py-16 bg-background">
        <div className="container-content text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-secondary border border-border text-muted-foreground mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2
            className="text-xl font-semibold text-foreground mb-2"
          >
            Bir hata oluştu
          </h2>
          <p className="text-muted-foreground text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-[hsl(var(--primary)/0.85)] transition-colors duration-200 active:scale-[0.98]"
          >
            Tekrar Dene
          </button>
        </div>
      </section>
    );
  }

  /* ---- Empty State ---- */
  if (services.length === 0) {
    return (
      <section id="services" className="py-24 bg-background">
        <div className="container-content text-center">
          <ScrollReveal>
            <div className="w-20 h-20 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2
              className="text-2xl font-semibold text-foreground mb-3"
            >
              Henüz hizmet bulunmuyor
            </h2>
            <p className="text-muted-foreground text-base">
              Yakında sizlere hizmet sunmaya başlayacağız.
            </p>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  const activeService = services[activeIndex] || services[0];

  /* ---- Main Layout ---- */
  return (
    <>
      <section id="services" className="py-12 md:py-16 bg-background">
        <div className="container-content">
          {/* Section intro */}
          <ScrollReveal className="max-w-2xl mb-10 md:mb-14">
            <EyebrowTag className="mb-5">Hizmetler</EyebrowTag>
            <h2
              className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight leading-snug mb-3"
            >
              Detaylı Hizmet Açıklamaları
            </h2>
            <p className="text-muted-foreground text-base md:text-[17px] leading-relaxed">
              Her bir hizmetimizin detaylarını inceleyin ve ihtiyaçlarınıza en uygun çözümü keşfedin.
            </p>
          </ScrollReveal>

          {/* 2-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            {/* Sticky sidebar nav */}
            <nav className="lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
              <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
                {services.map((service, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <li key={service._id} className="shrink-0 lg:shrink">
                      <button
                        onClick={() => handleNavClick(index)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap lg:whitespace-normal ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-[var(--shadow-sm)]'
                            : 'bg-surface-primary border border-border text-muted-foreground hover:bg-accent hover:border-primary/30 hover:text-foreground'
                        }`}
                        style={{
                          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <span className="inline-block w-6 text-xs opacity-50 mr-1">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {service.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Detail panel */}
            <div ref={detailRef} key={activeService._id}>
              <ServiceDetail
                service={activeService}
                index={activeIndex}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 bg-primary overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-12 left-12 w-24 h-24 rounded-full border border-foreground/6" />
          <div className="absolute top-40 right-16 w-16 h-16 border border-foreground/6 rotate-45" />
          <div className="absolute bottom-16 left-1/4 w-32 h-32 rounded-full border border-foreground/4" />
        </div>

        <div className="container-content relative z-10 text-center">
          <ScrollReveal>
            <EyebrowTag variant="light" className="mb-6 mx-auto">Özel Proje</EyebrowTag>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground tracking-tight leading-tight mb-5"
            >
              Özel Bir Projeniz mi Var?
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="text-primary-foreground/75 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Size özel çözümler geliştirmek için buradayız. Projenizi birlikte değerlendirelim.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton asChild>
              <Link
                href={`/${lang}/contact`}
                className="group inline-flex items-center justify-center gap-2.5 bg-primary-foreground text-primary px-7 py-3.5 rounded-lg text-sm font-medium
                  transition-all duration-200 hover:bg-primary-foreground/90 active:scale-[0.98] motion-reduce:transition-none"
              >
                <Sparkles className="w-4 h-4" />
                <span>Proje Teklifi Al</span>
              </Link>
            </MagneticButton>

            <Link
              href={`/${lang}/portfolio`}
              className="group inline-flex items-center justify-center gap-2.5 border border-primary-foreground/30 text-primary-foreground px-7 py-3.5 rounded-lg text-sm font-medium
                transition-all duration-200 hover:bg-black/10 active:scale-[0.98] motion-reduce:transition-none"
            >
              <span>Örnek Projelerimizi İnceleyin</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
