'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Home as HomeIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { locales } from '@/i18n';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const ROUTE_SEGMENT_MAP: Record<string, string> = {
  haberler: 'news',
  noticias: 'news',
  portfolio: 'portfolio',
  services: 'services',
  contact: 'contact',
  videos: 'videos',
  account: 'account',
  login: 'login',
  register: 'register',
  offline: 'offline',
  about: 'about',
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const pathname = usePathname();
  const { t, locale } = useAppTranslations('breadcrumb');
  const safePath = pathname ?? '';

  if (safePath === '/' || safePath === `/${locale}` || safePath.startsWith('/admin')) {
    return null;
  }

  let breadcrumbs: BreadcrumbItem[] = [];

  if (items) {
    breadcrumbs = items;
  } else {
    const pathSegments = safePath.split('/').filter(Boolean);

    const startsWithLocale =
      pathSegments.length > 0 &&
      (locales as readonly string[]).includes(pathSegments[0]);

    const localePrefix = startsWithLocale ? `/${pathSegments[0]}` : '';
    const contentSegments = startsWithLocale ? pathSegments.slice(1) : pathSegments;

    breadcrumbs.push({ label: t('home'), href: localePrefix || '/' });

    let currentPath = localePrefix;
    contentSegments.forEach((segment) => {
      currentPath += `/${segment}`;

      const translationKey = ROUTE_SEGMENT_MAP[segment.toLowerCase()];
      let label: string;

      if (translationKey) {
        label = t(translationKey);
      } else {
        label = segment
          .replace(/-/g, ' ')
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      breadcrumbs.push({ label, href: currentPath });
    });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`rounded-2xl border border-primary/20 bg-surface-primary shadow-sm backdrop-blur px-4 py-3 text-sm text-muted-foreground ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={crumb.href}
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  <HomeIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{crumb.label}</span>
                </Link>
              ) : null}
              {index > 0 && (
                <ChevronRightIcon
                  className="h-4 w-4 mx-1.5 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              {index > 0 && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : null}
              {isLast && index > 0 ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
