import HomeTemplate from '@/templates/HomeTemplate';
import SiteSettings from '@/models/SiteSettings';
import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const canonical = `${SITE_URL}/tr`;

  let title = 'Fixral CMS';
  let description = '';

  try {
    const siteSettings = await SiteSettings.getSiteSettings();
    const seoConfig = siteSettings.seoConfig || {};
    title = siteSettings.siteName ? `${siteSettings.siteName}${seoConfig.metaTitleSuffix || ''}` : title;
    description = seoConfig.globalMetaDescription || siteSettings.slogan || siteSettings.description || '';
  } catch {
    // fallback to defaults
  }

  return {
    title,
    description,
    alternates: generateAlternates('/tr'),
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

  return (
    <HomeTemplate lang={lang} />
  );
}
