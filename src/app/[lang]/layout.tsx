/**
 * [lang]/layout.tsx
 *
 * Dil bazlı route segment layout'u.
 * NextIntlClientProvider'ı sarar — tüm [lang] alt sayfaları
 * useTranslations() hook'unu kullanabilir.
 */

import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getMessages, isValidLocale, defaultLocale, locales } from '@/i18n';

// Dil segmenti build'de önceden üretilir; alt sayfalar kendi revalidate değerleriyle ISR olur.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  const locale = isValidLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale); // yoksa next-intl locale'i header'dan okur ve tüm sayfalar dinamikleşir
  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
