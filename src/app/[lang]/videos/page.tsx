import type { Metadata } from 'next';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import VideosTemplate from '@/templates/VideosTemplate';

export const revalidate = 3600;

async function getHeroData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/page-settings/videos`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || 'Videolar',
        description: data.description || 'YouTube kanalımızdaki en güncel ve popüler içeriklerimize göz atın',
        buttonText: data.buttonText || 'Videoları Keşfet',
        buttonLink: data.buttonLink || '#video-content',
      };
    }
  } catch {
    // fallback
  }
  return {
    title: 'Videolar',
    description: 'YouTube kanalımızdaki en güncel ve popüler içeriklerimize göz atın',
    buttonText: 'Videoları Keşfet',
    buttonLink: '#video-content',
  };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const hero = await getHeroData();
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fixral.com';

  return {
    title: `${hero.title} | Fixral`,
    description: hero.description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/videos`,
      languages: {
        'tr-TR': `${SITE_URL}/tr/videos`,
        'es-ES': `${SITE_URL}/es/videos`,
        'x-default': `${SITE_URL}/tr/videos`,
      },
    },
    openGraph: {
      title: `${hero.title} | Fixral`,
      description: hero.description,
      url: `${SITE_URL}/${lang}/videos`,
      type: 'website',
    },
  };
}

export default async function VideosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const hero = await getHeroData();

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: '/' },
          { name: 'Videolar', item: '/videos' },
        ]}
      />
      <VideosTemplate title={hero.title} description={hero.description} />
    </>
  );
}
