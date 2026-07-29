'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Tema kapsam bekçisi: public sayfalar her zaman açık temadır (light industrial).
 * Admin'de next-themes <html> üzerine `dark` sınıfı yazar; admin dışına
 * çıkıldığında bu sınıfı temizleyerek tema sızıntısını önler.
 */
export default function ThemeScope() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname?.startsWith('/admin')) {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [pathname])

  return null
}
