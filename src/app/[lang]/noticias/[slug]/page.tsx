import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import News from '@/models/News';
import { ensureModels } from '@/lib/ensure-models';
import { logger } from '@/core/lib/logger';

import { SITE_URL, getBlogAlternates, generateOgImages } from '@/lib/seo-utils';
import NewsDetailClient from '@/components/news/NewsDetailClient';
import NewsDetailTemplate from '@/templates/NewsDetailTemplate';

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

// Helper: safely convert Mongoose Map to plain object for translations
function normalizeTranslations(translations: any): Record<string, any> {
  if (!translations) return {};
  if (translations instanceof Map) {
    const obj: Record<string, any> = {};
    translations.forEach((value: any, key: string) => { obj[key] = value; });
    return obj;
  }
  if (typeof translations === 'object' && !Array.isArray(translations)) {
    return translations;
  }
  return {};
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  try {
    let newsDoc = await News.findOne({ slug }).lean();

    if (!newsDoc) {
      const decodedSlug = decodeURIComponent(slug);
      if (decodedSlug !== slug) {
        newsDoc = await News.findOne({ slug: decodedSlug }).lean();
      }
    }

    if (!newsDoc) {
      return {
        title: 'No encontrado',
        description: 'El artículo de noticias solicitado no fue encontrado.',
      };
    }

    const news = newsDoc as any;
    if (news.status !== 'published') {
      return {
        title: 'No encontrado',
        description: 'El artículo de noticias solicitado no fue encontrado.',
      };
    }

    const translations = normalizeTranslations(news.translations);
    const translation = translations.es || { title: '', metaDescription: '', keywords: [] };
    const ogImages = news.featuredImage?.url
      ? [{ url: news.featuredImage.url, width: 1200, height: 630, alt: news.featuredImage.altText }]
      : generateOgImages(undefined, translation.title);

    return {
      title: translation.title,
      description: translation.metaDescription,
      keywords: translation.keywords,
      alternates: getBlogAlternates(news.slug),
      openGraph: {
        title: translation.title,
        description: translation.metaDescription,
        type: 'article',
        url: `${SITE_URL}/${lang}/noticias/${news.slug}`,
        images: ogImages,
        publishedTime: news.publishedAt ? new Date(news.publishedAt).toISOString() : undefined,
        authors: [news.author?.name || 'Fixral'],
      },
      twitter: {
        card: 'summary_large_image',
        title: translation.title,
        description: translation.metaDescription,
        images: ogImages[0]?.url ? [ogImages[0].url] : [],
      },
    };
  } catch (error) {
    logger.error('Error generating metadata for news detail (ES)', 'NEWS_DETAIL', { error });
    return {
      title: 'Artículo de noticias',
      description: 'Lee el último artículo de noticias',
    };
  }
}

export async function generateStaticParams() {
  try {
    const news = await News.find({ status: 'published' })
      .select('slug')
      .lean();

    logger.info('Generated static params for news articles (ES)', 'NEWS_DETAIL', { count: news.length });

    return news.map((item: any) => ({
      lang: 'es',
      slug: item.slug,
    }));
  } catch (error) {
    logger.error('Error generating static params for news (ES)', 'NEWS_DETAIL', { error });
    return [];
  }
}

/**
 * Force dynamic rendering - required because next-intl's requestLocale
 * internally calls headers(), which is incompatible with static/ISR rendering.
 */
export const dynamic = 'force-dynamic';

