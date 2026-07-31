'use client';

/**
 * ModernProjectCard — Printables model-kart deseni.
 * Görsel (object-cover) + hover'da koyu scrim üzerinde metadata → başlık → meta satırı.
 * Flat kart: rounded-sm, hairline border, dinlenimde gölgesiz;
 * hover'da -translate-y-0.5 + shadow-lg (200ms).
 */
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { m, useInView, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Box as Cube, ImageOff as ImageBroken } from 'lucide-react';
import { ProjectSummary } from '@/types/portfolio';
import HTMLContent from '../HTMLContent';

const EASING = [0.32, 0.72, 0, 1] as const;
const DURATION = 0.7;

/* Görsel üzeri metadata scrim'i — koyu karartma (--scrim token'ı) */
const OVERLAY_SCRIM = 'linear-gradient(0deg, hsl(var(--scrim) / 0.74) 0%, hsl(var(--scrim) / 0.35) 55%, hsl(var(--scrim) / 0) 100%)';

interface ModernProjectCardProps {
  project: ProjectSummary & {
    client?: string;
    completionDate?: string;
    technologies?: string[];
    featured?: boolean;
    models3D?: Array<{
      _id?: string;
      url: string;
      name: string;
      format: 'stl' | 'obj' | 'gltf' | 'glb';
      size: number;
      downloadable: boolean;
      publicId: string;
      uploadedAt: string;
    }>;
  };
  index: number;
  layout?: 'grid' | 'masonry' | 'list';
  span?: 'sm' | 'md' | 'lg';
}

export default function ModernProjectCard({
  project,
  index,
  layout = 'grid',
  span = 'md',
}: ModernProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReduced = useReducedMotion();
  const pathname = usePathname() || '';
  const currentLang = ['tr', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

  const aspectClass = span === 'lg' ? 'aspect-video' : span === 'sm' ? 'aspect-4/5' : 'aspect-4/3';

  return (
    <m.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : (prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 })}
      transition={{ duration: prefersReduced ? 0.01 : DURATION, delay: prefersReduced ? 0 : index * 0.06, ease: EASING }}
      className="group relative cursor-pointer"
      onClick={() => {
        window.location.href = `/${currentLang}/portfolio/${project.slug}`;
      }}
    >
      {/* Flat Printables kartı */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
          {/* Image container */}
          <div className={`relative ${aspectClass} overflow-hidden bg-muted`}>
            {!imageError ? (
              <>
                <Image
                  src={project.coverImage || (process.env.NEXT_PUBLIC_DEFAULT_PROJECT_IMAGE_URL || 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_800,q_auto,f_auto/sample.jpg')}
                  alt={project.title}
                  fill
                  className="object-cover"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-secondary animate-pulse" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                <ImageBroken className="w-10 h-10 text-muted-foreground" />
              </div>
            )}

            {/* Scan-line overlay — yalnızca hover'da görünür, reduced-motion'da gizli */}
            <span
              className="scan-line opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden="true"
            />

            {/* Hover'da görünen metadata overlay — koyu scrim üzerinde beyaz metin */}
            <div
              className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 motion-reduce:transition-none"
              style={{ background: OVERLAY_SCRIM }}
            >
              <div className="relative z-10">
                <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-white md:text-base">
                  {project.title}
                </h3>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-sm border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] tracking-wide text-white/90 md:text-[11px]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="self-center text-[10px] text-white/70 md:text-[11px]">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
              {project.featured && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                  Öne Çıkan
                </span>
              )}
              {project.models3D && project.models3D.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground">
                  <Cube className="w-3 h-3" aria-hidden="true" />
                  3D
                </span>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground md:text-base">
              {project.title}
            </h3>

            {project.description && (
              <div className="line-clamp-2 flex-1 text-muted-foreground">
                <HTMLContent
                  content={project.description}
                  className="text-sm leading-relaxed"
                  truncate={100}
                />
              </div>
            )}

            {/* Monospace metadata — müşteri / tarih (ana sayfa showcase ile aynı dil) */}
            <dl className="mt-auto flex flex-col gap-1 pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {project.client && (
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="shrink-0">Müşteri</dt>
                  <dd className="truncate text-right">{project.client}</dd>
                </div>
              )}
              {project.completionDate && (
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="shrink-0">Tarih</dt>
                  <dd className="tabular-nums">
                    {new Date(project.completionDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
      </div>
    </m.div>
  );
}
