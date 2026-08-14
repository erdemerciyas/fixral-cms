'use client'

import { useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_PUBLIC_THEME,
  PUBLIC_THEME_CHANGE_EVENT,
  PUBLIC_THEME_STORAGE_KEY,
  readPublicTheme,
  setPublicTheme,
  type PublicTheme,
} from '@/lib/public-theme'

const BASE_CLASS =
  'inline-flex h-9 items-center gap-0.5 rounded-xs border border-border bg-transparent p-0.5'

function subscribePublicTheme(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== PUBLIC_THEME_STORAGE_KEY) return
    callback()
  }
  window.addEventListener(PUBLIC_THEME_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(PUBLIC_THEME_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}

const subscribeNoop = () => () => {}

const MODES: { value: PublicTheme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Açık tema' },
  { value: 'dark', icon: Moon, label: 'Koyu tema' },
  { value: 'system', icon: Monitor, label: 'Sistem teması' },
]

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false)
  const theme = useSyncExternalStore(
    subscribePublicTheme,
    readPublicTheme,
    () => DEFAULT_PUBLIC_THEME
  )

  if (!mounted) {
    return <div className={cn(BASE_CLASS, 'w-[108px]', className)} aria-hidden="true" />
  }

  return (
    <div className={cn(BASE_CLASS, className)} role="group" aria-label="Tema seçimi">
      {MODES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPublicTheme(value)}
          className={cn(
            'inline-flex h-7 w-8 items-center justify-center transition-colors',
            theme === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle
