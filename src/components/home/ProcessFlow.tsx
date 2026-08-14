'use client'

import { ScanLine, Box, BadgeCheck, Factory, type LucideIcon } from 'lucide-react'
import { HorizontalPan } from '@/components/motion/HorizontalPan'
import { useAppTranslations } from '@/hooks/useAppTranslations'

const STEPS: { key: string; icon: LucideIcon }[] = [
  { key: 'scan', icon: ScanLine },
  { key: 'model', icon: Box },
  { key: 'verify', icon: BadgeCheck },
  { key: 'produce', icon: Factory },
]

export default function ProcessFlow() {
  const { t } = useAppTranslations('home')

  return (
    <section className="relative border-y border-border bg-secondary" aria-label={t('process.title')}>
      <div className="container-main py-16 md:py-20">
        <div className="mb-12 max-w-3xl">
          <h2 className="section-title">{t('process.title')}</h2>
          <p className="section-subtitle mt-5">{t('process.subtitle')}</p>
        </div>
      </div>

      <HorizontalPan>
        {STEPS.map((step) => (
          <article
            key={step.key}
            className="flex h-full w-[85vw] max-w-md shrink-0 flex-col justify-center border border-border bg-card p-8 md:w-[420px] md:mx-8 first:ml-8 last:mr-8"
          >
            <step.icon size={20} className="mb-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {t(`process.steps.${step.key}.title`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t(`process.steps.${step.key}.description`)}
            </p>
          </article>
        ))}
      </HorizontalPan>
    </section>
  )
}
