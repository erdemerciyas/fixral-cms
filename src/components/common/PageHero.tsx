'use client';

/**
 * PageHero — FIXRAL iç sayfa başlığı (redesign 2026).
 * Her temada koyu ada (`public-theme public-dark`): breadcrumb, turuncu eyebrow,
 * Space Grotesk başlık, açıklama ve isteğe bağlı sağ kolon (`aside`, ör. 3D görsel).
 * Eski prop API'si korunur; butonlar yalnızca `buttonText` açıkça verildiğinde çizilir.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ArrowRight } from '@/components/fx/FxIcons';

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
  /** @deprecated Ada tekniği kullanılır; arka plan tasarım sistemine aittir */
  backgroundGradient?: string;
  showButton?: boolean;
  showSecondaryButton?: boolean;
  variant?: 'default' | 'compact';
  showBreadcrumbs?: boolean;
  /** @deprecated Numaralı etiketler yerine eyebrow kullanılır */
  index?: number | string;
  /** Sağ kolon (3D görünüm, rozetler, bağlantılar) */
  aside?: ReactNode;
  /** Breadcrumb öğeleri (verilmezse adres satırından üretilir) */
  crumbs?: { label: string; href: string }[];
  /** Başlık altına ek içerik (rozetler, meta) */
  children?: ReactNode;
}

const isHash = (href: string) => href.startsWith('#');

function HeroButton({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const cls = `fx-btn ${primary ? 'fx-btn--primary' : 'fx-btn--ghost'}`;
  if (isHash(href) || href.startsWith('http')) {
    return (
      <a className={cls} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
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
  showButton = true,
  showSecondaryButton = false,
  variant = 'default',
  showBreadcrumbs = true,
  aside,
  crumbs,
  children,
}: PageHeroProps) {
  const lede = description || subtitle;
  const eyebrow = [badge, featuredBadge].filter(Boolean).join(' · ');
  const hasButtons = (showButton && buttonText) || (showSecondaryButton && secondaryButtonText && secondaryButtonLink);

  return (
    <section className={`fx-phero public-theme public-dark ${variant === 'compact' ? 'fx-phero--compact' : ''}`} aria-labelledby="page-hero-title">
      <div className={`fx-wrap fx-phero__in ${aside ? '' : 'fx-phero__in--solo'}`}>
        <div className="fx-phero__copy fx-rv">
          {showBreadcrumbs && <Breadcrumbs items={crumbs} />}
          {eyebrow && <p className="fx-eyebrow">{eyebrow}</p>}
          <h1 className="fx-h1" id="page-hero-title">{title}</h1>
          {lede && <p className="fx-lede">{lede}</p>}
          {children}
          {hasButtons && (
            <div className="fx-hero__ctas">
              {showButton && buttonText && (
                <HeroButton href={buttonLink} primary>
                  {buttonText} <ArrowRight />
                </HeroButton>
              )}
              {showSecondaryButton && secondaryButtonText && secondaryButtonLink && (
                <HeroButton href={secondaryButtonLink}>{secondaryButtonText}</HeroButton>
              )}
            </div>
          )}
        </div>
        {aside && <div className="fx-phero__aside fx-rv fx-rv-2">{aside}</div>}
      </div>
    </section>
  );
}
