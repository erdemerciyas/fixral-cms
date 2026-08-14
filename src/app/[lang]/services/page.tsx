import type { Metadata } from 'next';
import Service from '@/models/Service';
import PageSetting from '@/models/PageSetting';
import ServicesTemplate from '@/templates/ServicesTemplate';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import ServicesListJsonLd from '@/components/seo/ServicesListJsonLd';

export const revalidate = 3600;

async function getData() {
  const [services, pageSettings] = await Promise.all([
    Service.find({}).sort({ createdAt: -1 }).lean(),
    PageSetting.findOne({ pageId: 'services' }).lean() as unknown as { title?: string; description?: string }
  ]);

  return {
    services: JSON.parse(JSON.stringify(services)),
    hero: {
      title: pageSettings?.title || 'Sunduğumuz Hizmetler',
      description: pageSettings?.description || 'Modern teknoloji çözümleri ve profesyonel hizmetlerimizi keşfedin'
    }
  };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const { hero } = await getData();
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fixral.com';

  return {
    title: `${hero.title} | Fixral`,
    description: hero.description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/services`,
      languages: {
        'tr-TR': `${SITE_URL}/tr/services`,
        'es-ES': `${SITE_URL}/es/services`,
        'x-default': `${SITE_URL}/tr/services`,
      },
    },
    openGraph: {
      title: `${hero.title} | Fixral`,
      description: hero.description,
      url: `${SITE_URL}/${lang}/services`,
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: hero.title }],
    },
  };
}

export default async function ServicesPage() {
  const { services, hero } = await getData();

  return (
    <div className="min-h-dvh bg-background">
      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: '/' },
          { name: 'Hizmetler', item: '/services' },
        ]}
      />

      <ServicesListJsonLd
        items={services.map((s: { title: string; description?: string; image?: string }) => {
          const anchor = s.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
          return {
            name: s.title,
            url: `/services#${anchor}`,
            description: s.description,
            image: s.image,
          };
        })}
      />

      <ServicesTemplate title={hero.title} description={hero.description} />
    </div>
  );
}
