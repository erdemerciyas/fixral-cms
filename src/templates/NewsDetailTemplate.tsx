'use client'

import { type ReactNode } from 'react'
import { PageShell } from '@/components/layout/PageShell'

interface NewsDetailTemplateProps {
  children: ReactNode
}

export default function NewsDetailTemplate({ children }: NewsDetailTemplateProps) {
  return <PageShell>{children}</PageShell>
}
