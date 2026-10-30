import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';
import { getMessages } from '@/i18n';
import ContactClient from './ContactClient';

export const revalidate = 3600;

type ContactMeta = { title: string; description: string };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `${SITE_URL}/tr/contact`;
  const messages = (await getMessages(lang)) as { fx?: { contact?: { meta?: ContactMeta } } };
  const meta: ContactMeta = messages.fx?.contact?.meta ?? {
    title: 'İletişim ve teklif | FIXRAL',
    description: 'Parçanızı dört kısa adımda anlatın; iki iş günü içinde yöntem, süre ve fiyatla dönelim.',
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: generateAlternates('/tr/contact'),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: 'website',
      images: generateOgImages(undefined, meta.title),
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <ContactClient lang={lang} />;
}
