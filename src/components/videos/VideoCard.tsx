'use client';

import { m, useReducedMotion } from 'framer-motion';
import { Play, Film as FilmStrip, Zap as Lightning } from 'lucide-react';

const ease = [0.32, 0.72, 0, 1] as const;

export interface Video {
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

/* ------------------------------------------------------------------ */
/*  Skeleton Card                                                       */
/* ------------------------------------------------------------------ */
export function SkeletonCard({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`rounded-sm overflow-hidden bg-muted col-span-12 ${
        large ? 'md:col-span-8 aspect-video' : 'md:col-span-4 aspect-16/10'
      }`}
    >
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Video Card                                                          */
/* ------------------------------------------------------------------ */
export default function VideoCard({
  video,
  index,
  innerRef,
}: {
  video: Video;
  index: number;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const prefersReduced = useReducedMotion();
  const isLarge = index < 1;
  const isMedium = index === 1;

  const colSpan = isLarge
    ? 'md:col-span-8'
    : isMedium
      ? 'md:col-span-4'
      : 'md:col-span-4';

  return (
    <m.div
      ref={innerRef}
      className={`col-span-12 ${colSpan} group`}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 28, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: prefersReduced ? 0.01 : 0.7,
        delay: prefersReduced ? 0 : Math.min(index * 0.06, 0.48),
        ease,
      }}
    >
      <a
        href={`https://www.youtube.com/watch?v=${video.videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-sm overflow-hidden bg-card border border-border hover:border-primary/30 hover:shadow-xs hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className={`relative overflow-hidden ${isLarge ? 'aspect-video' : 'aspect-16/10'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />

          {/* Scan-line overlay — yalnızca hover'da görünür, reduced-motion'da gizli */}
          <span
            className="scan-line opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-transparent group-hover:bg-[hsl(var(--scrim)/0.3)] flex items-center justify-center transition-colors duration-200 motion-reduce:transition-none"
          >
            <div
              className="w-14 h-14 rounded-sm bg-background/90 backdrop-blur-xs flex items-center justify-center shadow-xs opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-[opacity,transform] duration-200 motion-reduce:transition-none motion-reduce:scale-100"
            >
              <Play className="w-6 h-6 text-primary ml-0.5" />
            </div>
          </div>

          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] rounded-xs backdrop-blur-xs ${
                video.type === 'short'
                  ? 'bg-primary/90 text-primary-foreground'
                  : 'bg-primary/90 text-primary-foreground'
              }`}
            >
              {video.type === 'short' ? (
                <Lightning className="w-3 h-3" />
              ) : (
                <FilmStrip className="w-3 h-3" />
              )}
              {video.type === 'short' ? 'Kısa' : 'Video'}
            </span>
          </div>
        </div>

        <div className={`p-5 ${isLarge ? 'md:p-7' : ''}`}>
          <h3
            className={`font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-accent-foreground transition-colors duration-200 motion-reduce:transition-none ${
              isLarge ? 'text-lg md:text-xl' : 'text-base'
            }`}
          >
            {video.title}
          </h3>

          {(isLarge || isMedium) && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {video.description}
            </p>
          )}

          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {video.tags.slice(0, isLarge ? 4 : 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-xs font-mono text-[11px] font-medium bg-muted text-muted-foreground tracking-wide"
                >
                  {tag}
                </span>
              ))}
              {video.tags.length > (isLarge ? 4 : 2) && (
                <span className="px-2 py-0.5 rounded-xs font-mono text-[11px] font-medium bg-muted text-muted-foreground">
                  +{video.tags.length - (isLarge ? 4 : 2)}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {new Date(video.publishedAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span
              className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:transition-none"
            >
              İzle &rarr;
            </span>
          </div>
        </div>
      </a>
    </m.div>
  );
}
