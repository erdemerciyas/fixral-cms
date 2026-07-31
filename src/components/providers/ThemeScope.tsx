'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  PUBLIC_THEME_CHANGE_EVENT,
  PUBLIC_THEME_STORAGE_KEY,
  applyPublicTheme,
  clearPublicTheme,
  normalizePublicTheme,
  readPublicTheme,
} from '@/lib/public-theme'

/**
 * Tema kapsam bekçisi: public sayfalarda `.public-theme` (+ tercih dark ise
 * `.public-dark`) sınıflarını <html> üzerine yazar; tercihi
 * localStorage['fixral-public-theme'] üzerinden okur (varsayılan: light).
 * Admin'de next-themes <html> üzerine `dark` sınıfı yazar; admin dışına
 * çıkıldığında bu sınıfı, admin'e girildiğinde de public sınıflarını
 * temizleyerek tema sızıntısını önler.
 */
export default function ThemeScope() {
  const pathname = usePathname()

  useEffect(() => {
    const isPublic = !pathname?.startsWith('/admin')

    if (!isPublic) {
      clearPublicTheme()
      return
    }

    applyPublicTheme(readPublicTheme())

    // Aynı sekmede toggle ile yapılan değişiklik
    const handleThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail
      applyPublicTheme(detail == null ? readPublicTheme() : normalizePublicTheme(detail))
    }

    // Sekmeler arası senkron
    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== PUBLIC_THEME_STORAGE_KEY) return
      applyPublicTheme(readPublicTheme())
    }

    window.addEventListener(PUBLIC_THEME_CHANGE_EVENT, handleThemeChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(PUBLIC_THEME_CHANGE_EVENT, handleThemeChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [pathname])

  return null
}
