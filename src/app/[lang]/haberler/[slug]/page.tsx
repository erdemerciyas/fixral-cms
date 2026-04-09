import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { ensureModels } from '@/lib/ensure-models';
import { logger } from '@/core/lib/logger';

import { SITE_URL, getBlogAlternates, generateOgImages } from '@/lib/seo-utils';
import NewsDetailClient from '@/components/news/NewsDetailClient';

interface PageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { slug } = await params;
        await connectDB();

        let newsDoc = await News.findOne({ slug }).lean();

        if (!newsDoc) {
            const decodedSlug = decodeURIComponent(slug);
            if (decodedSlug !== slug) {
                newsDoc = await News.findOne({ slug: decodedSlug }).lean();
            }
        }

        if (!newsDoc) {
            return {
                title: 'Not Found',
                description: 'The requested news article was not found.',
            };
        }

        const news = newsDoc as any;
        if (news.status !== 'published') {
            return {
                title: 'Not Found',
                description: 'The requested news article was not found.',
            };
        }

        const translations = normalizeTranslations(news.translations);
        const translation = translations.tr || { title: '', metaDescription: '', keywords: [] };
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
                url: `${SITE_URL}/tr/haberler/${news.slug}`,
                images: ogImages,
                publishedTime: news.publishedAt ? new Date(news.publishedAt).toISOString() : undefined,
                authors: [news.author?.name || ''],
            },
            twitter: {
                card: 'summary_large_image',
                title: translation.title,
                description: translation.metaDescription,
                images: ogImages[0]?.url ? [ogImages[0].url] : [],
            },
        };
    } catch (error) {
        logger.error('Error generating metadata for news detail', 'NEWS_DETAIL', { error });
        return {
            title: 'News Article',
            description: 'Read the latest news article',
        };
    }
}

export async function generateStaticParams() {
    try {
        await connectDB();

        const news = await News.find({ status: 'published' })
            .select('slug')
            .lean();

        logger.info('Generated static params for news articles', 'NEWS_DETAIL', { count: news.length });

        return news.map((item: any) => ({
            lang: 'tr',
            slug: item.slug,
        }));
    } catch (error) {
        logger.error('Error generating static params for news', 'NEWS_DETAIL', { error });
        return [];
    }
}

export const dynamic = 'force-dynamic';

function normalizeTranslations(translations: any): Record<string, any> {
    if (!translations) return {};
    if (translations instanceof Map) {
        const obj: Record<string, any> = {};
        translations.forEach((value: any, key: string) => {
            obj[key] = value;
        });
        return obj;
    }
    if (typeof translations === 'object' && !Array.isArray(translations)) {
        return translations;
    }
    return {};
}

async function findNewsWithRetry(slug: string): Promise<any | null> {
    await connectDB();
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
            logger.warn('News populate failed, trying without populate', 'NEWS_DETAIL', {
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
                logger.error('News fallback query also failed', 'NEWS_DETAIL', {
                    slug: trySlug,
                    error: (fallbackError as Error).message
                });
            }
        }
    }
    return null;
}

export default async function NewsDetailPage({ params: paramsPromise }: PageProps) {
    const { lang, slug } = await paramsPromise;
    try {
        const news = await findNewsWithRetry(slug);

        if (!news) {
            logger.warn('News article not found after retries', 'NEWS_DETAIL', {
                slug,
                decodedSlug: decodeURIComponent(slug)
            });
            notFound();
        }

        if (news.status !== 'published') {
            logger.warn('News article not published', 'NEWS_DETAIL', { slug, status: news.status });
            notFound();
        }

        const translation = news.translations?.tr || { title: '', metaDescription: '', content: '', excerpt: '', keywords: [] };

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
                name: news.author?.name || '',
                email: news.author?.email || '',
            },
            publisher: {
                '@type': 'Organization',
                name: 'Fixral',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://www.fixral.com/logo.png',
                },
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://www.fixral.com/tr/haberler/${news.slug}`,
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
                translations: { tr: { title: rn.translations?.tr?.title || '' } },
            })),
        };

        const serializedTranslation = {
            title: translation.title || '',
            excerpt: translation.excerpt || '',
            content: typeof translation.content === 'string' ? translation.content : (translation.content ? JSON.stringify(translation.content) : ''),
            metaDescription: translation.metaDescription || '',
            keywords: translation.keywords || [],
        };

        return (
            <div className="min-h-screen">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                <NewsDetailClient
                    lang={lang}
                    news={serializedNews}
                    translation={serializedTranslation}
                />
            </div>
        );
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const errStack = error instanceof Error ? error.stack : undefined;
        logger.error('Error rendering news detail page', 'NEWS_DETAIL', { error: errMsg, stack: errStack });
        notFound();
    }
}
