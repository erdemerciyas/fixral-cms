/**
 * Public (site) tema yardımcıları — Printables mantığı light/dark.
 *
 * Dark temanın devreye girmesi için <html> üzerinde HER İKİ class birlikte
 * bulunmalıdır: `public-theme public-dark` (globals.css specificity kuralı).
 * Admin tarafı AdminThemeProvider ile yönetilir (storageKey: fixral-admin-theme) ve
 * bu modül admin route'larında yalnızca temizlik yapar.
 */

export type PublicTheme = 'light' | 'dark'

export const PUBLIC_THEME_STORAGE_KEY = 'fixral-public-theme'
export const PUBLIC_THEME_CHANGE_EVENT = 'fixral-public-theme-change'
/** Marka sistemi koyu ağırlıklıdır: tercih yoksa koyu tema uygulanır. */
export const DEFAULT_PUBLIC_THEME: PublicTheme = 'dark'

/** localStorage'daki tercihi okur; okunamazsa/geçersizse varsayılana düşer. */
export function readPublicTheme(): PublicTheme {
  if (typeof window === 'undefined') return DEFAULT_PUBLIC_THEME
  try {
    const stored = window.localStorage.getItem(PUBLIC_THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return DEFAULT_PUBLIC_THEME
  } catch {
    return DEFAULT_PUBLIC_THEME
  }
}

/** <html> üzerine public tema sınıflarını ve colorScheme'i yazar. */
export function applyPublicTheme(theme: PublicTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('dark')
  root.classList.add('public-theme')
  if (theme === 'dark') {
    root.classList.add('public-dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('public-dark')
    root.style.colorScheme = 'light'
  }
}

/** Admin'e geçişte public tema izlerini siler. */
export function clearPublicTheme(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('public-theme', 'public-dark')
  root.style.colorScheme = ''
}

/** Tercihi kaydeder, DOM'a anında uygular ve dinleyicileri haberdar eder. */
export function setPublicTheme(theme: PublicTheme): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PUBLIC_THEME_STORAGE_KEY, theme)
  } catch {
    /* private mode / kota — DOM güncellemesi yine de uygulanır */
  }
  applyPublicTheme(theme)
  window.dispatchEvent(new CustomEvent<PublicTheme>(PUBLIC_THEME_CHANGE_EVENT, { detail: theme }))
}

/** Custom event / storage event detayını güvenli PublicTheme değerine indirger. */
export function normalizePublicTheme(value: unknown): PublicTheme {
  return value === 'light' || value === 'dark' ? value : DEFAULT_PUBLIC_THEME
}
