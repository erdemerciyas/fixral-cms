'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Cube, ImageBroken } from '@phosphor-icons/react';
import { ProjectSummary } from '@/types/portfolio';
import HTMLContent from '../HTMLContent';

const EASING = [0.32, 0.72, 0, 1] as const;
const DURATION = 0.7;

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
  const pathname = usePathname() || '';
  const currentLang = ['tr', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

  const aspectClass = span === 'lg' ? 'aspect-[16/9]' : span === 'sm' ? 'aspect-[4/5]' : 'aspect-[3/2]';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: DURATION, delay: index * 0.08, ease: EASING }}
      className="group relative cursor-pointer"
      onClick={() => {
        window.location.href = `/${currentLang}/portfolio/${project.slug}`;
      }}
    >
      {/* Double-Bezel outer shell */}
      <div className="rounded-3xl border border-zinc-200/60 bg-zinc-100/40 p-1.5">
        {/* Inner card */}
        <div className="relative rounded-[20px] overflow-hidden bg-white border border-zinc-100 transition-shadow group-hover:shadow-[0_20px_60px_-12px_rgba(0,52,80,0.15)]"
          style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
        >
          {/* Image container */}
          <div className={`relative ${aspectClass} overflow-hidden`}>
            {!imageError ? (
              <>
                <Image
                  src={project.coverImage || (process.env.NEXT_PUBLIC_DEFAULT_PROJECT_IMAGE_URL || 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_800,q_auto,f_auto/sample.jpg')}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.04]"
                  style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-zinc-100 animate-pulse" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                <ImageBroken weight="light" className="w-10 h-10 text-zinc-400" />
              </div>
            )}

            {/* Glassmorphism hover overlay */}
            <div
              className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
              style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionProperty: 'opacity, transform' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#003450]/90 via-[#003450]/50 to-transparent backdrop-blur-sm" />

              <div className="relative z-10">
                <h3 className="font-[family-name:var(--font-geist-sans)] text-lg md:text-xl font-semibold text-white mb-3 line-clamp-2 tracking-tight">
                  {project.title}
                </h3>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="font-[family-name:var(--font-geist-mono)] text-[10px] md:text-[11px] tracking-wide text-white/90 bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-0.5"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] md:text-[11px] text-white/60 self-center">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {project.featured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#003450] text-white text-[10px] font-medium tracking-wide uppercase rounded-lg border border-white/10 backdrop-blur-sm">
                  One Cikan
                </span>
              )}
              {project.models3D && project.models3D.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-zinc-700 text-[10px] font-medium tracking-wide uppercase rounded-lg border border-zinc-200/50">
                  <Cube weight="light" className="w-3 h-3" />
                  3D
                </span>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="p-4 md:p-5">
            <h3 className="font-[family-name:var(--font-geist-sans)] text-base md:text-lg font-semibold text-zinc-800 mb-1.5 line-clamp-1 tracking-tight group-hover:text-[#003450] transition-colors"
              style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              {project.title}
            </h3>

            {project.description && (
              <div className="text-zinc-500 mb-3 line-clamp-2">
                <HTMLContent
                  content={project.description}
                  className="text-sm leading-relaxed"
                  truncate={100}
                />
              </div>
            )}

            {/* Meta row */}
            <div className="flex items-center justify-between text-xs text-zinc-400 font-[family-name:var(--font-geist-mono)]">
              {project.client && (
                <span className="truncate max-w-[50%]">{project.client}</span>
              )}
              {project.completionDate && (
                <span>{new Date(project.completionDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })}</span>
              )}
            </div>
          </div>

          {/* Hover translate effect */}
          <div
            className="absolute inset-0 rounded-[20px] pointer-events-none translate-y-0 group-hover:-translate-y-0.5"
            style={{ transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
