'use client';

import { useMemo } from 'react';
import { useLocale } from './useLocale';
import trMessages from '../../messages/tr.json';
import esMessages from '../../messages/es.json';

const messagesMap: Record<string, Record<string, any>> = {
  tr: trMessages,
  es: esMessages,
};

/**
 * Standalone translation hook for components outside NextIntlClientProvider
 * (e.g., Header, Footer in root layout).
 * Uses useLocale() to detect current language from pathname.
 */
export function useAppTranslations(namespace?: string) {
  const locale = useLocale();

  const t = useMemo(() => {
    const messages = messagesMap[locale] || messagesMap.tr;
    const section = namespace ? messages[namespace] : messages;

    return (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = section;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }
      if (typeof value !== 'string') return key;
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, name) =>
          params[name] !== undefined ? String(params[name]) : `{${name}}`
        );
      }
      return value;
    };
  }, [locale, namespace]);

  return { t, locale };
}
