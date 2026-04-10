import PortfolioTemplate from '@/templates/PortfolioTemplate';
import connectDB from '@/lib/mongoose';
import { getPortfolioItems } from '@/lib/data';
import PageSetting from '@/models/PageSetting';
import Category from '@/models/Category';
import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const titleByLang = lang === 'es' ? 'Portafolio | Fixral' : 'Portfolyo | Fixral';
  const descByLang = lang === 'es' ? 'Descubre nuestros proyectos y trabajos completados.' : 'Tamamladığımız projeleri ve çalışmalarımızı keşfedin.';
  return {
    title: titleByLang,
    description: descByLang,
    alternates: generateAlternates('/tr/portfolio', '/es/portfolio'),
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
  await connectDB();

  try {
    const portfolioItems = await getPortfolioItems(100);

    const categoriesResult = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    const categories = JSON.parse(JSON.stringify(categoriesResult));

    const pageSettingsRecord = await PageSetting.findOne({ pageId: 'portfolio' }).lean();
    const heroData = pageSettingsRecord ? JSON.parse(JSON.stringify(pageSettingsRecord)) : null;

    return (
      <PortfolioTemplate
        title="Portfolyo"
        items={portfolioItems}
        categories={categories}
        heroData={heroData}
      />
    );
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 py-8">
          <h3 className="text-xl font-semibold text-zinc-800 mb-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            Bir Hata Oluştu
          </h3>
          <p className="text-zinc-500 mb-6 text-sm">
            Portfolyo projeleri yüklenirken geçici bir sorun oluştu.
          </p>
        </div>
      </div>
    );
  }
}
