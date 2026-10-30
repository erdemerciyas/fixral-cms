import type { Metadata } from 'next';
import PageSetting from '@/models/PageSetting';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import ServicesListJsonLd from '@/components/seo/ServicesListJsonLd';
import { ServicesIndexView } from '@/components/services/FxServicesViews';
import { getFxText } from '@/components/services/fx-server-text';
import { toFxLocale } from '@/content/fixral';
import { getFxData } from '@/lib/fx-data-server';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 60;

/**
 * Yönetim panelindeki "services" sayfa ayarı (yalnızca SEO başlığı/açıklaması).
 * Sayfa yapısı ve kahraman metni katalogdan ve `fx.*` çevirilerinden gelir.
 * Veritabanı yoksa ya da kayıt boşsa çeviri metni kullanılır.
 */
async function getPageSeo(): Promise<{ title?: string; description?: string }> {
  try {
    const row = (await PageSetting.findOne({ pageId: 'services' }).lean()) as { title?: string; description?: string } | null;
    return { title: row?.title?.trim() || undefined, description: row?.description?.trim() || undefined };
  } catch {
    return {};
  }
}

/** Eski genel başlıklar artık tasarımla uyuşmuyor; yalnızca özel bir metin girildiyse kullanılır */
const LEGACY_TITLES = ['Sunduğumuz Hizmetler', 'Hizmetler', 'Hizmetlerimiz'];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const L = toFxLocale(lang);
  const t = await getFxText(L);
  const seo = L === 'tr' ? await getPageSeo() : {};
  const custom = seo.title && !LEGACY_TITLES.includes(seo.title);
  const title = `${custom ? seo.title : t('svcPage.metaTitle')} | Fixral`;
  const description = (custom && seo.description) || t('svcPage.metaDescription');
  const alternates = generateAlternates('/tr/services');

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
      images: generateOgImages(undefined, t('services.pageTitle')),
    },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const L = toFxLocale(lang);
  const crumbs = await getFxText(L, 'breadcrumb');
  const { services } = await getFxData();

  return (
    <div className="min-h-dvh bg-background">
      <BreadcrumbsJsonLd
        items={[
          { name: crumbs('home'), item: `${SITE_URL}/${L}` },
          { name: crumbs('services'), item: `${SITE_URL}/${L}/services` },
        ]}
      />
      <ServicesListJsonLd
        baseUrl={SITE_URL}
        items={services.map((s) => ({
          name: s.text[L].name,
          url: `/${L}/services/${s.slug}`,
          description: s.text[L].short,
        }))}
      />
      <ServicesIndexView lang={L} />
    </div>
  );
}
