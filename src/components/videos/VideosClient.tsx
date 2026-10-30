'use client';

/**
 * Videolar (redesign 2026) — prototip `PAGES.videolar()`.
 * Tür (Tümü / Video / Kısa) ve kanal filtreleri URL'de (?type=, ?channel=) tutulur;
 * arama ve etiketler istemci tarafında süzülür. Sonsuz kaydırma + "daha fazla" düğmesi,
 * modal oynatıcı (youtube-nocookie), yükleniyor / boş / sonuçsuz / hata durumları.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { toFxLocale } from '@/content/fixral';
import { SearchIcon, CloseIcon, ExternalIcon } from '@/components/fx/FxIcons';
import VideoCard, { SkeletonCard, normalizeVideo, type Video } from '@/components/videos/VideoCard';

const CHANNEL_URL = 'https://www.youtube.com/@fixral';

interface Channel { channelId: string; channelName?: string; videoCount?: number }

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ */
/*  Modal oynatıcı                                                      */
/* ------------------------------------------------------------------ */
function VideoModal({ video, onClose, labels }: { video: Video; onClose: () => void; labels: { dialog: string; close: string; open: string; blocked: string } }) {
  const [blocked, setBlocked] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !box.current) return;
      const items = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    // Arka plana tıklama kapatır (yalnızca kutunun dışı)
    const onDown = (e: MouseEvent) => { if (e.target === root.current) onClose(); };
    // CSP frame-src YouTube'u engellerse bağlantılı yedek panel gösterilir
    const onCsp = (e: SecurityPolicyViolationEvent) => {
      if (/frame-src|child-src/.test(e.violatedDirective || e.effectiveDirective) && /youtube/.test(e.blockedURI)) setBlocked(true);
    };
    const r = root.current;
    document.addEventListener('securitypolicyviolation', onCsp);
    document.addEventListener('keydown', onKey);
    r?.addEventListener('mousedown', onDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('securitypolicyviolation', onCsp);
      r?.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  const id = encodeURIComponent(video.videoId);
  return (
    <div
      className="fx-vmodal public-theme public-dark"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fx-vmodal-title"
      ref={root}
    >
      <div className={`fx-vmodal__box ${video.type === 'short' ? 'fx-vmodal__box--short' : ''}`} ref={box}>
        <div className="fx-vmodal__bar">
          <h2 id="fx-vmodal-title" className="fx-vmodal__title">{video.title || labels.dialog}</h2>
          <a className="fx-btn fx-btn--ghost fx-btn--sm" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
            {labels.open} <ExternalIcon />
          </a>
          <button ref={closeBtn} type="button" className="fx-vmodal__close" onClick={onClose} aria-label={labels.close}>
            <CloseIcon />
          </button>
        </div>
        <div className="fx-vmodal__frame">
          {blocked ? (
            <div className="fx-vmodal__blocked">
              <p>{labels.blocked}</p>
              <a className="fx-btn fx-btn--primary" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
                {labels.open} <ExternalIcon />
              </a>
            </div>
          ) : (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={video.title || labels.dialog}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
export default function VideosClient({ lang }: { lang?: string }) {
  const { t, locale } = useAppTranslations('fx');
  const L = toFxLocale(lang || locale);
  const dateLocale = 'tr-TR';

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [reload, setReload] = useState(0);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() || `/${L}/videos`;
  const typeFilter = searchParams?.get('type') || '';
  const channelFilter = searchParams?.get('channel') || '';

  /* ---- Veri ---- */
  const loadVideos = useCallback(async () => {
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (channelFilter) params.append('channelId', channelFilter);
    params.append('status', 'visible');
    params.append('limit', '50');
    const response = await fetch(`/api/public/youtube?${params.toString()}`);
    if (!response.ok) throw new Error(`youtube ${response.status}`);
    const data = await response.json();
    const list: unknown[] = Array.isArray(data?.videos) ? data.videos : Array.isArray(data?.data?.videos) ? data.data.videos : [];
    setVideos(list.map((v) => normalizeVideo(v as Partial<Video>)).filter((v) => v.videoId));
    setNextPageToken(data?.nextPageToken || null);
    setHasMore(!!data?.hasMore && !!data?.nextPageToken);
    try {
      const channelsRes = await fetch('/api/public/channels');
      if (channelsRes.ok) {
        const ch = await channelsRes.json();
        setAvailableChannels(Array.isArray(ch) ? ch.filter((c: Channel) => c?.channelId) : []);
      }
    } catch {
      /* kanal listesi isteğe bağlı */
    }
  }, [typeFilter, channelFilter]);

  useEffect(() => {
    let off = false;
    // Ertelenmiş başlatma: efekt gövdesinde senkron setState yapılmaz
    const timer = setTimeout(() => {
      setLoading(true);
      setError(false);
      loadVideos()
        .catch((e) => { if (!off) { console.error('Error loading videos:', e); setError(true); } })
        .finally(() => { if (!off) setLoading(false); });
    }, 0);
    return () => { off = true; clearTimeout(timer); };
  }, [loadVideos, reload]);

  const availableTags = useMemo(() => [...new Set(videos.flatMap((v) => v.tags))].slice(0, 24), [videos]);

  const filteredVideos = useMemo(() => {
    const q = searchTerm.trim().toLocaleLowerCase(dateLocale);
    return videos.filter((v) => {
      if (q && !(`${v.title} ${v.description} ${v.tags.join(' ')}`.toLocaleLowerCase(dateLocale).includes(q))) return false;
      if (selectedTags.length > 0 && !selectedTags.every((tag) => v.tags.includes(tag))) return false;
      return true;
    });
  }, [videos, searchTerm, selectedTags, dateLocale]);

  /* ---- Daha fazla ---- */
  const loadMoreVideos = useCallback(async () => {
    if (!hasMore || !nextPageToken || loadingMore) return;
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
        const list: unknown[] = Array.isArray(data?.videos) ? data.videos : [];
        setVideos((prev) => {
          const seen = new Set(prev.map((v) => v.videoId));
          return [...prev, ...list.map((v) => normalizeVideo(v as Partial<Video>)).filter((v) => v.videoId && !seen.has(v.videoId))];
        });
        setNextPageToken(data?.nextPageToken || null);
        setHasMore(!!data?.nextPageToken);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Error loading more videos:', e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [typeFilter, channelFilter, hasMore, nextPageToken, loadingMore]);

  useEffect(() => {
    if (loading || loadingMore || !hasMore || !sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMoreVideos();
    }, { rootMargin: '400px 0px' });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [loading, loadingMore, hasMore, loadMoreVideos]);

  /* ---- Yardımcılar ---- */
  const setParam = (key: 'type' | 'channel', value: string) => {
    const p = new URLSearchParams(searchParams?.toString() || '');
    if (value) p.set(key, value); else p.delete(key);
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggleTag = (tag: string) => setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  const clearFilters = () => { setSearchTerm(''); setSelectedTags([]); };
  const hasLocalFilter = !!searchTerm || selectedTags.length > 0;

  const openPlayer = useCallback((video: Video, trigger: HTMLElement) => { triggerRef.current = trigger; setPlaying(video); }, []);
  const closePlayer = useCallback(() => {
    setPlaying(null);
    const el = triggerRef.current;
    if (el) setTimeout(() => el.focus(), 0);
  }, []);

  const typeButtons = [
    { value: '', label: t('videos.typeAll') },
    { value: 'normal', label: t('videos.typeNormal') },
    { value: 'short', label: t('videos.typeShort') },
  ];

  return (
    <>
      <section id="video-content" className="fx-sec fx-sec--tight" aria-labelledby="fx-videos-filters-label">
        <div className="fx-wrap">
          <h2 id="fx-videos-filters-label" className="sr-only">{t('videos.filtersLabel')}</h2>

          {/* Filtreler */}
          <div className="fx-vbar">
            <div className="fx-filters fx-vbar__types" role="group" aria-label={t('videos.typeLabel')}>
              {typeButtons.map((b) => (
                <button key={b.value || 'all'} type="button" className="fx-chip" aria-pressed={typeFilter === b.value} onClick={() => setParam('type', b.value)}>
                  {b.label}
                </button>
              ))}
            </div>
            <div className="fx-vbar__right">
              {availableChannels.length > 0 && (
                <div className="fx-vbar__select">
                  <label htmlFor="fx-video-channel" className="sr-only">{t('videos.channelLabel')}</label>
                  <select id="fx-video-channel" value={channelFilter} onChange={(e) => setParam('channel', e.target.value)}>
                    <option value="">{t('videos.channelAll')}</option>
                    {availableChannels.map((c) => (
                      <option key={c.channelId} value={c.channelId}>
                        {c.channelName || c.channelId}{typeof c.videoCount === 'number' ? ` (${c.videoCount})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="fx-vbar__search">
                <label htmlFor="fx-video-q" className="sr-only">{t('videos.searchLabel')}</label>
                <span className="fx-newsbar__icon" aria-hidden="true"><SearchIcon /></span>
                <input
                  id="fx-video-q"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('videos.searchPlaceholder')}
                  autoComplete="off"
                />
                {searchTerm && (
                  <button type="button" className="fx-vbar__x" onClick={() => setSearchTerm('')} aria-label={t('videos.clearSearch')}>
                    <CloseIcon />
                  </button>
                )}
              </div>
            </div>
          </div>

          {availableTags.length > 0 && (
            <div className="fx-vtags" role="group" aria-label={t('videos.tagsLabel')}>
              <span className="fx-tag">{t('videos.tagsLabel')}</span>
              <div className="fx-chips">
                {availableTags.map((tag) => (
                  <button key={tag} type="button" className="fx-chip fx-chip--sm" aria-pressed={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && (
            <p className="fx-newsbar__summary" role="status">
              <span className="fx-mono">{t('videos.count', { count: filteredVideos.length })}</span>
              {hasLocalFilter && (
                <button type="button" className="fx-link fx-newsbar__clear" onClick={clearFilters}>
                  <CloseIcon /> {t('videos.clear')}
                </button>
              )}
            </p>
          )}

          {/* İçerik */}
          {loading ? (
            <div className="fx-journal" aria-busy="true" aria-label={t('videos.loading')}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="fx-empty fx-news-empty" role="alert">
              <b>{t('videos.errorTitle')}</b>
              <span>{t('videos.errorText')}</span>
              <div className="fx-news-empty__cta">
                <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setReload((n) => n + 1)}>{t('videos.retry')}</button>
              </div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="fx-empty fx-news-empty">
              <b>{hasLocalFilter || typeFilter || channelFilter ? t('videos.noResultsTitle') : t('videos.emptyTitle')}</b>
              <span>{hasLocalFilter || typeFilter || channelFilter ? t('videos.noResultsText') : t('videos.emptyText')}</span>
              {(hasLocalFilter || typeFilter || channelFilter) && (
                <div className="fx-news-empty__cta">
                  <button
                    type="button"
                    className="fx-btn fx-btn--ghost fx-btn--sm"
                    onClick={() => { clearFilters(); if (typeFilter || channelFilter) router.push(pathname, { scroll: false }); }}
                  >
                    {t('videos.clear')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="fx-journal">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.videoId}
                    video={video}
                    kindLabel={(video.type === 'short' ? t('videos.kindShort') : t('videos.kindVideo')).toLocaleUpperCase(dateLocale)}
                    dateLocale={dateLocale}
                    watchLabel={t('videos.watch', { title: video.title })}
                    onPlay={openPlayer}
                  />
                ))}
                {loadingMore && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
              </div>
              <div ref={sentinelRef} className="fx-vsentinel" aria-hidden="true" />
              <p className="sr-only" role="status">{loadingMore ? t('videos.loadingMore') : ''}</p>
            </>
          )}

          <div className="fx-vfoot">
            {!loading && !error && hasMore && (
              <button type="button" className="fx-btn fx-btn--ghost" onClick={loadMoreVideos} disabled={loadingMore}>
                {loadingMore ? t('videos.loadingMore') : t('videos.loadMore')}
              </button>
            )}
            {!loading && !error && !hasMore && filteredVideos.length > 6 && (
              <span className="fx-tag">{t('videos.allLoaded')}</span>
            )}
            <a className="fx-btn fx-btn--ghost" href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              {t('videos.channelCta')} <ExternalIcon />
            </a>
          </div>
        </div>
      </section>

      {playing && (
        <VideoModal
          video={playing}
          onClose={closePlayer}
          labels={{ dialog: t('videos.modalLabel'), close: t('videos.close'), open: t('videos.openOnYoutube'), blocked: t('videos.embedBlocked') }}
        />
      )}
    </>
  );
}
