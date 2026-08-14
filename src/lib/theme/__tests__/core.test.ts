import {
  PUBLIC_THEME_CONFIG,
  applyThemeClasses,
  normalizePreference,
  resolveTheme,
  setThemePreference,
} from '@/lib/theme/core'

describe('theme core', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('normalizes preference values', () => {
    expect(normalizePreference('dark', 'system')).toBe('dark')
    expect(normalizePreference('invalid', 'light')).toBe('light')
  })

  it('resolves system preference', () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark'),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))
    expect(resolveTheme('system')).toBe('dark')
  })

  it('applies public theme classes', () => {
    applyThemeClasses('dark', PUBLIC_THEME_CONFIG)
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
    applyThemeClasses('light', PUBLIC_THEME_CONFIG)
    expect(document.documentElement.classList.contains('theme-light')).toBe(true)
  })

  it('persists preference', () => {
    setThemePreference(PUBLIC_THEME_CONFIG, 'dark')
    expect(localStorage.getItem(PUBLIC_THEME_CONFIG.storageKey)).toBe('dark')
  })
})
