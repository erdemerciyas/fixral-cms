'use client'

import { type ReactNode } from 'react'
import { PageShell } from '@/components/layout/PageShell'

interface AccountTemplateProps {
  children: ReactNode
}

export default function AccountTemplate({ children }: AccountTemplateProps) {
  return <PageShell>{children}</PageShell>
}
