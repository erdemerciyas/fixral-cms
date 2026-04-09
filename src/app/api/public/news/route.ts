import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import Language from '@/models/Language';
import User from '@/models/User';
import slugify from 'slugify';
import { ApiResponse, NewsListResponse, CreateNewsInput, NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';
import { validateNewsInput } from '@/lib/validation';

/**
 * @swagger
 * /api/news:
 *   get:
 *     tags:
 *       - News
 *     summary: Get news articles list
 *     description: Retrieve a paginated list of news articles with optional filtering
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News articles retrieved successfully
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '10'));
    const status = searchParams.get('status') as 'draft' | 'published' | null;
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    // Only show active articles to non-authenticated users
    const session = await getServerSession(authOptions);
    if (!session) {
      query.isActive = true;
    } else if (status) {
      query.isActive = status === 'published';
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { excerpt: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await News.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Fetch articles
    const articles = (await News.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as NewsItem[];

    const response: ApiResponse<NewsListResponse> = {
      success: true,
      data: {
        items: articles,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching news articles', 'NEWS_API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news articles',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/news:
 *   post:
 *     tags:
 *       - News
 *     summary: Create a new news article
 *     description: Create a new news article with multilingual content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               translations:
 *                 type: object
 *               featuredImage:
 *                 type: object
 *               tags:
 *                 type: array
 *     responses:
 *       201:
 *         description: News article created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = validateNewsInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create news article
    const newsData: CreateNewsInput = body;
    logger.info('Creating news with data', 'NEWS_API', { newsData });

    // Resolve author
    let authorName = session.user.name || session.user.email?.split('@')[0] || 'Admin';
    if (session.user.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        authorName = user.name || authorName;
      }
    }

    // Generate slug from any available translation title
    let titleForSlug = 'news';
    let mainTitle = '';
    if (newsData.translations) {
      for (const trans of Object.values(newsData.translations)) {
        if ((trans as any)?.title) {
          titleForSlug = (trans as any).title;
          mainTitle = titleForSlug;
          break;
        }
      }
    }
    const slugBase = slugify(titleForSlug, { lower: true, strict: true, replacement: '-' });
    const slug = `${slugBase}-${Date.now()}`;

    const news = await News.create({
      ...newsData,
      title: mainTitle || titleForSlug,
      slug,
      author: authorName,
      isActive: newsData.status === 'published',
      translations: newsData.translations || null,
    });

    logger.info('News saved successfully', 'NEWS_API', { newsId: news._id });

    // Revalidate cache for new news article
    const { revalidateNewsDetail, revalidateNewsListing, revalidateNewsCarousel } = await import('@/lib/news-cache-service');
    await revalidateNewsDetail(news.slug);
    await revalidateNewsListing();
    await revalidateNewsCarousel();

    logger.info('News article created', 'NEWS_API', {
      newsId: news._id,
      slug: news.slug,
    });

    const response: ApiResponse<any> = {
      success: true,
      data: news,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Error creating news article', 'NEWS_API', {
      error: errorMessage,
      stack: errorStack,
      errorType: error?.constructor?.name,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const detailedError = isProduction ? 'Failed to create news article' : errorMessage;

    return NextResponse.json(
      {
        success: false,
        error: detailedError,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
