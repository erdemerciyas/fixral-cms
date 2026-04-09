import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionWrapperProps {
  children: ReactNode
  className?: string
  as?: 'section' | 'div'
  size?: 'default' | 'narrow' | 'wide' | 'full'
  padding?: 'default' | 'sm' | 'lg'
  id?: string
  ariaLabel?: string
}

export default function SectionWrapper({
  children,
  className,
  as: Component = 'section',
  size = 'default',
  padding = 'default',
  id,
  ariaLabel,
}: SectionWrapperProps) {
  const maxWidthClass = {
    default: 'max-w-[1400px]',
    narrow: 'max-w-4xl',
    wide: 'max-w-7xl',
    full: 'max-w-none',
  }[size]

  const paddingClass = {
    default: 'py-24 md:py-32 lg:py-40',
    sm: 'py-16 md:py-24 lg:py-28',
    lg: 'py-32 md:py-40 lg:py-48',
  }[padding]

  return (
    <Component
      id={id}
      aria-label={ariaLabel}
      className={cn(paddingClass, className)}
    >
      <div className={cn(maxWidthClass, 'mx-auto px-6 sm:px-8 lg:px-12')}>
        {children}
      </div>
    </Component>
  )
}
