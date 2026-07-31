'use client'

/**
 * FullWidthCTA — Tam genişlik CTA section.
 * Printables tarzı düz yüzey bandı; token tabanlı renkler.
 * One CTA intent per page (taste-skill §8): "İletişime Geç" consistent across nav/hero/footer.
 */
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function FullWidthCTA() {
  const lang = useLocale()

  return (
    <section
      className="relative w-full border-t border-border bg-card py-20 md:py-28"
      aria-label="Proje çağrısı"
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          align="center"
          className="mb-10 md:mb-12"
          title="Projenizi Hayata Geçirelim"
          subtitle="Uzman ekibimiz ve modern teknolojilerimizle fikirlerinizi gerçeğe dönüştürmeye hazırız."
        />
        <div className="text-center">
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <span>İletişime Geç</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
