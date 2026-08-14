'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SectionVariant =
  | 'default'
  | 'bento'
  | 'horizontal'
  | 'sticky-stack'
  | 'editorial'
  | 'stats'
  | 'cta'
  | 'marquee'

interface SectionProps {
  children: ReactNode
  variant?: SectionVariant
  className?: string
  id?: string
  band?: boolean
}

export function Section({ children, variant = 'default', className, id, band }: SectionProps) {
  return (
    <section
      id={id}
      data-section-variant={variant}
      className={cn(
        'section relative',
        band && 'bg-secondary border-y border-border',
        className
      )}
    >
      <div className="container-main">{children}</div>
    </section>
  )
}
