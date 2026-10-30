/**
 * Merkezi SEO yardımcı modülü
 * Tüm hreflang, canonical ve OG metadata üretimi buradan yapılır.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.fixral.com'
).replace(/\/$/, '');

/**
 * Verilen yol için alternates (canonical + hreflang) bloğu üretir.
 * Site tek dilli (Türkçe). Next.js Metadata API formatında döner.
 */
export function generateAlternates(path: string) {
  const url = `${SITE_URL}${path}`;
  return {
    canonical: url,
    languages: {
      'tr-TR': url,
      'x-default': url,
    },
  };
}

/**
 * Standart OG image dizisi döndürür.
 * Sayfaya özel resim yoksa /og-image.jpg fallback kullanılır.
 */
export function generateOgImages(imageUrl?: string, alt?: string) {
  return [
    {
      url: imageUrl || `${SITE_URL}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: alt || 'Fixral',
    },
  ];
}

/** Haber yazısı alternates bloğu */
export function getBlogAlternates(slug: string) {
  return generateAlternates(`/tr/haberler/${slug}`);
}

/** Portfolyo projesi alternates bloğu */
export function getPortfolioAlternates(slug: string) {
  return generateAlternates(`/tr/portfolio/${slug}`);
}

