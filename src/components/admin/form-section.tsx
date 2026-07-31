import * as React from 'react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  /** İçerik alanı için ek sınıf (örn. iki kolonlu grid) */
  contentClassName?: string
}

/**
 * Form sayfaları için bölümlenmiş kart: başlık + açıklama + alanlar.
 * FormPageSkeleton ile aynı şekli paylaşır.
 */
export function FormSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <section
      className={cn('rounded-xl border bg-card p-5 md:p-6', className)}
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-base font-semibold leading-none tracking-tight text-card-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn('space-y-5', contentClassName)}>{children}</div>
    </section>
  )
}

interface FormActionsProps {
  children: React.ReactNode
  className?: string
  /** true ise ekranın altına yapışır (uzun formlar için) */
  sticky?: boolean
}

/**
 * Form aksiyon çubuğu. Uzun formlarda sticky modda alta sabitlenir,
 * blur arka planla içerikten ayrışır.
 */
export function FormActions({ children, className, sticky }: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end',
        sticky &&
          'sticky bottom-0 z-30 -mx-4 border-t bg-background/80 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/60 md:-mx-6 md:px-6',
        className
      )}
    >
      {children}
    </div>
  )
}
