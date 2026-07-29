import { ListPageSkeleton } from '@/components/admin/admin-skeletons'

interface AdminPageLayoutProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function AdminPageLayout({
  title,
  description,
  actions,
  children,
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-6 duration-300 animate-in fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </div>
  )
}

/** Geriye dönük uyumluluk: sayfa şekilli liste iskeletine yönlendirir */
export function AdminPageLoading() {
  return <ListPageSkeleton />
}
