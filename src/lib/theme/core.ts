/**
 * Unified theme engine for public and admin surfaces.
 * Public: theme-light | theme-dark (+ legacy public-theme/public-dark aliases)
 * Admin: light | dark (resolved from system preference when needed)
 */

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeConfig {
  storageKey: string
  changeEvent: string
  defaultPreference: ThemePreference
  isAdmin: boolean
}

export const PUBLIC_THEME_CONFIG: ThemeConfig = {
  storageKey: 'fixral-public-theme',
  changeEvent: 'fixral-public-theme-change',
  defaultPreference: 'system',
  isAdmin: false,
}

export const ADMIN_THEME_CONFIG: ThemeConfig = {
  storageKey: 'fixral-admin-theme',
  changeEvent: 'fixral-admin-theme-change',
  defaultPreference: 'system',
  isAdmin: true,
}

export function normalizePreference(value: unknown, fallback: ThemePreference): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return fallback
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return getSystemTheme()
  return preference
}

export function readThemePreference(config: ThemeConfig): ThemePreference {
  if (typeof window === 'undefined') return config.defaultPreference
  try {
    const stored = window.localStorage.getItem(config.storageKey)
    return normalizePreference(stored, config.defaultPreference)
  } catch {
    return config.defaultPreference
  }
}

export function readResolvedTheme(config: ThemeConfig): ResolvedTheme {
  return resolveTheme(readThemePreference(config))
}

export function applyThemeClasses(resolved: ResolvedTheme, config: ThemeConfig): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (config.isAdmin) {
    root.classList.remove('light', 'dark', 'theme-light', 'theme-dark', 'public-theme', 'public-dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
    return
  }

  root.classList.remove('light', 'dark', 'theme-light', 'theme-dark', 'public-theme', 'public-dark')
  if (resolved === 'dark') {
    root.classList.add('theme-dark', 'public-dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.add('theme-light', 'public-theme')
    root.style.colorScheme = 'light'
  }
}

export function clearPublicThemeClasses(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('theme-light', 'theme-dark', 'public-theme', 'public-dark')
  root.style.colorScheme = ''
}

export function setThemePreference(config: ThemeConfig, preference: ThemePreference): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(config.storageKey, preference)
  } catch {
    /* private mode */
  }
  applyThemeClasses(resolveTheme(preference), config)
  window.dispatchEvent(new CustomEvent<ThemePreference>(config.changeEvent, { detail: preference }))
}
