'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';

interface NewsCarouselProps {
  language: 'tr';
  limit?: number;
  autoplay?: boolean;
  className?: string;
}

/**
 * News Carousel Component
 * Displays featured news articles in a responsive carousel
 * - Mobile: 1 slide per view
 * - Tablet: 2 slides per view
 * - Desktop: 3 slides per view
 */
export default function NewsCarousel({
  language,
  limit = 6,
  autoplay = true,
  className = '',
}: NewsCarouselProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // prefers-reduced-motion: autoplay ve geçiş animasyonları devre dışı
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/public/news?status=published&limit=${limit}&sortBy=publishedAt&sortOrder=desc`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();

      if (data.success && data.data?.items) {
        setNews(data.data.items);
      } else {
        throw new Error(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error fetching news for carousel', 'NEWS_CAROUSEL', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ertelenmiş çağrı: fetch fonksiyonunun senkron kısmı (setState)
    // efekt gövdesinde değil, bir sonraki tick'te çalışsın
    const timer = setTimeout(() => { void fetchNews(); }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, limit]);

  if (loading) {
    return (
      <div className={`w-full bg-muted rounded-sm ${className}`}>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className={`w-full bg-muted rounded-sm ${className}`}>
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            {error ? `Error: ${error}` : 'No news articles available'}
          </p>
        </div>
      </div>
    );
  }

  const getTranslation = (item: NewsItem) => {
    return item.translations?.[language] || item.translations?.tr || { title: '', excerpt: '', content: '' };
  };

  const getNewsUrl = (slug: string) => {
    return `/tr/haberler/${slug}`;
  };

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        speed={reducedMotion ? 0 : 500}
        /* Lazy: next/image loading="lazy" + komşu slide'ların önceden yüklenmesi */
        lazyPreloadPrevNext={1}
        autoplay={
          autoplay && !reducedMotion
            ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        a11y={{
          enabled: true,
          prevSlideMessage: language === 'tr' ? 'Önceki haber' : 'Noticia anterior',
          nextSlideMessage: language === 'tr' ? 'Sonraki haber' : 'Siguiente noticia',
          firstSlideMessage: language === 'tr' ? 'İlk haber' : 'Primera noticia',
          lastSlideMessage: language === 'tr' ? 'Son haber' : 'Última noticia',
          paginationBulletMessage: language === 'tr' ? 'Haber {{index}}' : 'Noticia {{index}}',
        }}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }}
        className="news-carousel"
      >
        {news.map((item) => {
          const translation = getTranslation(item);
          const newsUrl = getNewsUrl(item.slug);

          return (
            <SwiperSlide key={item._id}>
              <Link href={newsUrl} className="block h-full">
                {/* Printables model-kart deseni: flat kart + hover lift */}
                <article className="group bg-card border border-border rounded-sm overflow-hidden h-full flex flex-col transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  {/* Image Container — 16/9 */}
                  <div className="relative w-full aspect-video overflow-hidden bg-muted">
                    <Image
                      src={item.featuredImage?.url || '/images/placeholder.jpg'}
                      alt={item.featuredImage?.altText || translation.title || ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      priority={false}
                      loading="lazy"
                    />
                  </div>

                  {/* Content Container */}
                  <div className="p-4 flex flex-col grow">
                    {/* Title */}
                    <h3 className="text-base font-medium leading-snug text-foreground line-clamp-2 mb-2">
                      {translation.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 grow">
                      {translation.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <time dateTime={new Date(item.publishedAt || item.createdAt).toISOString()}>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString(
                          'tr-TR',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </time>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <span className="truncate rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {item.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Styles — token tabanlı ok butonları + dot dili (Printables) */}
      <style jsx>{`
        :global(.news-carousel) {
          padding-bottom: 2.75rem;
          /* Swiper CSS değişkenleri — dikey hizalama ve dot metriği */
          --swiper-navigation-size: 42px;
          --swiper-pagination-bottom: 0px;
          --swiper-pagination-bullet-width: 8px;
          --swiper-pagination-bullet-height: 6px;
          --swiper-pagination-bullet-horizontal-gap: 0px;
          --swiper-pagination-bullet-inactive-opacity: 1;
        }

        /* ── Ok butonları: token chip, hover'da turuncu dolgu ── */
        :global(.news-carousel .swiper-button-next),
        :global(.news-carousel .swiper-button-prev) {
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--foreground));
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          box-shadow: none;
          transition:
            background-color 200ms ease,
            color 200ms ease,
            border-color 200ms ease;
        }

        :global(.news-carousel .swiper-button-next:hover),
        :global(.news-carousel .swiper-button-prev:hover) {
          background-color: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        :global(.news-carousel .swiper-button-next:focus-visible),
        :global(.news-carousel .swiper-button-prev:focus-visible) {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        :global(.news-carousel .swiper-button-disabled) {
          opacity: 0.4;
        }

        :global(.news-carousel .swiper-button-next::after),
        :global(.news-carousel .swiper-button-prev::after) {
          font-size: 15px;
          font-weight: 700;
        }

        /* ── Pagination: NewHero dot dili (8px pasif / 32px aktif pill) ── */
        :global(.news-carousel .swiper-pagination) {
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          line-height: 1;
        }

        :global(.news-carousel .swiper-pagination-bullet) {
          width: 8px;
          height: 6px;
          margin: 0;
          border-radius: 9999px;
          background-color: hsl(var(--muted-foreground) / 0.45);
          opacity: 1;
          transition:
            background-color 200ms ease,
            width 300ms ease;
        }

        :global(.news-carousel .swiper-pagination-bullet:hover) {
          background-color: hsl(var(--muted-foreground));
        }

        :global(.news-carousel .swiper-pagination-bullet:focus-visible) {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        :global(.news-carousel .swiper-pagination-bullet-active) {
          width: 32px;
          background-color: hsl(var(--primary));
        }

        @media (prefers-reduced-motion: reduce) {
          :global(.news-carousel .swiper-button-next),
          :global(.news-carousel .swiper-button-prev),
          :global(.news-carousel .swiper-pagination-bullet) {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
