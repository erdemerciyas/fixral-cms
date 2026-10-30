import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import { SchemaMarkup } from '@/lib/schema-markup';
import { ServiceDetailView } from '@/components/services/FxServicesViews';
import { clampDescription, getFxText } from '@/components/services/fx-server-text';
import { DISCIPLINES, SERVICES, toFxLocale } from '@/content/fixral';
import { findService, serviceAbout } from '@/content/fx-data';
import { getFxData } from '@/lib/fx-data-server';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 60;
// Panelden eklenen yeni hizmetler derleme gerektirmeden yayınlanır
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ lang: 'tr', slug: s.slug }));
}

/** Panel + katalog birleşik listesinden hizmet (eski slug'lar dahil) */
async function getService(slug: string) {
  const data = await getFxData();
  return { service: findService(data.services, slug), data };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const L = toFxLocale(lang);
  const { service } = await getService(slug);
  if (!service) return { title: 'Not Found', robots: { index: false } };
  const tx = service.text[L];
  const title = `${tx.name} | Fixral`;
  const description = clampDescription([tx.short, tx.lede].filter(Boolean).join(' ') || tx.name);
  const alternates = generateAlternates(`/tr/services/${service.slug}`);
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
      images: generateOgImages(service.image, tx.name),
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const L = toFxLocale(lang);
  const { service, data } = await getService(slug);
  if (!service) notFound();
  // Eski yönetim paneli slug'ları (dbSlugs) kalıcı olarak kanonik adrese yönlenir
  if (service.slug !== slug || lang !== L) permanentRedirect(`/${L}/services/${service.slug}`);

  const [crumbs, t] = await Promise.all([getFxText(L, 'breadcrumb'), getFxText(L)]);
  const about = serviceAbout(service, L);
  const tx = service.text[L];
  const disc = DISCIPLINES.find((d) => d.id === service.discipline);
  const discName = disc ? data.site.disciplines[disc.id][L].name : undefined;
  const url = `${SITE_URL}/${L}/services/${service.slug}`;

  return (
    <div className="min-h-dvh bg-background">
      <BreadcrumbsJsonLd
        items={[
          { name: crumbs('home'), item: `${SITE_URL}/${L}` },
          { name: crumbs('services'), item: `${SITE_URL}/${L}/services` },
          { name: tx.name, item: url },
        ]}
      />
      <SchemaMarkup
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: tx.name,
          serviceType: discName,
          description: tx.lede || tx.short,
          url,
          inLanguage: 'tr-TR',
          ...(about?.image ? { image: about.image } : {}),
          provider: { '@type': 'Organization', name: 'FIXRAL', url: SITE_URL, description: t('svcPage.provider') },
          areaServed: [{ '@type': 'Country', name: 'Turkey' }, { '@type': 'Country', name: 'Spain' }],
        }}
      />
      <ServiceDetailView lang={L} slug={service.slug} />
    </div>
  );
}
