'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  dark?: boolean
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function GlassCard({
  children,
  className,
  dark = false,
  hover = true,
  padding = 'lg',
}: GlassCardProps) {
  const paddingClass = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8 md:p-10',
  }[padding]

  return (
    <div
      className={cn(
        'relative rounded-[2rem]',
        dark
          ? 'bg-foreground/5 ring-1 ring-white/6'
          : 'bg-foreground/2 ring-1 ring-foreground/5',
        'p-1.5',
        className
      )}
    >
      <div
        className={cn(
          'rounded-[1.625rem]',
          paddingClass,
          dark
            ? 'bg-foreground/90 backdrop-blur-2xl'
            : 'bg-white/80 backdrop-blur-2xl',
          dark
            ? 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]'
            : 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]',
          hover && 'transition-shadow duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
          hover && !dark && 'hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_20px_40px_-15px_oklch(0.35_0.05_60/0.10)]',
          hover && dark && 'hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_20px_40px_-15px_rgba(0,0,0,0.3)]'
        )}
      >
        {children}
      </div>
    </div>
  )
}
