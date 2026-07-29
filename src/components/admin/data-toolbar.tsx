'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataToolbarProps {
  /** Arama kutusu değeri */
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /** Filtre kontrolleri (Select, DropdownMenu vb.) */
  filters?: React.ReactNode
  /** Sağ tarafa hizalanan kontroller (görünüm değiştirici, sayaç vb.) */
  trailing?: React.ReactNode
  className?: string
}

/**
 * Liste sayfaları için standart araç çubuğu:
 * arama + filtreler solda, ikincil kontroller sağda.
 * Mobilde dikey yığılır.
 */
export function DataToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Ara...',
  filters,
  trailing,
  className,
}: DataToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        className
      )}
    >
      {onSearchChange && (
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8 pr-8"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange('')}
              aria-label="Aramayı temizle"
              className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      )}
      {filters}
      {trailing ? (
        <div className="flex items-center gap-2 sm:ml-auto">{trailing}</div>
      ) : null}
    </div>
  )
}
