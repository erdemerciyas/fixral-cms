'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { LayoutGrid as Squares2X2Icon, Columns3 as ViewColumnsIcon, List as QueueListIcon } from 'lucide-react';
import { ProjectSummary } from '@/types/portfolio';
import ModernProjectCard from './ModernProjectCard';

interface ModernProjectGridProps {
  projects: (ProjectSummary & {
    client?: string;
    completionDate?: string;
    technologies?: string[];
    featured?: boolean;
  })[];
  isLoading?: boolean;
  layout?: 'grid' | 'masonry' | 'list';
  onLayoutChange?: (layout: 'grid' | 'masonry' | 'list') => void;
}

export default function ModernProjectGrid({ 
  projects, 
  isLoading = false,
  layout = 'grid',
  onLayoutChange
}: ModernProjectGridProps) {
  const [mounted, setMounted] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'masonry' | 'list'>(layout);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  const handleLayoutChange = (newLayout: 'grid' | 'masonry' | 'list') => {
    setCurrentLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  if (!mounted) {
    return <ProjectGridSkeleton />;
  }

  if (isLoading) {
    return <ProjectGridSkeleton />;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-20 min-h-[40vh] flex flex-col justify-center items-center" role="status" aria-live="polite">
        <div className="w-24 h-24 bg-secondary border border-border rounded-full flex items-center justify-center mx-auto mb-6">
          <Squares2X2Icon className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-4">
          Proje Bulunamadı
        </h3>
        <p className="text-muted-foreground max-w-md">
          Arama kriterlerinize uygun proje bulunamadı. Filtreleri değiştirmeyi deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout Controls */}
      {onLayoutChange && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-card rounded-full p-1.5 border border-border">
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`p-2.5 rounded-full transition-colors duration-200 ${
                currentLayout === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              title="Grid Görünümü"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleLayoutChange('masonry')}
              className={`p-2.5 rounded-full transition-colors duration-200 ${
                currentLayout === 'masonry'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              title="Masonry Görünümü"
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleLayoutChange('list')}
              className={`p-2.5 rounded-full transition-colors duration-200 ${
                currentLayout === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              title="Liste Görünümü"
            >
              <QueueListIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm text-muted-foreground font-medium">
            {projects.length} proje gösteriliyor
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        <m.ul
          key={currentLayout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={getGridClassName(currentLayout)}
        >
          {projects.map((project, index) => (
            <li key={project.id}>
              <ModernProjectCard
                project={project}
                index={index}
                layout={currentLayout}
              />
            </li>
          ))}
        </m.ul>
      </AnimatePresence>
    </div>
  );
}

function getGridClassName(layout: 'grid' | 'masonry' | 'list'): string {
  switch (layout) {
    case 'masonry':
      return 'columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0'
    case 'list':
      return 'space-y-4'
    case 'grid':
    default:
      /* Printables grid: mobile 2 / tablet 3 / desktop 4 */
      return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
  }
}

function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-card rounded-sm border border-border overflow-hidden animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="aspect-4/3 bg-secondary"></div>

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-4 bg-secondary rounded-sm w-3/4"></div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 bg-secondary rounded-sm w-full"></div>
              <div className="h-3 bg-secondary rounded-sm w-2/3"></div>
            </div>

            {/* Meta */}
            <div className="h-3 bg-secondary rounded-sm w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}