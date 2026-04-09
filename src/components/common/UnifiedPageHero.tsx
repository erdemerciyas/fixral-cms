'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useActiveTheme } from '../../providers/ActiveThemeProvider';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface UnifiedPageHeroProps {
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
}

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export default function UnifiedPageHero({
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
}: UnifiedPageHeroProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useActiveTheme();
  const { t } = useAppTranslations('common');
  const resolvedButtonText = buttonText || t('explore');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme config shortcuts
  const heroConfig = theme?.hero;

  // 1. Background Logic
  // Priority: Prop > Theme Config > Default
  const finalBg = backgroundGradient || heroConfig?.backgroundColor || 'bg-gradient-primary';
  const isCustomBg = finalBg.startsWith('#') || finalBg.startsWith('linear-gradient') || finalBg.startsWith('url') || finalBg.includes('rgb');

  // 2. Alignment Logic
  const alignment = heroConfig?.alignment || 'center';
  const textAlignClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';
  const flexAlignClass = alignment === 'left' ? 'items-start' : alignment === 'right' ? 'items-end' : 'items-center';

  // 3. Size Logic (Height)
  // We can inject min-height if desired, but let's stick to padding-based sizing for now combined with theme adjustments if needed.
  // The original component used padding classes. We can keep that or allow theme to override padding.
  // Letting CSS variables handle it would be cleaner if the layout used them, but here we have explicit classes.
  // For now, we will stick to the variant classes but apply theme/prop background.

  // 4. Color Logic (Title, Subtitle)
  const titleColor = heroConfig?.title?.color;
  const subtitleColor = heroConfig?.subtitle?.color;

  const sizeClasses = variant === 'compact'
    ? 'pt-28 pb-16 md:pt-32 md:pb-20'
    : 'pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-44 lg:pb-32';

  const ssrSizeClasses = variant === 'compact'
    ? 'py-16 md:py-20'
    : 'py-24 md:py-32 lg:py-36';

  if (!mounted) {
    return (
      <section
        className={`text-white ${ssrSizeClasses} ${!isCustomBg ? finalBg : ''}`}
        style={isCustomBg ? { background: finalBg } : {}}
      >
        <div className="container-content">
          <div className="text-center">
            {/* Minimal Loading State */}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden text-white ${sizeClasses} ${!isCustomBg ? finalBg : ''}`}
      style={isCustomBg ? { background: finalBg } : undefined}
      role="banner"
      aria-label={title}
    >
      <div className="container-content">
        <motion.div
          className={`flex flex-col ${flexAlignClass} ${textAlignClass} w-full`}
          variants={containerVariants}
          initial="visible"
          animate="visible"
        >
          {/* Badge */}
          {badge && (
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-block"
            >
              <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white/90">
                {badge}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className={`${variant === 'compact' ? 'hero-title-compact' : 'hero-title'
              } text-gradient-hero mb-6`}
            style={titleColor ? { color: titleColor, WebkitTextFillColor: titleColor } : undefined}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl font-semibold text-brand-primary-200 mb-8"
              style={subtitleColor ? { color: subtitleColor } : undefined}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Description */}
          {description && (
            <motion.p
              variants={itemVariants}
              className={`text-lg sm:text-xl leading-relaxed text-slate-200/90 max-w-3xl mb-12 ${alignment === 'center' ? 'mx-auto' : ''}`}
              style={subtitleColor ? { color: subtitleColor } : undefined}
            >
              {description}
            </motion.p>
          )}

          {/* Featured Badge */}
          {featuredBadge && (
            <motion.div
              variants={itemVariants}
              className={`flex items-center mb-8 ${alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'}`}
            >
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <span className="text-white/90 font-semibold text-sm">{featuredBadge}</span>
              </div>
            </motion.div>
          )}

          {/* CTA Buttons */}
          {(showButton || showSecondaryButton) && (
            <motion.div
              variants={itemVariants}
              className={`flex flex-col sm:flex-row gap-4 sm:gap-6 ${alignment === 'center' ? 'justify-center' : (alignment === 'right' ? 'justify-end' : 'justify-start')} items-center`}
            >
              {showButton && (
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-primary-900 font-semibold rounded-lg hover:bg-white/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary-900 shadow-lg hover:shadow-xl"
                  style={heroConfig?.buttons?.primary ? {
                    backgroundColor: heroConfig.buttons.primary.backgroundColor,
                    color: heroConfig.buttons.primary.textColor,
                  } : undefined}
                >
                  {resolvedButtonText}
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}

              {showSecondaryButton && secondaryButtonLink && (
                <Link
                  href={secondaryButtonLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary-900"
                >
                  {secondaryButtonText}
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />

      {/* Theme defined overlay */}
      {heroConfig?.overlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: heroConfig.overlay.color || '#000000',
            opacity: heroConfig.overlay.opacity || 0.4,
          }}
        />
      )}
    </section>
  );
}
