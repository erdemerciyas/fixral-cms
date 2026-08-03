'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_PUBLIC_THEME,
  PUBLIC_THEME_CHANGE_EVENT,
  PUBLIC_THEME_STORAGE_KEY,
  readPublicTheme,
  setPublicTheme,
  type PublicTheme,
} from '@/lib/public-theme'

const TOGGLE_CLASS =
  'inline-flex h-9 w-9 items-center justify-center rounded-xs border border-border bg-transparent text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

// Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
const subscribeNoop = () => () => {}

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

interface ThemeToggleProps {
  className?: string
}

/**
 * Public site light/dark anahtarı. Tercihi localStorage'a yazar, <html>
 * sınıflarını anında günceller ve `fixral-public-theme-change` event'i ile
 * ThemeScope'u haberdar eder. Hydration uyuşmazlığını önlemek için mount
 * olana dek aynı boyutta nötr placeholder render eder.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false)
  const theme = useSyncExternalStore(
    subscribePublicTheme,
    readPublicTheme,
    () => DEFAULT_PUBLIC_THEME as PublicTheme
  )

  if (!mounted) {
    return <div className={cn(TOGGLE_CLASS, className)} aria-hidden="true" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setPublicTheme(isDark ? 'light' : 'dark')}
      className={cn(TOGGLE_CLASS, className)}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      aria-pressed={isDark}
      title={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export default ThemeToggle
