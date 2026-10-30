import { Metadata } from 'next';
import News from '@/models/News';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';
import PageHero from '@/components/common/PageHero';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';
import { getMessages } from '@/i18n';
import NewsListClient from '@/components/news/NewsListClient';
import { getFxData } from '@/lib/fx-data-server';
import { toFxLocale } from '@/content/fixral';

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
        alternates: generateAlternates('/tr/haberler'),
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

/** Panelde doldurulmuş sayfa başlığı alanları çeviri metninin üstüne yazılır */
const pickFilled = (o: { eyebrow: string; title: string; lede: string }) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v && v.trim())) as Record<string, string>;

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
        loadError?: boolean;
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

        view = { page, search, tag, total, totalPages, allTags, serializedArticles };
    } catch (error) {
        logger.error('Error rendering news list page', 'NEWS_LIST', { error });
        // Veri katmanı erişilemezse sayfa çökmez; tasarlanmış hata durumu gösterilir
        view = { page: 1, search: searchParams.search || '', tag: searchParams.tag || '', total: 0, totalPages: 0, allTags: [], serializedArticles: [], loadError: true };
    }

    const messages = (await getMessages(lang)) as { fx?: { news?: Record<string, string> } };
    const fxNews = { ...(messages.fx?.news || {}), ...pickFilled((await getFxData()).site.pages.news[toFxLocale(lang)]) };

    return (
      <div className="min-h-dvh bg-background">
        <PageHero
          title={fxNews.title || 'Atölyeden haberler.'}
          description={fxNews.lede || ''}
          badge={fxNews.eyebrow}
          showButton={false}
          showBreadcrumbs={true}
        />

        <NewsListClient
          articles={view.serializedArticles}
          lang={lang}
          locale="tr"
          search={view.search}
          tag={view.tag}
          total={view.total}
          page={view.page}
          totalPages={view.totalPages}
          allTags={view.allTags}
          loadError={view.loadError}
        />
      </div>
    );
}
