'use client'

/**
 * SectionTransition — Hero'dan sonraki section'a ince görsel geçiş.
 * Token tabanlı hairline; ~80px yükseklik, pointer-events-none ile içerik üstüne binmez.
 */
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export const SectionTransition = () => {
  return (
    <AnimatedSection
      direction="scale"
      delay={0.1}
      threshold={0.5}
      className="relative h-20 overflow-hidden bg-transparent"
    >
      {/* Orta ince çizgi (hairline) */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="h-px w-64 bg-linear-to-r from-transparent via-border to-transparent" />
      </div>
    </AnimatedSection>
  )
}
