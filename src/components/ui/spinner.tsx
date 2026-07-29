import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SpinnerProps {
  text?: string
  className?: string
}

export function Spinner({ text, className }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn('flex items-center justify-center gap-3 py-4', className)}
    >
      <Loader2 className="size-5 animate-spin text-primary" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}
