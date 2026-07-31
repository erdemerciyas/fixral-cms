'use client';

import { m, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TextReveal } from '@/components/ui/TextReveal';
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
}

const EASE = [0.22, 1, 0.36, 1] as const;

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
}: PageHeroProps) {
  const { t } = useAppTranslations('common');
  const resolvedButtonText = buttonText || t('explore');
  const reducedMotion = useReducedMotion();

  // Background Logic — Priority: Prop > Default (token tabanlı düz yüzey)
  const finalBg = backgroundGradient || 'bg-secondary';
  const isCustomBg =
    finalBg.startsWith('#') ||
    finalBg.startsWith('linear-gradient') ||
    finalBg.startsWith('url') ||
    finalBg.includes('rgb');

  const sizeClasses =
    variant === 'compact'
      ? 'min-h-[30dvh] flex flex-col justify-center pt-24 pb-12 md:pt-28 md:pb-14'
      : 'min-h-[40dvh] flex flex-col justify-center pt-28 pb-16 md:pt-32 md:pb-20';

  const reveal = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section
      className={`relative overflow-hidden border-b border-border ${sizeClasses} ${!isCustomBg ? finalBg : ''}`}
      style={isCustomBg ? { background: finalBg } : undefined}
      aria-label={title}
      role="banner"
    >
      {/* Static blueprint grid (decorative) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 blueprint-grid opacity-40" />
      </div>

      <div className="container-content relative z-10 flex-grow flex flex-col justify-center">
        <div className="flex flex-col items-start text-left w-full">
          {/* Integrated breadcrumbs */}
          {showBreadcrumbs && (
            <m.div {...reveal(0)} className="mb-6 w-full">
              <Breadcrumbs />
            </m.div>
          )}

          {/* Badge */}
          {badge && (
            <m.div {...reveal(0.05)} className="mb-5 inline-block">
              <span className="px-3 py-1.5 rounded-sm bg-accent border border-border text-[11px] font-medium uppercase tracking-[0.15em] text-accent-foreground">
                {badge}
              </span>
            </m.div>
          )}

          {/* Kinetic title */}
          <m.div {...reveal(0.1)} className="mb-5">
            <h1
              className={`text-display tracking-tighter font-semibold text-foreground ${
                variant === 'compact' ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl'
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
              {...reveal(0.18)}
              className="text-xl sm:text-2xl font-semibold text-accent-foreground mb-6"
            >
              {subtitle}
            </m.p>
          )}

          {/* Description */}
          {description && (
            <m.p
              {...reveal(0.22)}
              className="text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-3xl mb-10"
            >
              {description}
            </m.p>
          )}

          {/* Featured Badge */}
          {featuredBadge && (
            <m.div {...reveal(0.26)} className="flex items-center mb-8 justify-start">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent border border-border rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                <span className="text-accent-foreground font-semibold text-sm">{featuredBadge}</span>
              </div>
            </m.div>
          )}

          {/* CTA Buttons */}
          {(showButton || showSecondaryButton) && (
            <m.div
              {...reveal(0.3)}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-start items-start"
            >
              {showButton && (
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {resolvedButtonText}
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}

              {showSecondaryButton && secondaryButtonLink && (
                <Link
                  href={secondaryButtonLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border text-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {secondaryButtonText}
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
}
