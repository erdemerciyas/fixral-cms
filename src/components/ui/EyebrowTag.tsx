import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EyebrowTagProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'light' | 'dark'
}

export default function EyebrowTag({
  children,
  className,
  variant = 'default',
}: EyebrowTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1 text-[11px] uppercase font-medium tracking-[0.15em]',
        variant === 'default' && 'border border-border text-accent-foreground bg-accent',
        variant === 'light' && 'border border-white/15 text-white/80 bg-white/5',
        variant === 'dark' && 'border border-border text-accent-foreground bg-accent',
        className
      )}
    >
      {children}
    </span>
  )
}
