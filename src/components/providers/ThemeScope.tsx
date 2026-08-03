'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect } from 'react'
import {
  PUBLIC_THEME_CHANGE_EVENT,
  PUBLIC_THEME_STORAGE_KEY,
  applyPublicTheme,
  clearPublicTheme,
  normalizePublicTheme,
  readPublicTheme,
} from '@/lib/public-theme'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function isAdminPath(pathname: string | null | undefined): boolean {
  if (pathname?.startsWith('/admin')) return true
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return true
  }
  return false
}

/**
 * Tema kapsam bekçisi: public sayfalarda `.public-theme` (+ dark ise
 * `.public-dark`) sınıflarını <html> üzerine yazar.
 *
 * React hydrate bazen FOUC script sınıflarını temizler; bu yüzden
 * layout effect + rAF + storage/event dinleyicileri ile yeniden uygularız.
 */
export default function ThemeScope() {
  const pathname = usePathname()

  useIsomorphicLayoutEffect(() => {
    const sync = () => {
      if (isAdminPath(pathname)) {
        clearPublicTheme()
        return
      }
      applyPublicTheme(readPublicTheme())
    }

    sync()

    // Hydrate sonrası React class wipe'ına karşı bir frame daha uygula
    const raf = window.requestAnimationFrame(sync)

    const handleThemeChange = (event: Event) => {
      if (isAdminPath(pathname)) return
      const detail = (event as CustomEvent<unknown>).detail
      applyPublicTheme(detail == null ? readPublicTheme() : normalizePublicTheme(detail))
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== PUBLIC_THEME_STORAGE_KEY) return
      sync()
    }

    window.addEventListener(PUBLIC_THEME_CHANGE_EVENT, handleThemeChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener(PUBLIC_THEME_CHANGE_EVENT, handleThemeChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [pathname])

  // Fallback: client mount'ta useEffect ile de uygula (layout effect kaçarsa)
  useEffect(() => {
    if (isAdminPath(pathname)) {
      clearPublicTheme()
      return
    }
    applyPublicTheme(readPublicTheme())
  }, [pathname])

  return null
}
