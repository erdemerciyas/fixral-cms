'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
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
  portfolio: 'portfolio',
  services: 'services',
  software: 'software',
  'fx-3d': 'fx3d',
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
    <nav aria-label="Breadcrumb" className={`fx-crumbs ${className}`}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <React.Fragment key={`${crumb.href}-${index}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {isLast ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <Link href={crumb.href}>{crumb.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
