'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import {
  Search as MagnifyingGlass,
  Video as VideoCamera,
  Tag,
  X,
  ChevronDown as CaretDown,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import VideoCard, { SkeletonCard, type Video } from '@/components/videos/VideoCard';

const ease = [0.32, 0.72, 0, 1] as const;

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                    */
/* ------------------------------------------------------------------ */
function SkeletonFilterPanel() {
  return (
    <div className="rounded-sm bg-card border border-border p-6 md:p-8 mb-10">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 h-14 rounded-xs bg-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
        </div>
        <div className="flex gap-3">
          <div className="h-14 w-48 rounded-xs bg-muted relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
          </div>
          <div className="h-14 w-40 rounded-xs bg-muted relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-xs bg-muted relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <SkeletonCard large />
      <SkeletonCard />
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Main Client Component                                               */
/* ================================================================== */
export default function VideosClient() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const typeFilter = searchParams?.get('type') || '';
  const channelFilter = searchParams?.get('channel') || '';

  /* ---- Data fetching ---- */
  const loadVideos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (channelFilter) params.append('channelId', channelFilter);
      params.append('status', 'visible');
      params.append('limit', '50');

      const response = await fetch(`/api/public/youtube?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
        setHasMore(data.hasMore);
        setNextPageToken(data.nextPageToken || null);

        const uniqueTags = [...new Set(data.videos.flatMap((video: any) => video.tags || []))];
        setAvailableTags(uniqueTags as string[]);

        const channelsRes = await fetch('/api/public/channels');
        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          setAvailableChannels(channelsData);
        }
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  }, [typeFilter, channelFilter]);

  useEffect(() => {
    // Ertelenmiş başlatma: efekt gövdesinde senkron setState yerine
    // bir sonraki tick'te yükleme tetiklenir
    const timer = setTimeout(() => {
      setLoading(true);
      loadVideos().finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [loadVideos]);

  /* ---- Client-side filtering (türetilmiş değer; efekt gerekmez) ---- */
  const filteredVideos = useMemo(() => {
    let result = videos;

    if (searchTerm) {
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((video) => selectedTags.every((tag) => video.tags.includes(tag)));
    }

    return result;
  }, [videos, searchTerm, selectedTags]);

  /* ---- Load more (infinite scroll) ---- */
  const loadMoreVideos = useCallback(async () => {
    if (!hasMore || !nextPageToken) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (channelFilter) params.append('channelId', channelFilter);
      params.append('status', 'visible');
      params.append('limit', '12');
      params.append('pageToken', nextPageToken);

      const response = await fetch(`/api/public/youtube?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVideos((prev) => [...prev, ...data.videos]);
        setNextPageToken(data.nextPageToken || null);
        setHasMore(!!data.nextPageToken);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [typeFilter, channelFilter, hasMore, nextPageToken]);

  useEffect(() => {
    if (loading || loadingMore) return;
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreVideos();
      }
    });
    if (lastVideoElementRef.current) {
      observer.current.observe(lastVideoElementRef.current);
    }
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, loadingMore, hasMore, loadMoreVideos]);

  /* ---- Helpers ---- */
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const typeButtons = [
    { value: '', label: 'Tümü' },
    { value: 'normal', label: 'Video' },
    { value: 'short', label: 'Kısa' },
  ] as const;

  /* ---- Loading State ---- */
  if (loading) {
    return (
      <div className="container-content py-8">
        <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 100% { transform: translateX(100%); } }` }} />
        <SkeletonFilterPanel />
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div id="video-content" className="container-content py-8">
      <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 100% { transform: translateX(100%); } }` }} />

      {/* Glassmorphism filter panel */}
      <ScrollReveal>
        <div className="rounded-sm bg-card border border-border p-6 md:p-8 mb-10 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Video ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-background border border-input rounded-xs text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring outline-hidden shadow-xs transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none"
              />
              <AnimatePresence>
                {searchTerm && (
                  <m.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xs hover:bg-muted"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </m.button>
                )}
              </AnimatePresence>
            </div>

            {/* Type toggle + Channel select */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex rounded-xs border border-border bg-muted p-1">
                {typeButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => {
                      const url = new URL(window.location.href);
                      if (btn.value) {
                        url.searchParams.set('type', btn.value);
                      } else {
                        url.searchParams.delete('type');
                      }
                      router.push(url.pathname + url.search);
                    }}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xs relative transition-colors duration-200 motion-reduce:transition-none ${
                      typeFilter === btn.value
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {typeFilter === btn.value && (
                      <m.span
                        layoutId="type-pill"
                        className="absolute inset-0 rounded-xs bg-primary"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{btn.label}</span>
                  </button>
                ))}
              </div>

              {availableChannels.length > 0 && (
                <div className="relative">
                  <select
                    value={channelFilter}
                    onChange={(e) => {
                      const url = new URL(window.location.href);
                      if (e.target.value) {
                        url.searchParams.set('channel', e.target.value);
                      } else {
                        url.searchParams.delete('channel');
                      }
                      router.push(url.pathname + url.search);
                    }}
                    className="appearance-none bg-background border border-input rounded-xs pl-4 pr-10 py-3 text-sm text-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring outline-hidden cursor-pointer transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none"
                  >
                    <option value="">Tüm Kanallar</option>
                    {availableChannels.map((channel) => (
                      <option key={channel.channelId} value={channel.channelId}>
                        {channel.channelName} ({channel.videoCount})
                      </option>
                    ))}
                  </select>
                  <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Tag pills */}
          {availableTags.length > 0 && (
            <div className="border-t border-border pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground mr-1">
                  <Tag className="w-3.5 h-3.5" />
                  Etiketler
                </span>
                {availableTags.map((tag) => (
                  <m.button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-1.5 rounded-xs text-xs font-medium transition-colors duration-200 motion-reduce:transition-none ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {tag}
                  </m.button>
                ))}
                <AnimatePresence>
                  {(searchTerm || selectedTags.length > 0) && (
                    <m.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, ease }}
                      onClick={clearSearch}
                      className="px-4 py-1.5 rounded-xs text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 ml-1"
                    >
                      <X className="w-3 h-3 inline mr-1 -mt-px" />
                      Temizle
                    </m.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Results summary */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <VideoCamera className="w-4 h-4" />
              <span className="font-mono text-sm tabular-nums">
                {filteredVideos.length} video
              </span>
            </div>
            {(searchTerm || selectedTags.length > 0) && (
              <button
                onClick={clearSearch}
                className="text-xs font-medium text-accent-foreground hover:underline underline-offset-2"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Bento grid */}
      {filteredVideos.length > 0 ? (
        <>
          <ScrollReveal stagger className="grid grid-cols-12 gap-5">
            {filteredVideos.map((video, index) => (
              <VideoCard
                key={video.videoId}
                video={video}
                index={index}
                innerRef={index === filteredVideos.length - 1 ? lastVideoElementRef : undefined}
              />
            ))}
          </ScrollReveal>

          {/* Loading more */}
          <AnimatePresence>
            {loadingMore && (
              <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4, ease }}
                className="grid grid-cols-12 gap-5 mt-5"
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </m.div>
            )}
          </AnimatePresence>

          {!hasMore && !loadingMore && filteredVideos.length > 6 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease }}
              className="text-center py-10"
            >
              <span className="text-sm text-muted-foreground">
                Tüm videolar yüklendi
              </span>
            </m.div>
          )}
        </>
      ) : (
        <ScrollReveal>
          <div className="text-center py-20 rounded-sm bg-card border border-border">
            <div className="w-16 h-16 mx-auto mb-5 rounded-sm bg-muted flex items-center justify-center">
              <VideoCamera className="w-8 h-8 text-primary" />
            </div>
            <h3
              className="text-lg font-semibold text-foreground mb-2"
            >
              Video bulunamadı
            </h3>
            <p
              className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed"
            >
              {searchTerm || selectedTags.length > 0
                ? 'Aramanızla eşleşen bir video bulunamadı. Farklı anahtar kelimeler kullanmayı veya filtreleri temizlemeyi deneyin.'
                : 'Henüz hiç video eklenmemiş. Daha sonra tekrar kontrol edin.'}
            </p>
            {(searchTerm || selectedTags.length > 0) && (
              <button
                onClick={clearSearch}
                className="mt-5 px-5 py-2.5 rounded-xs text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 motion-reduce:transition-none"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
