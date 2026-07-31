'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Star as StarIconSolid } from 'lucide-react';
import type { PortfolioItem } from '../../types/portfolio';

interface PortfolioDetailHeroProps {
  project: PortfolioItem;
}

export default function PortfolioDetailHero({ project }: PortfolioDetailHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="relative overflow-hidden border-b border-border bg-secondary">
        <div className="relative z-10 pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 flex items-center justify-center min-h-[200px]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
              {project.title}
            </h1>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-secondary text-foreground">
      <div className="relative z-10 pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 flex items-center min-h-[200px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full text-center">

          {/* Title */}
          <m.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-4">
              {project.title}
            </h1>
          </m.div>


          {project.featured && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center mt-4 justify-center"
            >
              <div className="flex items-center px-3 py-1.5 bg-accent border border-border rounded-sm">
                <StarIconSolid className="w-4 h-4 text-primary mr-2" />
                <span className="text-accent-foreground font-semibold text-sm">Öne Çıkan Proje</span>
              </div>
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
}
