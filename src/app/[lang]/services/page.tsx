import type { Metadata } from 'next';
import connectDB from '@/lib/mongoose';
import Service from '@/models/Service';
import PageSetting from '@/models/PageSetting';
import ServicesClient from './ServicesClient';
import PageHero from '@/components/common/PageHero';
import Breadcrumbs from '@/components/Breadcrumbs';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import ServicesListJsonLd from '@/components/seo/ServicesListJsonLd';

export const revalidate = 3600; // 1 saatte bir yenile

async function getData() {
  await connectDB();

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
    <div className="min-h-screen bg-white">
      <PageHero
        title={hero.title}
        description={hero.description}
        buttonText="Hizmetleri İncele"
        buttonLink="#services"
        showButton={true}
      />

      <section className="container-content py-4">
        <Breadcrumbs />
      </section>

      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: '/' },
          { name: 'Hizmetler', item: '/services' },
        ]}
      />

      <ServicesListJsonLd
        items={services.map((s: any) => {
          const anchor = s.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
          return {
            name: s.title,
            url: `/services#${anchor}`,
            description: s.description,
            image: s.image,
          };
        })}
      />

      <ServicesClient services={services} hero={hero} />
    </div>
  );
}