async function findNewsWithRetry(slug: string): Promise<any | null> {
  await ensureModels('Portfolio', 'News');

  const slugsToTry = [slug];
  const decodedSlug = decodeURIComponent(slug);
  if (decodedSlug !== slug) {
    slugsToTry.push(decodedSlug);
  }

  for (const trySlug of slugsToTry) {
    try {
      const news = await News.findOne({ slug: trySlug })
        .populate('relatedPortfolioIds', 'title slug coverImage')
        .populate('relatedNewsIds', 'slug translations featuredImage')
        .lean();

      if (news) {
        const normalized = news as any;
        normalized.translations = normalizeTranslations(normalized.translations);
        if (normalized.relatedNewsIds && Array.isArray(normalized.relatedNewsIds)) {
          normalized.relatedNewsIds = normalized.relatedNewsIds.map((rn: any) => {
            if (rn && rn.translations) {
              rn.translations = normalizeTranslations(rn.translations);
            }
            return rn;
          });
        }
        return normalized;
      }
    } catch (populateError) {
      logger.warn('News populate failed (ES), trying without populate', 'NEWS_DETAIL', {
        slug: trySlug,
        error: (populateError as Error).message
      });
      try {
        const news = await News.findOne({ slug: trySlug }).lean();
        if (news) {
          const normalized = news as any;
          normalized.translations = normalizeTranslations(normalized.translations);
          normalized.relatedPortfolioIds = [];
          normalized.relatedNewsIds = [];
          return normalized;
        }
      } catch (fallbackError) {
        logger.error('News fallback query also failed (ES)', 'NEWS_DETAIL', {
          slug: trySlug,
          error: (fallbackError as Error).message
        });
      }
    }
  }
  return null;
}

async function prepareNewsView(slug: string, lang: string) {
  try {
    const news = await findNewsWithRetry(slug);

    if (!news) {
      logger.warn('News article not found after retries (ES)', 'NEWS_DETAIL', {
        slug,
        decodedSlug: decodeURIComponent(slug)
      });
      return null;
    }

    if (news.status !== 'published') {
      logger.warn('News article not published (ES)', 'NEWS_DETAIL', { slug, status: news.status });
      return null;
    }

    const translation = news.translations?.es || { title: '', metaDescription: '', content: '', excerpt: '', keywords: [] };

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: translation.title || news.slug,
      description: translation.metaDescription || '',
      image: news.featuredImage?.url || '',
      datePublished: news.publishedAt ? new Date(news.publishedAt).toISOString() : new Date(news.createdAt).toISOString(),
      dateModified: new Date(news.updatedAt).toISOString(),
      author: {
        '@type': 'Person',
        name: news.author?.name || 'Fixral',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fixral',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/${lang}/noticias/${news.slug}`,
      },
    };

    const serializedNews = {
      slug: news.slug,
      status: news.status,
      tags: news.tags || [],
      publishedAt: news.publishedAt ? new Date(news.publishedAt).toISOString() : undefined,
      createdAt: new Date(news.createdAt).toISOString(),
      updatedAt: new Date(news.updatedAt).toISOString(),
      featuredImage: news.featuredImage ? { url: news.featuredImage.url, altText: news.featuredImage.altText } : undefined,
      author: news.author ? { name: news.author.name, email: news.author.email } : undefined,
      relatedPortfolioIds: (news.relatedPortfolioIds || []).filter(Boolean).map((p: any) => ({
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        coverImage: p.coverImage,
      })),
      relatedNewsIds: (news.relatedNewsIds || []).filter(Boolean).map((rn: any) => ({
        _id: String(rn._id),
        slug: rn.slug,
        featuredImage: rn.featuredImage ? { url: rn.featuredImage.url, altText: rn.featuredImage.altText } : undefined,
        translations: {
          tr: { title: rn.translations?.tr?.title || '' },
          es: { title: rn.translations?.es?.title || '' },
        },
      })),
    };

    const serializedTranslation = {
      title: translation.title || '',
      excerpt: translation.excerpt || '',
      content: typeof translation.content === 'string' ? translation.content : (translation.content ? JSON.stringify(translation.content) : ''),
      metaDescription: translation.metaDescription || '',
      keywords: translation.keywords || [],
    };

    return { jsonLd, serializedNews, serializedTranslation };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    logger.error('Error rendering news detail page (ES)', 'NEWS_DETAIL', { error: errMsg, stack: errStack });
    return null;
  }
}

export default async function NewsDetailPage({ params: paramsPromise }: PageProps) {
  const { lang, slug } = await paramsPromise;
  const view = await prepareNewsView(slug, lang);
  if (!view) {
    notFound();
  }
  const { jsonLd, serializedNews, serializedTranslation } = view;

  return (
    <NewsDetailTemplate>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <NewsDetailClient
        lang={lang}
        locale="es"
        news={serializedNews}
        translation={serializedTranslation}
      />
    </NewsDetailTemplate>
  );
}
