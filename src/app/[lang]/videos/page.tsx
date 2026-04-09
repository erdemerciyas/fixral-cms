'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  Play,
  VideoCamera,
  Tag,
  X,
  CaretDown,
  FilmStrip,
  Lightning,
} from '@phosphor-icons/react';
import PageHero from '@/components/common/PageHero';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface Video {
  _id?: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  type: 'short' | 'normal';
  status: 'visible' | 'hidden';
  tags: string[];
}

const ease = [0.32, 0.72, 0, 1] as const;

function SkeletonCard({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/60 col-span-12 ${
        large ? 'md:col-span-8 aspect-[16/9]' : 'md:col-span-4 aspect-[16/10]'
      }`}
    >
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
      </div>
    </div>
  );
}

function SkeletonFilterPanel() {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/40 p-6 md:p-8 mb-10">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
        </div>
        <div className="flex gap-3">
          <div className="h-14 w-48 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
          </div>
          <div className="h-14 w-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800/60 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
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

function VideoCardRedesigned({
  video,
  index,
  innerRef,
}: {
  video: Video;
  index: number;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const isLarge = index < 1;
  const isMedium = index === 1;

  const colSpan = isLarge
    ? 'md:col-span-8'
    : isMedium
      ? 'md:col-span-4'
      : 'md:col-span-4';

  return (
    <motion.div
      ref={innerRef}
      className={`col-span-12 ${colSpan} group`}
      initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.06, 0.48), ease }}
    >
      <a
        href={`https://www.youtube.com/watch?v=${video.videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-700/30 shadow-[0_2px_20px_rgba(0,52,80,0.06)] hover:shadow-[0_8px_40px_rgba(0,52,80,0.12)] transition-shadow"
        style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
      >
        <div className={`relative overflow-hidden ${isLarge ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform"
            style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
          />

          <div
            className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/30 flex items-center justify-center transition-colors"
            style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
          >
            <div
              className="w-14 h-14 rounded-full bg-white/90 dark:bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_24px_rgba(0,52,80,0.2)] opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all"
              style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
            >
              <Play weight="fill" className="w-6 h-6 text-[#003450] ml-0.5" />
            </div>
          </div>

          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium tracking-wide rounded-full backdrop-blur-sm ${
                video.type === 'short'
                  ? 'bg-violet-500/80 text-white'
                  : 'bg-[#003450]/80 text-white'
              }`}
            >
              {video.type === 'short' ? (
                <Lightning weight="light" className="w-3 h-3" />
              ) : (
                <FilmStrip weight="light" className="w-3 h-3" />
              )}
              {video.type === 'short' ? 'Kisa' : 'Video'}
            </span>
          </div>
        </div>

        <div className={`p-5 ${isLarge ? 'md:p-7' : ''}`}>
          <h3
            className={`font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-2 group-hover:text-[#003450] dark:group-hover:text-sky-300 transition-colors ${
              isLarge ? 'text-lg md:text-xl' : 'text-base'
            }`}
            style={{
              fontFamily: 'var(--font-geist-sans)',
              transitionDuration: '700ms',
              transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {video.title}
          </h3>

          {(isLarge || isMedium) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              {video.description}
            </p>
          )}

          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {video.tags.slice(0, isLarge ? 4 : 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 tracking-wide"
                >
                  {tag}
                </span>
              ))}
              {video.tags.length > (isLarge ? 4 : 2) && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                  +{video.tags.length - (isLarge ? 4 : 2)}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span
              className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              {new Date(video.publishedAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span
              className="text-xs font-medium text-[#003450] dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                fontFamily: 'var(--font-geist-sans)',
                transitionDuration: '700ms',
                transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              Izle &rarr;
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [hero, setHero] = useState<{
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  }>({
    title: 'Videolar',
    description: 'YouTube kanalimzdaki en guncel ve populer iceriklerimize goz atin',
    buttonText: 'Videolari Kesfet',
    buttonLink: '#video-content',
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const typeFilter = searchParams?.get('type') || '';
  const channelFilter = searchParams?.get('channel') || '';

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
      } else {
        console.error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  }, [typeFilter, channelFilter]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);

      try {
        const heroRes = await fetch('/api/admin/page-settings/videos');
        if (heroRes.ok) {
          const heroData = await heroRes.json();
          setHero({
            title: heroData.title || 'Videolar',
            description: heroData.description || 'YouTube kanalimzdaki en guncel ve populer iceriklerimize goz atin',
            buttonText: heroData.buttonText || 'Videolari Kesfet',
            buttonLink: heroData.buttonLink || '#video-content',
          });
        } else {
          setHero({
            title: 'Videolar',
            description: 'YouTube kanalimzdaki en guncel ve populer iceriklerimize goz atin',
            buttonText: 'Videolari Kesfet',
            buttonLink: '#video-content',
          });
        }

        await loadVideos();
      } catch (err) {
        console.error('Videos page fetch error:', err);
        await loadVideos();
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [typeFilter, channelFilter, loadVideos]);

  useEffect(() => {
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

    setFilteredVideos(result);
  }, [videos, searchTerm, selectedTags]);

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
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, loadMoreVideos]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const typeButtons = [
    { value: '', label: 'Tumu' },
    { value: 'normal', label: 'Video' },
    { value: 'short', label: 'Kisa' },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        ` }} />
        <PageHero
          title={hero.title}
          description={hero.description}
          buttonText={hero.buttonText}
          buttonLink={hero.buttonLink}
        />
        <div className="container-content py-12">
          <SkeletonFilterPanel />
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Shimmer keyframe for skeleton loaders */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      ` }} />

      <PageHero
        title={hero.title}
        description={hero.description}
        buttonText={hero.buttonText}
        buttonLink={hero.buttonLink}
      />

      <section className="container-content py-4">
        <Breadcrumbs />
      </section>

      <div id="video-content" className="container-content py-8">
        {/* Glassmorphism filter panel */}
        <ScrollReveal>
          <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/40 p-6 md:p-8 mb-10 shadow-[0_2px_24px_rgba(0,52,80,0.05)]">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlass
                  weight="light"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Video ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:border-[#003450] focus:ring-2 focus:ring-[#003450]/20 outline-none shadow-sm"
                  style={{
                    fontFamily: 'var(--font-geist-sans)',
                    transitionDuration: '700ms',
                    transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
                  }}
                />
                <AnimatePresence>
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, ease }}
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
                    >
                      <X weight="light" className="w-4 h-4 text-zinc-400" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Type toggle + Channel select */}
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-1">
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
                      className={`px-4 py-2.5 text-sm font-medium rounded-xl relative ${
                        typeFilter === btn.value
                          ? 'text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                      style={{
                        fontFamily: 'var(--font-geist-sans)',
                        transitionDuration: '700ms',
                        transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
                      }}
                    >
                      {typeFilter === btn.value && (
                        <motion.span
                          layoutId="type-pill"
                          className="absolute inset-0 rounded-xl bg-[#003450] shadow-[0_2px_12px_rgba(0,52,80,0.3)]"
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
                      className="appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-4 pr-10 py-3 text-sm text-zinc-700 dark:text-zinc-300 focus:border-[#003450] focus:ring-2 focus:ring-[#003450]/20 outline-none cursor-pointer"
                      style={{
                        fontFamily: 'var(--font-geist-sans)',
                        transitionDuration: '700ms',
                        transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
                      }}
                    >
                      <option value="">Tum Kanallar</option>
                      {availableChannels.map((channel) => (
                        <option key={channel.channelId} value={channel.channelId}>
                          {channel.channelName} ({channel.videoCount})
                        </option>
                      ))}
                    </select>
                    <CaretDown
                      weight="light"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tag pills */}
            {availableTags.length > 0 && (
              <div className="border-t border-zinc-200/60 dark:border-zinc-700/40 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">
                    <Tag weight="light" className="w-3.5 h-3.5" />
                    Etiketler
                  </span>
                  {availableTags.map((tag) => (
                    <motion.button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-[#003450] text-white border-[#003450] shadow-[0_2px_8px_rgba(0,52,80,0.25)]'
                          : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-[#003450]/40 hover:text-[#003450] dark:hover:text-sky-400'
                      }`}
                      style={{
                        transitionDuration: '700ms',
                        transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
                      }}
                    >
                      {tag}
                    </motion.button>
                  ))}
                  <AnimatePresence>
                    {(searchTerm || selectedTags.length > 0) && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease }}
                        onClick={clearSearch}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 ml-1"
                        style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
                      >
                        <X weight="light" className="w-3 h-3 inline mr-1 -mt-px" />
                        Temizle
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Results summary */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200/60 dark:border-zinc-700/40 mt-5">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <VideoCamera weight="light" className="w-4 h-4" />
                <span
                  className="text-sm tabular-nums"
                  style={{ fontFamily: 'var(--font-geist-mono)' }}
                >
                  {filteredVideos.length} video
                </span>
              </div>
              {(searchTerm || selectedTags.length > 0) && (
                <button
                  onClick={clearSearch}
                  className="text-xs font-medium text-[#003450] dark:text-sky-400 hover:underline underline-offset-2"
                  style={{
                    fontFamily: 'var(--font-geist-sans)',
                    transitionDuration: '700ms',
                    transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
                  }}
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
                <VideoCardRedesigned
                  key={video.videoId}
                  video={video}
                  index={index}
                  innerRef={index === filteredVideos.length - 1 ? lastVideoElementRef : undefined}
                />
              ))}
            </ScrollReveal>

            {/* Loading more skeleton */}
            <AnimatePresence>
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.4, ease }}
                  className="grid grid-cols-12 gap-5 mt-5"
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!hasMore && !loadingMore && filteredVideos.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease }}
                className="text-center py-10"
              >
                <span
                  className="text-sm text-zinc-400 dark:text-zinc-500"
                  style={{ fontFamily: 'var(--font-geist-sans)' }}
                >
                  Tum videolar yuklendi
                </span>
              </motion.div>
            )}
          </>
        ) : (
          <ScrollReveal>
            <div className="text-center py-20 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-700/30 shadow-[0_2px_20px_rgba(0,52,80,0.04)]">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <VideoCamera weight="light" className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3
                className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
              >
                Video bulunamadi
              </h3>
              <p
                className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
              >
                {searchTerm || selectedTags.length > 0
                  ? 'Aramanizla eslesen bir video bulunamadi. Farkli anahtar kelimeler kullanmayi veya filtreleri temizlemeyi deneyin.'
                  : 'Henuz hic video eklenmemis. Daha sonra tekrar kontrol edin.'}
              </p>
              {(searchTerm || selectedTags.length > 0) && (
                <button
                  onClick={clearSearch}
                  className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#003450] text-white hover:bg-[#003450]/90 shadow-[0_2px_12px_rgba(0,52,80,0.25)]"
                  style={{
                    transitionDuration: '700ms',
                    transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
                  }}
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
