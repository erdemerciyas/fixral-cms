import { Suspense } from 'react';
import PortfolioTemplate from '@/templates/PortfolioTemplate';
import { getPortfolioItems } from '@/lib/data';
import Category from '@/models/Category';
import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';
import { clip, leadText, normalizeCategoryList, normalizeProject, stripTags, type PfProject } from '@/components/portfolio/portfolio-data';
import PortfolioLoading from './loading';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const titleByLang = 'Portfolyo | Fixral';
  const descByLang = 'Tamamladığımız projeleri ve çalışmalarımızı keşfedin.';
  return {
    title: titleByLang,
    description: descByLang,
    alternates: generateAlternates('/tr/portfolio'),
    openGraph: {
      title: titleByLang,
      description: descByLang,
      url: `${SITE_URL}/${lang}/portfolio`,
      type: 'website',
      images: generateOgImages(undefined, titleByLang),
    },
  };
}

export default async function PortfolioPage() {
  const lang = 'tr';

  // getPortfolioItems hatayı kendi yakalar ([] döner); kategori sorgusu
  // başarısızsa veritabanına ulaşılamıyor demektir → tasarlanmış hata durumu.
  const rawItems = await getPortfolioItems(100);
  let loadError = false;
  let categories: ReturnType<typeof normalizeCategoryList> = [];
  try {
    const result = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    categories = normalizeCategoryList(JSON.parse(JSON.stringify(result)));
  } catch (error) {
    console.error('Portfolio categories fetch error:', error);
    loadError = rawItems.length === 0;
  }

  const items = (Array.isArray(rawItems) ? rawItems : [])
    .map((raw: unknown) => normalizeProject(raw, lang, categories))
    .filter((p: PfProject | null): p is PfProject => p !== null)
    // Liste için gereksiz ağır alanlar istemciye gönderilmez
    .map((p: PfProject) => ({
      ...p,
      content: undefined,
      models3D: [],
      images: p.images.slice(0, 1),
      excerpt: p.excerpt || leadText(p.description) || undefined,
      description: clip(stripTags(p.description), 600),
    }));

  return (
    // useSearchParams (filtre durumu) için Suspense sınırı
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioTemplate lang={lang} items={items} categories={categories} loadError={loadError} />
    </Suspense>
  );
}
