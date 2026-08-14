'use client'

import { KineticHeadline } from '@/components/motion/KineticHeadline'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  className?: string
  kinetic?: boolean
}

export function PageHeader({
  title,
  description,
  eyebrow,
  className,
  kinetic = true,
}: PageHeaderProps) {
  return (
    <header className={cn('pt-24 pb-12 md:pb-16', className)}>
      {eyebrow && (
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      {kinetic ? (
        <KineticHeadline text={title} as="h1" className="max-w-4xl" />
      ) : (
        <h1 className="hero-title max-w-4xl leading-[1.1] pb-1">{title}</h1>
      )}
      {description && (
        <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  )
}
