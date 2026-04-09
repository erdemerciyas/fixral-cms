import { getSliderItems, getPortfolioItems, getServices } from '@/lib/data';
import HomeTemplate from '@/templates/HomeTemplate';
import connectDB from '@/lib/mongoose';
import SiteSettings from '@/models/SiteSettings';
import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const canonical = lang === 'es' ? `${SITE_URL}/es` : `${SITE_URL}/tr`;

  let title = 'Personal Blog';
  let description = '';

  try {
    await connectDB();
    const siteSettings = await SiteSettings.getSiteSettings();
    title = siteSettings.siteName || title;
    description = siteSettings.slogan || siteSettings.description || '';
  } catch {
    // fallback to defaults
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'tr-TR': `${SITE_URL}/tr`,
        'es-ES': `${SITE_URL}/es`,
        'x-default': `${SITE_URL}/tr`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: generateOgImages(undefined, title),
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  await connectDB();

  const [sliderItems, portfolioItems, services] = await Promise.all([
    getSliderItems(),
    getPortfolioItems(6),
    getServices(6)
  ]);

  return (
    <HomeTemplate
      sliderItems={sliderItems}
      portfolioItems={portfolioItems}
      services={services}
      lang={lang}
    />
  );
}
