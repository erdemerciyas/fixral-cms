import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import { SchemaMarkup } from '@/lib/schema-markup';
import { Fx3dDetailView } from '@/components/fx3d/Fx3dViews';
import { clampDescription, getFxText } from '@/components/services/fx-server-text';
import { toFxLocale } from '@/content/fixral';
import { getFx3dModel, getFx3dModels } from '@/lib/cults3d';
import { markdownToHtml } from '@/lib/markdown-lite';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 3600;
// Cults3D'ye eklenen yeni modeller derleme gerektirmeden yayınlanır
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

/** Markdown açıklamadan ilk düz paragraf (hero lede ve meta açıklama) */
function plainLede(md: string): string {
  const para = md
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|[-*+|>]|\d+[.)])/.test(p));
  return (para || '').replace(/[*_`#>]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
}

async function load(slug: string, lang: string) {
  try {
    return await getFx3dModel(slug, toFxLocale(lang));
  } catch (e) {
    console.error('[fx-3d] detail', e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const L = toFxLocale(lang);
  const m = await load(slug, L);
  if (!m) return { title: 'Not Found', robots: { index: false } };
  const title = `${m.name.length <= 62 ? m.name : `${m.name.slice(0, 60)}…`} | FX 3D`;
  const description = clampDescription(plainLede(m.description) || m.name);
  const alternates = generateAlternates(`/tr/fx-3d/${m.slug}`);
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
      images: m.image ? [{ url: m.image, width: 516, height: 516, alt: m.name }] : generateOgImages(undefined, m.name),
    },
  };
}

export default async function Fx3dDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const L = toFxLocale(lang);
  const m = await load(slug, L);
  if (!m) notFound();
  const crumbs = await getFxText(L, 'breadcrumb');
  const url = `${SITE_URL}/${L}/fx-3d/${m.slug}`;
  const others = await getFx3dModels(L)
    .then((list) => {
      const rest = list.filter((x) => x.slug !== m.slug);
      const same = rest.filter((x) => x.category === m.category);
      return [...same, ...rest.filter((x) => x.category !== m.category)].slice(0, 3);
    })
    .catch(() => []);

  return (
    <div className="min-h-dvh bg-background">
      <BreadcrumbsJsonLd
        items={[
          { name: crumbs('home'), item: `${SITE_URL}/${L}` },
          { name: crumbs('fx3d'), item: `${SITE_URL}/${L}/fx-3d` },
          { name: m.name, item: url },
        ]}
      />
      <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@type': '3DModel',
          name: m.name,
          description: clampDescription(plainLede(m.description) || m.name, 300),
          image: m.images.length ? m.images : m.image ? [m.image] : undefined,
          url,
          sameAs: m.url,
          keywords: m.tags.join(', ') || undefined,
          creator: { '@type': 'Organization', name: 'FIXRAL', url: SITE_URL },
        }}
      />
      <Fx3dDetailView
        lang={L}
        model={m}
        lede={clampDescription(plainLede(m.description), 220)}
        descriptionHtml={markdownToHtml(m.description, { dropTitle: true })}
        detailsHtml={markdownToHtml(m.details)}
        others={others}
      />
    </div>
  );
}
