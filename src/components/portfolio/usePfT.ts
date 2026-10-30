'use client';

import { useCallback } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/** `fx.portfolio.*` çevirileri: t('filters.all') → fx.portfolio.filters.all */
export function usePfT() {
  const { t } = useAppTranslations('fx');
  return useCallback((key: string, params?: Record<string, string | number>) => t(`portfolio.${key}`, params), [t]);
}
