import { Metadata } from 'next';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';
import PageHero from '@/components/common/PageHero';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';
import { getMessages } from '@/i18n';
import NewsListClient from '@/components/news/NewsListClient';

interface PageProps {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{
        page?: string;
        search?: string;
        tag?: string;
    }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Haberler | Fixral',
        description: 'Fixral\'dan en son haberler ve duyuruları okuyun',
        alternates: generateAlternates('/tr/haberler', '/es/noticias'),
        openGraph: {
            title: 'Haberler | Fixral',
            description: 'Fixral\'dan en son haberler ve duyuruları okuyun',
            type: 'website',
            url: `${SITE_URL}/tr/haberler`,
            images: generateOgImages(undefined, 'Haberler | Fixral'),
        },
    };
}

const ITEMS_PER_PAGE = 12;

export default async function NewsListPage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
    const { lang } = await paramsPromise;
    const searchParams = await searchParamsPromise;
    try {
        await connectDB();

        const page = Math.max(1, parseInt(searchParams.page || '1'));
        const search = searchParams.search || '';
        const tag = searchParams.tag || '';

        const query: any = { status: 'published' };

        if (search) {
            query.$or = [
                { 'translations.tr.title': { $regex: search, $options: 'i' } },
                { 'translations.tr.content': { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        if (tag) {
            query.tags = tag;
        }

        const total = await News.countDocuments(query);
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

        const articles = (await News.find(query)
            .sort({ publishedAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .lean()) as NewsItem[];

        const allTags = await News.distinct('tags', { status: 'published' });
        const messages = await getMessages(lang) as any;
        const newsT = messages.news || {};
        const commonT = messages.common || {};

        const serializedArticles = articles.map((a) => ({
            _id: String(a._id),
            slug: a.slug,
            tags: a.tags || [],
            publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
            createdAt: new Date(a.createdAt).toISOString(),
            featuredImage: a.featuredImage ? { url: a.featuredImage.url, altText: a.featuredImage.altText } : undefined,
            translations: {
                tr: a.translations?.tr
                    ? { title: a.translations.tr.title, excerpt: a.translations.tr.excerpt, content: '', keywords: [] }
                    : { title: '', excerpt: '', content: '', keywords: [] },
            },
        }));

        return (
            <div className="min-h-screen bg-zinc-50">
                <PageHero
                    title={newsT.pageTitle || 'Haberler & Duyurular'}
                    description={newsT.pageDescription || ''}
                    showButton={false}
                />
                <section className="container-content py-4">
                    <Breadcrumbs />
                </section>

                <div className="container-content py-8">
                    <NewsListClient
                        articles={serializedArticles}
                        lang={lang}
                        search={search}
                        tag={tag}
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        allTags={allTags}
                        newsT={newsT}
                        commonT={commonT}
                    />
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error rendering news list page', 'NEWS_LIST', { error });
        throw error;
    }
}
