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
} from 'lucide-react';

interface PortfolioImageGalleryProps {
  images: string[];
  title: string;
  coverImage?: string;
}

const subscribeNoop = () => () => {};

export default function PortfolioImageGallery({
  images,
  title,
  coverImage,
}: PortfolioImageGalleryProps) {
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  // Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const allImages = useMemo(() => {
    if (!images || images.length === 0) {
      return coverImage ? [coverImage] : [];
    }
    if (coverImage) {
      if (images.includes(coverImage)) return images;
      return [coverImage, ...images];
    }
    return images;
  }, [coverImage, images]);

  // Seçili görsel türetilmiş değerdir: kullanıcı seçimi yoksa ilk görsel
  const selectedImage = userSelectedImage ?? allImages[0] ?? null;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      switch (e.key) {
        case 'Escape':
          setLightboxOpen(false);
          break;
        case 'ArrowLeft':
          setLightboxImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
          break;
        case 'ArrowRight':
          setLightboxImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
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
  }, [lightboxOpen, lightboxImageIndex, allImages.length]);

  const openLightbox = (imageIndex: number) => {
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    } else {
      setLightboxImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    }
  };

  if (!allImages.length) {
    return (
      <div className="bg-card rounded-sm border border-border p-8">
        <div className="aspect-16/10 bg-muted rounded-xs flex items-center justify-center border border-border">
          <div className="text-center">
            <PhotoIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Görsel bulunamadı
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        <m.div
          key={`main-image-${selectedImage || 'loading'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="relative aspect-16/10 rounded-sm overflow-hidden border border-border bg-card group cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            if (selectedImage) {
              const currentIndex = allImages.findIndex((img) => img === selectedImage);
              openLightbox(currentIndex >= 0 ? currentIndex : 0);
            }
          }}
        >
          {selectedImage ? (
            <>
              <Image
                key={`selected-${selectedImage}`}
                src={selectedImage}
                alt={`${title} - Seçili Görsel`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              <div className="absolute inset-0 bg-[hsl(var(--scrim)/0)] group-hover:bg-[hsl(var(--scrim)/0.35)] transition-colors duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex h-10 w-10 items-center justify-center rounded-xs border border-border bg-background text-foreground">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-muted flex items-center justify-center h-full">
              <div className="text-center">
                <PhotoIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Görsel yükleniyor...
                </p>
              </div>
            </div>
          )}
        </m.div>

        {allImages.length > 1 && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-card rounded-sm p-4 sm:p-5 border border-border"
          >
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <PhotoIcon className="w-4 h-4 text-primary" />
                Proje Görselleri
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground border border-border px-2 py-0.5 rounded-xs">
                {String(allImages.length).padStart(2, '0')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={`thumb-${index}-${image}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUserSelectedImage(image);
                  }}
                  className={`relative aspect-square w-full rounded-xs overflow-hidden border transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selectedImage === image
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                  type="button"
                >
                  <Image
                    src={image}
                    alt={`Proje görseli ${index + 1}`}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, (max-width: 1024px) 12vw, 10vw"
                  />
                  {selectedImage === image && (
                    <div className="absolute inset-0 bg-primary/15 pointer-events-none border border-primary" />
                  )}
                  <div className="absolute top-1 right-1 font-mono text-[9px] tabular-nums bg-background/90 text-foreground border border-border px-1.5 py-0.5 rounded-xs pointer-events-none">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </button>
              ))}
            </div>
          </m.div>
        )}
      </div>

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

              <div className="absolute top-5 left-5 z-10 font-mono text-xs uppercase tracking-[0.14em] bg-background/90 text-foreground border border-border px-3 py-2 rounded-xs">
                {String(lightboxImageIndex + 1).padStart(2, '0')} /{' '}
                {String(allImages.length).padStart(2, '0')}
              </div>

              {allImages.length > 1 && (
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
                <Image
                  src={allImages[lightboxImageIndex]}
                  alt={`${title} - Görsel ${lightboxImageIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={100}
                  sizes="100vw"
                  priority
                />
              </m.div>

              {allImages.length > 1 && (
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
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Görsel {String(lightboxImageIndex + 1).padStart(2, '0')} /{' '}
                  {String(allImages.length).padStart(2, '0')}
                </p>
              </div>

              {allImages.length > 1 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 bg-background/90 border border-border rounded-sm p-3 max-w-6xl overflow-x-auto">
                  <div className="flex gap-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setLightboxImageIndex(index)}
                        className={`relative shrink-0 w-16 h-16 rounded-xs overflow-hidden border transition-colors ${
                          lightboxImageIndex === index
                            ? 'border-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Küçük görsel ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="absolute inset-0 -z-10" onClick={() => setLightboxOpen(false)} />
            </div>
          </m.div>,
          document.body,
        )}
    </div>
  );
}
