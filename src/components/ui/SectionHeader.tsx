/**
 * SectionHeader — one focused section message: headline stacked over body.
 * The eyebrow is opt-in; taste-skill budgets eyebrows at ceil(sections / 3)
 * per page, so pass one only when the section truly needs categorization.
 * Server-component safe (no motion inside).
 */
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import EyebrowTag from './EyebrowTag'

interface SectionHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Optional eyebrow label; keep within the per-page eyebrow budget */
  eyebrow?: string
  eyebrowVariant?: 'default' | 'light' | 'dark'
  align?: 'left' | 'center'
  className?: string
  titleClassName?: string
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  eyebrowVariant = 'light',
  align = 'left',
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-16 md:mb-20 max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <EyebrowTag variant={eyebrowVariant} className="mb-5">
          {eyebrow}
        </EyebrowTag>
      )}
      <h2 className={cn('section-title', titleClassName)}>{title}</h2>
      {subtitle && (
        <p className={cn('section-subtitle mt-5', align === 'center' && 'mx-auto')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
