'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'
import {
  PUBLIC_THEME_CHANGE_EVENT,
  PUBLIC_THEME_STORAGE_KEY,
  applyPublicTheme,
  clearPublicTheme,
  normalizePublicTheme,
  readPublicTheme,
} from '@/lib/public-theme'
import { PUBLIC_THEME_CONFIG, readThemePreference } from '@/lib/theme/core'

function isAdminPath(pathname: string | null | undefined): boolean {
  if (pathname?.startsWith('/admin')) return true
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return true
  }
  return false
}

export default function ThemeScope() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const sync = () => {
      if (isAdminPath(pathname)) {
        clearPublicTheme()
        return
      }
      applyPublicTheme(readThemePreference(PUBLIC_THEME_CONFIG))
    }

    sync()

    const handleThemeChange = (event: Event) => {
      if (isAdminPath(pathname)) return
      const detail = (event as CustomEvent<unknown>).detail
      applyPublicTheme(detail == null ? readPublicTheme() : normalizePublicTheme(detail))
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== PUBLIC_THEME_STORAGE_KEY) return
      sync()
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystem = () => {
      if (readPublicTheme() === 'system') sync()
    }

    window.addEventListener(PUBLIC_THEME_CHANGE_EVENT, handleThemeChange)
    window.addEventListener('storage', handleStorage)
    mq.addEventListener('change', handleSystem)

    return () => {
      window.removeEventListener(PUBLIC_THEME_CHANGE_EVENT, handleThemeChange)
      window.removeEventListener('storage', handleStorage)
      mq.removeEventListener('change', handleSystem)
    }
  }, [pathname])

  return null
}
