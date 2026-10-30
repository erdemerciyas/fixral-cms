import { revalidatePath, revalidateTag } from 'next/cache';
import { logger } from '@/core/lib/logger';

/**
 * News Cache Service
 * Manages ISR revalidation and cache invalidation for news articles.
 * Used via dynamic import from /api/public/news routes.
 */

/**
 * Revalidate news carousel on homepage
 */
export async function revalidateNewsCarousel(): Promise<void> {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/tr', 'page');

    revalidateTag('news-carousel', 'max');
    revalidateTag('news-list', 'max');

    logger.info('News carousel revalidated', 'CACHE_SERVICE');
  } catch (error) {
    logger.error('Error revalidating news carousel', 'CACHE_SERVICE', { error });
  }
}

/**
 * Revalidate news detail page
 */
export async function revalidateNewsDetail(slug: string): Promise<void> {
  try {
    revalidatePath(`/tr/haberler/${slug}`, 'page');

    revalidateTag(`news-${slug}`, 'max');

    logger.info('News detail page revalidated', 'CACHE_SERVICE', { slug });
  } catch (error) {
    logger.error('Error revalidating news detail', 'CACHE_SERVICE', { error });
  }
}

/**
 * Revalidate news listing pages
 */
export async function revalidateNewsListing(): Promise<void> {
  try {
    revalidatePath('/tr/haberler', 'page');

    revalidateTag('news-list', 'max');

    logger.info('News listing pages revalidated', 'CACHE_SERVICE');
  } catch (error) {
    logger.error('Error revalidating news listing', 'CACHE_SERVICE', { error });
  }
}
