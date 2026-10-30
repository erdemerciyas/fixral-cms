'use client';

/**
 * Proje medyası (redesign 2026).
 * - Gerçek 3D dosyaları (STL/OBJ/GLB/GLTF) varsa `.fx-viewer` çerçevesinde
 *   etkileşimli görüntüleyici; birden fazla modelde model seçici (aria-pressed),
 *   indirilebilir dosyalar için dosya listesi (Portfolio3DFiles).
 * - Görseller: büyük sahne + küçük resim şeridi + klavye ile gezilebilen lightbox.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { CloseIcon, ArrowRight } from '@/components/fx/FxIcons';
import Portfolio3DFiles from './Portfolio3DFiles';
import { usePfT } from './usePfT';
import type { PfModel3D } from './portfolio-data';

const ModelViewer = dynamic(() => import('../3DModelViewer'), {
  ssr: false,
  loading: () => <div className="fx-pf-viewer-wait" aria-hidden="true" />,
});

const subscribeNoop = () => () => {};
const STEEL = '#D9DEE5';

interface PortfolioMediaGalleryProps {
  images: string[];
  models3D?: PfModel3D[];
  title: string;
  coverImage?: string;
}

export default function PortfolioMediaGallery({ images, models3D = [], title, coverImage }: PortfolioMediaGalleryProps) {
  const imageList = Array.from(new Set([coverImage, ...images].filter((x): x is string => !!x)));
  return (
    <>
      {models3D.length > 0 && <ModelStage models={models3D} title={title} />}
      {imageList.length > 0 && <ImageGallery images={imageList} title={title} compact={models3D.length > 0} />}
    </>
  );
}

/* ------------------------------------------------------------------ 3D */
function ModelStage({ models, title }: { models: PfModel3D[]; title: string }) {
  const t = usePfT();
  const [active, setActive] = useState(0);
  const model = models[Math.min(active, models.length - 1)];
  return (
    <div className="fx-pf-media">
      <div className="fx-viewer fx-pf-viewer public-theme public-dark">
        <ModelViewer
          key={model.url}
          modelUrl={model.url}
          format={model.format || 'stl'}
          transparent
          color={STEEL}
          labels={{
            aria: t('viewer.label', { title: `${title} · ${model.name}` }),
            loading: t('viewer.loading'),
            processing: t('viewer.processing'),
            unsupported: t('viewer.unsupported'),
            help: t('viewer.hint'),
          }}
        />
        {models.length > 1 && (
          <div className="fx-viewer__modes" role="group" aria-label={t('viewer.models')}>
            {models.map((m, i) => (
              <button key={m._id || m.url} type="button" aria-pressed={i === active} onClick={() => setActive(i)} title={m.name}>
                {m.format.toUpperCase()} {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
        <span className="fx-pf-viewer__name fx-mono">{model.name}</span>
      </div>
      <span className="fx-tag">{t('viewer.hint')}</span>
      <Portfolio3DFiles models3D={models} />
    </div>
  );
}

/* ------------------------------------------------------------- Images */
function ImageGallery({ images, title, compact }: { images: string[]; title: string; compact?: boolean }) {
  const t = usePfT();
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = images.length;

  const close = useCallback(() => {
    setOpen(null);
    triggerRef.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') {
        // Odak diyalog içinde kalır
        const root = document.getElementById('fx-pf-lightbox');
        const f = root ? Array.from(root.querySelectorAll<HTMLElement>('button')) : [];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, step]);

  const current = images[selected] || images[0];

  return (
    <div className={`fx-pf-media ${compact ? 'fx-pf-media--compact' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="fx-pf-stage"
        onClick={() => setOpen(selected)}
        aria-label={`${t('media.open')}: ${t('media.image', { title, n: selected + 1 })}`}
      >
        <Image
          key={current}
          src={current}
          alt={t('media.image', { title, n: selected + 1 })}
          fill
          priority={!compact}
          sizes="(max-width: 900px) 100vw, 1280px"
        />
        {total > 1 && <span className="fx-tag fx-pf-stage__count">{t('media.count', { n: selected + 1, total })}</span>}
        <span className="fx-pf-stage__zoom" aria-hidden="true">
          <ZoomIcon />
        </span>
      </button>

      {total > 1 && (
        <div className="fx-pf-thumbs" role="group" aria-label={t('media.thumbs')}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className="fx-pf-thumb"
              aria-pressed={i === selected}
              aria-label={t('media.show', { n: i + 1 })}
              onClick={() => setSelected(i)}
            >
              <Image src={src} alt="" fill sizes="120px" />
            </button>
          ))}
        </div>
      )}

      {mounted && open !== null &&
        createPortal(
          // Arka plana tıklayınca kapanır; klavyede Escape aynı işi yapar (keydown dinleyicisi)
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <div
            id="fx-pf-lightbox"
            className="fx-pf-lightbox public-theme public-dark"
            role="dialog"
            aria-modal="true"
            aria-label={t('media.dialog')}
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <div className="fx-pf-lightbox__bar">
              <span className="fx-tag">{t('media.count', { n: open + 1, total })}</span>
              <span className="fx-pf-lightbox__title">{title}</span>
              <button ref={closeRef} type="button" className="fx-iconbtn" onClick={close} aria-label={t('media.close')}>
                <CloseIcon />
              </button>
            </div>
            <div className="fx-pf-lightbox__img">
              <Image src={images[open]} alt={t('media.image', { title, n: open + 1 })} fill sizes="100vw" quality={90} />
            </div>
            {total > 1 && (
              <>
                <button type="button" className="fx-iconbtn fx-pf-lightbox__nav fx-pf-lightbox__nav--prev" onClick={() => step(-1)} aria-label={t('media.prev')}>
                  <ArrowRight />
                </button>
                <button type="button" className="fx-iconbtn fx-pf-lightbox__nav fx-pf-lightbox__nav--next" onClick={() => step(1)} aria-label={t('media.next')}>
                  <ArrowRight />
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

const ZoomIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5" />
  </svg>
);
