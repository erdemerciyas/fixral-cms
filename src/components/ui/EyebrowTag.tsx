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
        'inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.14em]',
        variant === 'light' ? 'text-white/80' : 'text-muted-foreground',
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-block size-1.5 shrink-0 border border-current"
      />
      {children}
    </span>
  )
}
