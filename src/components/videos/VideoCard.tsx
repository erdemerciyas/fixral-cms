'use client';

/**
 * Video kartı (redesign 2026) — PostCard dilinde: koyu 16:9 küçük resim, turuncu
 * oynat rozeti, mono tür · tarih satırı, başlık ve kısa açıklama.
 * Bağlantı YouTube'a gider; JS varken ve değiştirici tuş yokken tıklama modal oynatıcıyı açar.
 */
import type React from 'react';
import { PlayIcon } from '@/components/fx/FxIcons';
import { WorkPlaceholder, stripHtml } from '@/components/fx/FxCards';

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

/** API'den eksik alanla gelen kayıtları güvenli biçime getirir */
export function normalizeVideo(v: Partial<Video> & { id?: string }): Video {
  return {
    _id: v._id,
    videoId: v.videoId || v.id || '',
    title: v.title || '',
    description: v.description || '',
    thumbnail: v.thumbnail || '',
    publishedAt: v.publishedAt || '',
    type: v.type === 'short' ? 'short' : 'normal',
    status: v.status === 'hidden' ? 'hidden' : 'visible',
    tags: Array.isArray(v.tags) ? v.tags.filter((x): x is string => typeof x === 'string') : [],
  };
}

export const isSafeThumb = (src?: string) => !!src && /^https:\/\//.test(src);

export function SkeletonCard() {
  return (
    <div className="fx-post fx-skel fx-vcard" aria-hidden="true">
      <div className="fx-post__thumb" />
      <span className="fx-vcard__skl" />
      <span className="fx-vcard__skl fx-vcard__skl--w" />
    </div>
  );
}

export default function VideoCard({
  video,
  kindLabel,
  dateLocale,
  watchLabel,
  onPlay,
  innerRef,
}: {
  video: Video;
  kindLabel: string;
  dateLocale: string;
  watchLabel: string;
  onPlay: (video: Video, trigger: HTMLElement) => void;
  innerRef?: React.Ref<HTMLAnchorElement>;
}) {
  const d = video.publishedAt ? new Date(video.publishedAt) : null;
  const date = d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const summary = stripHtml(video.description);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onPlay(video, e.currentTarget);
  };

  return (
    <a
      ref={innerRef}
      className="fx-post fx-vcard"
      href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.videoId)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label={watchLabel}
    >
      <div className="fx-post__thumb">
        {isSafeThumb(video.thumbnail) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnail} alt="" loading="lazy" decoding="async" />
        ) : (
          <WorkPlaceholder />
        )}
        <span className="fx-play" aria-hidden="true">
          <PlayIcon />
        </span>
      </div>
      <div className="fx-post__meta">
        <span>{kindLabel}</span>
        {date && <span>{date}</span>}
      </div>
      <h3>{video.title}</h3>
      {summary && <p className="fx-vcard__desc">{summary}</p>}
      {video.tags.length > 0 && (
        <span className="fx-tag fx-vcard__tags">{video.tags.slice(0, 3).map((x) => `#${x}`).join('  ')}</span>
      )}
    </a>
  );
}
