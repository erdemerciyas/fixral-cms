import type { Metadata } from 'next';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import { SchemaMarkup } from '@/lib/schema-markup';
import { SoftwareIndexView } from '@/components/software/FxSoftwareViews';
import { getFxText } from '@/components/services/fx-server-text';
import { toFxLocale } from '@/content/fixral';
import { getFxData } from '@/lib/fx-data-server';
import { visibleSoftware } from '@/content/fx-data';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const L = toFxLocale(lang);
  const t = await getFxText(L);
  const title = `${t('swPage.metaTitle')} | Fixral`;
  const description = t('swPage.metaDescription');
  const alternates = generateAlternates('/tr/software');
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'website',
      locale: 'tr_TR',
      images: generateOgImages(undefined, t('software.pageTitle')),
    },
  };
}

export default async function SoftwarePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const L = toFxLocale(lang);
  const crumbs = await getFxText(L, 'breadcrumb');
  const software = visibleSoftware((await getFxData()).software);

  return (
    <div className="min-h-dvh bg-background">
      <BreadcrumbsJsonLd
        items={[
          { name: crumbs('home'), item: `${SITE_URL}/${L}` },
          { name: crumbs('software'), item: `${SITE_URL}/${L}/software` },
        ]}
      />
      <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: software.map((sw, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/${L}/software/${sw.slug}`,
            name: sw.name,
          })),
        }}
      />
      <SoftwareIndexView lang={L} />
    </div>
  );
}
