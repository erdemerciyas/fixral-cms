'use client'

import { type ReactNode } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'

interface AuthTemplateProps {
  title: string
  description?: string
  children: ReactNode
}

export default function AuthTemplate({ title, description, children }: AuthTemplateProps) {
  return (
    <PageShell className="min-h-[100dvh]">
      <div className="container-main flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-md">
          <PageHeader title={title} description={description} kinetic={false} className="pb-8 text-center" />
          {children}
        </div>
      </div>
    </PageShell>
  )
}
