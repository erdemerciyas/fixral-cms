import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import { SchemaMarkup } from '@/lib/schema-markup';
import { SoftwareDetailView } from '@/components/software/FxSoftwareViews';
import { clampDescription, getFxText } from '@/components/services/fx-server-text';
import { SOFTWARE, toFxLocale, type SoftwareDef } from '@/content/fixral';
import { getFxData } from '@/lib/fx-data-server';
import { SPLITTER_FAQ, SPLITTER_SLUG, SPLITTER_VIDEOS } from '@/content/splitter-showcase';

/** Panelde aktif olan yazılımı bulur (pasif kayıt 404 verir) */
async function findSoftware(slug: string) {
  const sw = (await getFxData()).software.find((s) => s.slug === slug);
  return sw && sw.isActive ? sw : undefined;
}
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 60;
// Panelden eklenen yeni yazılımlar derleme gerektirmeden yayınlanır
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return SOFTWARE.map((sw) => ({ lang: 'tr', slug: sw.slug }));
}

/** schema.org kategori: tarayıcı uygulamaları ve gömülü firmware ayrı tanımlanır */
const CATEGORY: Record<SoftwareDef['viz'], { category: string; os: string }> = {
  split: { category: 'DesignApplication', os: 'Web' },
  toolpath: { category: 'DesignApplication', os: 'Web' },
  gauge: { category: 'UtilitiesApplication', os: 'ESP32-S3 (ESP-IDF 5.3)' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const L = toFxLocale(lang);
  const sw = await findSoftware(slug);
  if (!sw) return { title: 'Not Found', robots: { index: false } };
  const tx = sw.text[L];
  const long = tx.tagline ? `${sw.name}: ${tx.tagline.replace(/\.$/, '')}` : sw.name;
  const title = `${long.length <= 62 ? long : [sw.name, tx.kicker].filter(Boolean).join(' · ')} | Fixral`;
  const description = clampDescription(tx.lede || tx.tagline || sw.name);
  const alternates = generateAlternates(`/tr/software/${sw.slug}`);
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
      images: generateOgImages(undefined, sw.name),
    },
  };
}

export default async function SoftwareDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const L = toFxLocale(lang);
  const sw = await findSoftware(slug);
  if (!sw) notFound();
  const tx = sw.text[L];
  const crumbs = await getFxText(L, 'breadcrumb');
  const url = `${SITE_URL}/${L}/software/${sw.slug}`;
  const cat = CATEGORY[sw.viz];

  return (
    <div className="min-h-dvh bg-background">
      <BreadcrumbsJsonLd
        items={[
          { name: crumbs('home'), item: `${SITE_URL}/${L}` },
          { name: crumbs('software'), item: `${SITE_URL}/${L}/software` },
          { name: sw.name, item: url },
        ]}
      />
      <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: sw.name,
          description: tx.lede || tx.tagline,
          applicationCategory: cat.category,
          operatingSystem: cat.os,
          ...(sw.version ? { softwareVersion: sw.version } : {}),
          url: sw.url || url,
          ...(sw.url ? { installUrl: sw.url } : sw.repo ? { downloadUrl: sw.repo } : {}),
          sameAs: [sw.repo, url].filter(Boolean),
          isAccessibleForFree: true,
          inLanguage: 'tr-TR',
          featureList: tx.features.map(([a]) => a),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          author: { '@type': 'Organization', name: 'FIXRAL', url: SITE_URL },
        }}
      />
      {sw.repo && <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: sw.name,
          codeRepository: sw.repo,
          url: sw.repo,
          ...(sw.version ? { version: sw.version } : {}),
        }}
      />}
      {sw.slug === SPLITTER_SLUG && <>
        {SPLITTER_VIDEOS.map((v) => (
          <SchemaMarkup
            key={v.id}
            schema={{
              '@context': 'https://schema.org',
              '@type': 'VideoObject',
              name: v.title,
              description: `${sw.name}: ${v.title}`,
              thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
              uploadDate: v.uploadDate,
              embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
              contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
              inLanguage: v.lang,
            }}
          />
        ))}
        <SchemaMarkup
          schema={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: SPLITTER_FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
          }}
        />
      </>}
      <SoftwareDetailView lang={L} slug={sw.slug} />
    </div>
  );
}
