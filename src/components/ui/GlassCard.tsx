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
          ? 'bg-zinc-950/5 ring-1 ring-white/[0.06]'
          : 'bg-zinc-950/[0.02] ring-1 ring-zinc-950/[0.04]',
        'p-1.5',
        className
      )}
    >
      <div
        className={cn(
          'rounded-[calc(2rem-0.375rem)]',
          paddingClass,
          dark
            ? 'bg-zinc-900/80 backdrop-blur-2xl'
            : 'bg-white/80 backdrop-blur-2xl',
          dark
            ? 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]'
            : 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]',
          hover && 'transition-shadow duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
          hover && !dark && 'hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_20px_40px_-15px_rgba(0,52,80,0.08)]',
          hover && dark && 'hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_20px_40px_-15px_rgba(0,0,0,0.3)]'
        )}
      >
        {children}
      </div>
    </div>
  )
}
