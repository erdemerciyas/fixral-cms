'use client'

import { type ReactNode } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'

interface PortfolioDetailTemplateProps {
  title: string
  eyebrow?: string
  children: ReactNode
}

export default function PortfolioDetailTemplate({
  title,
  eyebrow,
  children,
}: PortfolioDetailTemplateProps) {
  return (
    <PageShell>
      <div className="container-main">
        <PageHeader title={title} eyebrow={eyebrow} kinetic={false} />
      </div>
      {children}
    </PageShell>
  )
}
