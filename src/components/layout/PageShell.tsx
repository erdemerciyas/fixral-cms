'use client'

import { type ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={`relative flex flex-col ${className ?? ''}`}>
      {children}
    </div>
  )
}
