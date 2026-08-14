'use client'

import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { useLocale } from '@/hooks/useLocale'

interface StatusTemplateProps {
  code: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function StatusTemplate({
  code,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: StatusTemplateProps) {
  const lang = useLocale()

  return (
    <PageShell className="min-h-[100dvh] items-center justify-center">
      <div className="container-narrow py-24 text-center">
        <p className="font-mono text-sm text-primary">{code}</p>
        <h1 className="section-title mt-4">{title}</h1>
        <p className="section-subtitle mx-auto mt-4">{description}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {onAction && actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              {actionLabel}
            </button>
          )}
          {actionHref && actionLabel && !onAction && (
            <Link href={actionHref} className="bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
              {actionLabel}
            </Link>
          )}
          <Link href={`/${lang}`} className="border border-border px-6 py-3 text-sm font-medium text-foreground">
            Ana sayfa
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
