'use client';

/**
 * PageHero — paylaşılan teknik sayfa başlığı (precision chrome).
 * TechLabel index/badge satırı + BlueprintGrid bandı + Barlow display başlık +
 * monospace mikro-etiketler. Mevcut prop API'si korunur (alt sayfalar kırılmaz);
 * `index` yeni opsiyonel prop'tur (örn. "01" bölüm numarası).
 * Animasyonlar precision motion preset'leri üzerinden yürür ve
 * prefers-reduced-motion'da opacity-only'ye düşer.
 */
import { m } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TextReveal } from '@/components/ui/TextReveal';
import { BlueprintGrid, MeasureRule, TechLabel, useMotionPresets } from '@/components/ui';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PageHeroProps {
  title: string;
  description?: string;
  subtitle?: string;
  badge?: string;
  featuredBadge?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundGradient?: string;
  showButton?: boolean;
  showSecondaryButton?: boolean;
  variant?: 'default' | 'compact';
  showBreadcrumbs?: boolean;
  /** TechLabel index numarası ("01 / BADGE"); sayı zero-padded yazılır */
  index?: number | string;
}

export default function PageHero({
  title,
  description,
  subtitle,
  badge,
  featuredBadge,
  buttonText,
  buttonLink = '#content',
  secondaryButtonText,
  secondaryButtonLink,
  backgroundGradient,
  showButton = true,
  showSecondaryButton = false,
  variant = 'default',
  showBreadcrumbs = false,
  index,
}: PageHeroProps) {
  const { t } = useAppTranslations('common');
  const resolvedButtonText = buttonText || t('explore');
  const { staggerContainer, staggerItem } = useMotionPresets();

  // Background Logic — Priority: Prop > Default (token tabanlı düz yüzey)
  const finalBg = backgroundGradient || 'bg-secondary';
  const isCustomBg =
    finalBg.startsWith('#') ||
    finalBg.startsWith('linear-gradient') ||
    finalBg.startsWith('url') ||
    finalBg.includes('rgb');

  const sizeClasses =
    variant === 'compact'
      ? 'min-h-[30dvh] flex flex-col justify-center pt-24 pb-10 md:pt-28 md:pb-12'
      : 'min-h-[40dvh] flex flex-col justify-center pt-28 pb-14 md:pt-32 md:pb-16';

  /* Badge yoksa index tek başına mono etiket olarak yazılır ("01") */
  const formattedIndex =
    typeof index === 'number' ? String(index).padStart(2, '0') : index;
  const hasLabelRow = Boolean(badge) || formattedIndex !== undefined;

  return (
    <section
      className={`relative overflow-hidden border-b border-border ${sizeClasses} ${!isCustomBg ? finalBg : ''}`}
      style={isCustomBg ? { background: finalBg } : undefined}
      aria-label={title}
      role="banner"
    >
      {/* Blueprint grid bandı (dekoratif, temaya token'lardan uyarlanır) */}
      <BlueprintGrid density="normal" opacity="subtle" />

      <div className="container-content relative z-10 grow flex flex-col justify-center">
        <m.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start text-left w-full"
        >
          {/* Integrated breadcrumbs */}
          {showBreadcrumbs && (
            <m.div variants={staggerItem} className="mb-6 w-full">
              <Breadcrumbs />
            </m.div>
          )}

          {/* TechLabel — index + badge (monospace teknik etiket) */}
          {hasLabelRow && (
            <m.div variants={staggerItem} className="mb-5">
              <TechLabel as="p" marker="tick" index={badge ? index : undefined}>
                {badge ?? formattedIndex}
              </TechLabel>
            </m.div>
          )}

          {/* Barlow display başlık */}
          <m.div variants={staggerItem} className="mb-5">
            <h1
              className={`font-display font-bold leading-[1.05] tracking-[-0.03em] text-foreground ${
                variant === 'compact'
                  ? 'text-3xl md:text-4xl lg:text-5xl'
                  : 'text-4xl md:text-5xl lg:text-6xl'
              }`}
            >
              <TextReveal mode="word" mask stagger={0.04} delay={0.1}>
                {title}
              </TextReveal>
            </h1>
          </m.div>

          {/* Subtitle */}
          {subtitle && (
            <m.p
              variants={staggerItem}
              className="text-lg sm:text-xl font-semibold text-accent-foreground mb-5"
            >
              {subtitle}
            </m.p>
          )}

          {/* Description */}
          {description && (
            <m.p
              variants={staggerItem}
              className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-[65ch] mb-8"
            >
              {description}
            </m.p>
          )}

          {/* Featured Badge — monospace mikro-etiket */}
          {featuredBadge && (
            <m.div variants={staggerItem} className="flex items-center mb-8 justify-start">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xs">
                <span className="w-1.5 h-1.5 bg-primary" aria-hidden="true" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-foreground">
                  {featuredBadge}
                </span>
              </div>
            </m.div>
          )}

          {/* CTA Buttons — 2px kontrol radius'u, tek turuncu dolgu + hairline outline */}
          {(showButton || showSecondaryButton) && (
            <m.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start items-start"
            >
              {showButton && (
                <Link
                  href={buttonLink}
                  className="group inline-flex items-center gap-2 rounded-xs bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-[background-color,transform] duration-200 motion-reduce:transition-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {resolvedButtonText}
                  <ArrowRightIcon
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>
              )}

              {showSecondaryButton && secondaryButtonLink && (
                <Link
                  href={secondaryButtonLink}
                  className="inline-flex items-center gap-2 rounded-xs border border-border-strong px-6 py-3 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary active:scale-[0.98] transition-[color,border-color,transform] duration-200 motion-reduce:transition-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {secondaryButtonText}
                  <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
            </m.div>
          )}

          {/* Ruler bandı — precision imzası (dekoratif) */}
          <m.div variants={staggerItem} className="mt-10 w-full" aria-hidden="true">
            <MeasureRule ticks="sparse" />
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
