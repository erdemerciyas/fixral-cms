import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = ['/tr', '/tr/portfolio', '/tr/contact', '/es']

for (const route of ROUTES) {
  for (const theme of ['light', 'dark'] as const) {
    test(`a11y ${route} ${theme}`, async ({ page }) => {
      await page.goto(route)
      await page.evaluate((t) => {
        localStorage.setItem('fixral-public-theme', t)
        window.dispatchEvent(new CustomEvent('fixral-public-theme-change', { detail: t }))
      }, theme)
      await page.reload()
      const results = await new AxeBuilder({ page }).analyze()
      const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
      expect(serious).toEqual([])
    })
  }
}
