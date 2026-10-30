'use client'

/**
 * Sistem sayfaları (404, hata, çevrimdışı, bölüm hataları) için ortak düzen:
 * koyu ada PageHero (eyebrow + başlık + açıklama) ve altında eylem düğmeleri.
 * Kök seviyede de çalışır; dil adres satırından çözülür (useAppTranslations).
 */
import type { ReactNode } from 'react'
import PageHero from '@/components/common/PageHero'
import { useAppTranslations } from '@/hooks/useAppTranslations'

export function FxSystemPage({ eyebrow, title, lede, crumb, actions, children }: { eyebrow: string; title: string; lede: string; crumb: string; actions: ReactNode; children?: ReactNode }) {
  const { t, locale } = useAppTranslations('fx')
  return (
    <>
      <PageHero badge={eyebrow} title={title} description={lede} crumbs={[{ label: t('system.home'), href: `/${locale}` }, { label: crumb, href: '' }]} />
      <section className="fx-sec fx-sec--tight">
        <div className="fx-wrap fx-stack-22">
          {children}
          <div className="fx-sys-actions">{actions}</div>
        </div>
      </section>
    </>
  )
}
