import type { Metadata } from 'next';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import { SchemaMarkup } from '@/lib/schema-markup';
import { Fx3dIndexView } from '@/components/fx3d/Fx3dViews';
import { getFxText } from '@/components/services/fx-server-text';
import { toFxLocale } from '@/content/fixral';
import { cultsProfileUrl, getFx3dModels, type Fx3dModel } from '@/lib/cults3d';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const L = toFxLocale(lang);
  const t = await getFxText(L);
  const title = `${t('fx3d.metaTitle')} | Fixral`;
  const description = t('fx3d.metaDescription');
  const alternates = generateAlternates('/tr/fx-3d');
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
      images: generateOgImages(undefined, 'FX 3D'),
    },
  };
}

export default async function Fx3dPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const L = toFxLocale(lang);
  const crumbs = await getFxText(L, 'breadcrumb');
  let models: Fx3dModel[] = [];
  let error = false;
  try {
    models = await getFx3dModels(L);
  } catch (e) {
    console.error('[fx-3d] list', e);
    error = true;
  }

  return (
    <div className="min-h-dvh bg-background">
      <BreadcrumbsJsonLd
        items={[
          { name: crumbs('home'), item: `${SITE_URL}/${L}` },
          { name: crumbs('fx3d'), item: `${SITE_URL}/${L}/fx-3d` },
        ]}
      />
      {models.length > 0 && (
        <SchemaMarkup
          schema={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: models.map((m, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}/${L}/fx-3d/${m.slug}`,
              name: m.name,
            })),
          }}
        />
      )}
      <Fx3dIndexView lang={L} models={models} error={error} profileUrl={cultsProfileUrl()} />
    </div>
  );
}
