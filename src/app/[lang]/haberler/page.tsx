import { Metadata } from 'next';
import News from '@/models/News';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';
import NewsListTemplate from '@/templates/NewsListTemplate';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';
import { getMessages } from '@/i18n';

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
    let view: {
        page: number;
        search: string;
        tag: string;
        total: number;
        totalPages: number;
        allTags: string[];
        newsT: Record<string, string>;
        commonT: Record<string, string>;
        serializedArticles: Array<{
            _id: string;
            slug: string;
            tags: string[];
            publishedAt?: string;
            createdAt: string;
            featuredImage?: { url: string; altText?: string };
            translations: { tr: { title: string; excerpt: string; content: string; keywords: string[] } };
        }>;
    };
    try {
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

        view = { page, search, tag, total, totalPages, allTags, newsT, commonT, serializedArticles };
    } catch (error) {
        logger.error('Error rendering news list page', 'NEWS_LIST', { error });
        throw error;
    }

    return (
        <NewsListTemplate
            title={view.newsT.pageTitle || 'Haberler & Duyurular'}
            description={view.newsT.pageDescription || ''}
            articles={view.serializedArticles}
            lang={lang}
            search={view.search}
            tag={view.tag}
            total={view.total}
            page={view.page}
            totalPages={view.totalPages}
            allTags={view.allTags}
            newsT={view.newsT}
            commonT={view.commonT}
        />
    );
}
