/**
 * Public site theme — re-exports unified theme engine with public config.
 */

import {
  PUBLIC_THEME_CONFIG,
  applyThemeClasses,
  clearPublicThemeClasses,
  readResolvedTheme,
  readThemePreference,
  resolveTheme,
  setThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme/core'

export type PublicTheme = ThemePreference
export type PublicResolvedTheme = ResolvedTheme

export const PUBLIC_THEME_STORAGE_KEY = PUBLIC_THEME_CONFIG.storageKey
export const PUBLIC_THEME_CHANGE_EVENT = PUBLIC_THEME_CONFIG.changeEvent
export const DEFAULT_PUBLIC_THEME: ThemePreference = 'system'

export function readPublicTheme(): ThemePreference {
  return readThemePreference(PUBLIC_THEME_CONFIG)
}

export function readPublicResolvedTheme(): ResolvedTheme {
  return readResolvedTheme(PUBLIC_THEME_CONFIG)
}

export function applyPublicTheme(preference: ThemePreference): void {
  applyThemeClasses(resolveTheme(preference), PUBLIC_THEME_CONFIG)
}

export function clearPublicTheme(): void {
  clearPublicThemeClasses()
}

export function setPublicTheme(preference: ThemePreference): void {
  setThemePreference(PUBLIC_THEME_CONFIG, preference)
}

export function normalizePublicTheme(value: unknown): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return DEFAULT_PUBLIC_THEME
}
