'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { m } from 'framer-motion';
import {
  Search as MagnifyingGlassIcon,
  X as XMarkIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Image as PhotoIcon,
  Box as CubeIcon,
  Download as ArrowDownTrayIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Model3D } from '../../types/portfolio';

const ModelViewer = dynamic(() => import('../3DModelViewer'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-96 bg-surface-tertiary rounded-sm animate-pulse border border-border"
      aria-label="3D model yükleniyor"
    />
  ),
});

interface MediaItem {
  type: 'image' | '3d-model';
  url: string;
  name?: string;
  format?: string;
  size?: number;
  downloadable?: boolean;
  publicId?: string;
}

interface PortfolioMediaGalleryProps {
  images: string[];
  models3D?: Model3D[];
  title: string;
  coverImage?: string;
}

const subscribeNoop = () => () => {};

export default function PortfolioMediaGallery({
  images,
  models3D = [],
  title,
  coverImage,
}: PortfolioMediaGalleryProps) {
  const [userSelectedItem, setUserSelectedItem] = useState<MediaItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItemIndex, setLightboxItemIndex] = useState(0);
  // Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const allMediaItems = useMemo(() => {
    const mediaItems: MediaItem[] = [];

    const imageList =
      coverImage && !images.includes(coverImage)
        ? [coverImage, ...images]
        : images.length > 0
          ? images
          : coverImage
            ? [coverImage]
            : [];

    imageList.forEach((image) => {
      mediaItems.push({ type: 'image', url: image });
    });

    models3D.forEach((model) => {
      mediaItems.push({
        type: '3d-model',
        url: model.url,
        name: model.name,
        format: model.format,
        size: model.size,
        downloadable: model.downloadable,
        publicId: model.publicId,
      });
    });

    return mediaItems;
  }, [coverImage, images, models3D]);

  // Seçili öğe türetilmiş değerdir: kullanıcı seçimi yoksa ilk öğe
  const selectedItem = userSelectedItem ?? allMediaItems[0] ?? null;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          setLightboxOpen(false);
          break;
        case 'ArrowLeft':
          setLightboxItemIndex((prev) => (prev > 0 ? prev - 1 : allMediaItems.length - 1));
          break;
        case 'ArrowRight':
          setLightboxItemIndex((prev) => (prev < allMediaItems.length - 1 ? prev + 1 : 0));
          break;
      }
    };

    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyPress);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [lightboxOpen, lightboxItemIndex, allMediaItems.length]);

  const openLightbox = (itemIndex: number) => {
    setLightboxItemIndex(itemIndex);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxItemIndex((prev) => (prev > 0 ? prev - 1 : allMediaItems.length - 1));
    } else {
      setLightboxItemIndex((prev) => (prev < allMediaItems.length - 1 ? prev + 1 : 0));
    }
  };

  const handleDownload = async (model: MediaItem) => {
    if (model.type !== '3d-model' || !model.downloadable || !model.name) {
      return;
    }

    try {
      const response = await fetch(
        `/api/public/3dmodels/download?url=${encodeURIComponent(model.url)}&filename=${encodeURIComponent(model.name)}`,
      );

      if (!response.ok) {
        throw new Error('İndirme başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = model.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('İndirme sırasında bir hata oluştu');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!allMediaItems.length) {
    return (
      <div className="bg-surface-primary rounded-sm border border-border p-8">
        <div className="aspect-16/10 bg-surface-secondary rounded-xs flex items-center justify-center border border-border">
          <div className="text-center">
            <PhotoIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Medya bulunamadı
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {/* Main Media Display */}
        <m.div
          key={`main-media-${selectedItem?.url || 'loading'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="relative aspect-16/10 rounded-sm overflow-hidden border border-border bg-surface-tertiary group cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            if (selectedItem) {
              const currentIndex = allMediaItems.findIndex((item) => item.url === selectedItem.url);
              openLightbox(currentIndex >= 0 ? currentIndex : 0);
            }
          }}
        >
          {selectedItem ? (
            <>
              {selectedItem.type === 'image' ? (
                <div className="relative w-full h-full">
                  <Image
                    key={`selected-${selectedItem.url}`}
                    src={selectedItem.url}
                    alt={`${title} - Seçili Görsel`}
                    fill
                    className="object-cover transition-opacity duration-300"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                  <div className="absolute inset-0 bg-[hsl(var(--scrim)/0)] group-hover:bg-[hsl(var(--scrim)/0.35)] transition-colors duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex h-10 w-10 items-center justify-center rounded-xs border border-border bg-background text-foreground">
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full h-full relative">
                    <div className="w-full h-full bg-surface-secondary">
                      <ModelViewer
                        modelUrl={selectedItem.url}
                        format={selectedItem.format || 'gltf'}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.14em] bg-background/90 text-foreground border border-border px-2 py-1 rounded-xs flex items-center gap-1.5">
                      <CubeIcon className="w-3.5 h-3.5 text-primary" />
                      <span>{selectedItem.format?.toUpperCase()}</span>
                    </div>
                    {selectedItem.downloadable && (
                      <div className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.14em] bg-background/90 text-foreground border border-border px-2 py-1 rounded-xs">
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-[hsl(var(--scrim)/0)] group-hover:bg-[hsl(var(--scrim)/0.35)] transition-colors duration-200 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex h-10 w-10 items-center justify-center rounded-xs border border-border bg-background text-foreground">
                      <CubeIcon className="w-5 h-5" />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="bg-surface-tertiary flex items-center justify-center h-full">
              <div className="text-center">
                <PhotoIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Medya yükleniyor...
                </p>
              </div>
            </div>
          )}
        </m.div>

        {/* Media Thumbnail Gallery */}
        {allMediaItems.length > 1 && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-surface-primary rounded-sm p-4 sm:p-5 border border-border"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                <PhotoIcon className="w-4 h-4 text-primary" />
                Proje Medyaları
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground border border-border px-2 py-0.5 rounded-xs">
                {String(allMediaItems.length).padStart(2, '0')}
              </span>
              {models3D.length > 0 && (
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary border border-primary/30 bg-accent px-2 py-0.5 rounded-xs">
                  {models3D.length} 3D
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {allMediaItems.map((item, index) => (
                <button
                  key={`thumb-${index}-${item.url}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUserSelectedItem(item);
                  }}
                  className={`relative aspect-square w-full rounded-xs overflow-hidden border transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    selectedItem?.url === item.url
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                  type="button"
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`Proje görseli ${index + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, (max-width: 1024px) 12vw, 10vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-secondary flex items-center justify-center">
                      <CubeIcon className="w-6 h-6 text-primary" />
                    </div>
                  )}

                  {selectedItem?.url === item.url && (
                    <div className="absolute inset-0 bg-primary/15 pointer-events-none border border-primary" />
                  )}

                  <div className="absolute top-1 left-1 font-mono text-[9px] uppercase tracking-[0.12em] bg-background/90 text-foreground border border-border px-1.5 py-0.5 rounded-xs pointer-events-none flex items-center gap-1">
                    {item.type === 'image' ? (
                      <PhotoIcon className="w-2.5 h-2.5" />
                    ) : (
                      <CubeIcon className="w-2.5 h-2.5" />
                    )}
                  </div>

                  <div className="absolute top-1 right-1 font-mono text-[9px] tabular-nums bg-background/90 text-foreground border border-border px-1.5 py-0.5 rounded-xs pointer-events-none">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </button>
              ))}
            </div>
          </m.div>
        )}
      </div>

      {/* Lightbox Modal */}
      {mounted &&
        lightboxOpen &&
        createPortal(
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[hsl(var(--scrim)/0.94)] flex items-center justify-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              width: '100vw',
              height: '100vh',
            }}
          >
            <div
              className="relative w-screen h-screen flex items-center justify-center p-4"
              style={{ width: '100vw', height: '100vh' }}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-5 right-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xs border border-border bg-background/90 text-foreground hover:border-primary hover:text-primary transition-colors"
                title="Kapat (ESC)"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="absolute top-5 left-5 z-10 font-mono text-xs uppercase tracking-[0.14em] bg-background/90 text-foreground border border-border px-3 py-2 rounded-xs flex items-center gap-2">
                {allMediaItems[lightboxItemIndex]?.type === '3d-model' ? (
                  <CubeIcon className="w-4 h-4 text-primary" />
                ) : (
                  <PhotoIcon className="w-4 h-4 text-primary" />
                )}
                <span>
                  {String(lightboxItemIndex + 1).padStart(2, '0')} /{' '}
                  {String(allMediaItems.length).padStart(2, '0')}
                </span>
              </div>

              {allMediaItems[lightboxItemIndex]?.type === '3d-model' &&
                allMediaItems[lightboxItemIndex]?.downloadable && (
                  <button
                    onClick={() => handleDownload(allMediaItems[lightboxItemIndex])}
                    className="absolute top-5 right-20 z-10 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-xs font-mono text-xs uppercase tracking-[0.14em] transition-colors"
                    title="3D Modeli İndir"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>İndir</span>
                  </button>
                )}

              {allMediaItems.length > 1 && (
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xs border border-border bg-background/90 text-foreground hover:border-primary hover:text-primary transition-colors"
                  title="Önceki (←)"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
              )}

              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full max-w-7xl max-h-full"
              >
                {allMediaItems[lightboxItemIndex]?.type === 'image' ? (
                  <Image
                    src={allMediaItems[lightboxItemIndex].url}
                    alt={`${title} - Görsel ${lightboxItemIndex + 1}`}
                    fill
                    className="object-contain"
                    quality={100}
                    sizes="100vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full max-w-4xl h-96 bg-surface-tertiary rounded-sm overflow-hidden border border-border">
                      <ModelViewer
                        modelUrl={allMediaItems[lightboxItemIndex].url}
                        format={allMediaItems[lightboxItemIndex].format || 'gltf'}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </m.div>

              {allMediaItems.length > 1 && (
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xs border border-border bg-background/90 text-foreground hover:border-primary hover:text-primary transition-colors"
                  title="Sonraki (→)"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              )}

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-background/90 text-foreground border border-border px-5 py-3 rounded-sm text-center max-w-2xl">
                <h3 className="font-semibold text-base mb-1">{title}</h3>
                <div className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span>
                    {allMediaItems[lightboxItemIndex]?.type === '3d-model' ? '3D Model' : 'Görsel'}{' '}
                    {String(lightboxItemIndex + 1).padStart(2, '0')} /{' '}
                    {String(allMediaItems.length).padStart(2, '0')}
                  </span>
                  {allMediaItems[lightboxItemIndex]?.type === '3d-model' && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{allMediaItems[lightboxItemIndex]?.format?.toUpperCase()}</span>
                      {allMediaItems[lightboxItemIndex]?.size && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{formatFileSize(allMediaItems[lightboxItemIndex].size!)}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 -z-10" onClick={() => setLightboxOpen(false)} />
            </div>
          </m.div>,
          document.body,
        )}
    </div>
  );
}
