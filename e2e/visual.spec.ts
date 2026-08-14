import { test, expect } from '@playwright/test'

const routes = ['/tr', '/tr/portfolio']
const themes = ['light', 'dark'] as const

for (const route of routes) {
  for (const theme of themes) {
    test(`visual ${route} ${theme}`, async ({ page }) => {
      await page.goto(route)
      await page.evaluate((t) => {
        localStorage.setItem('fixral-public-theme', t)
        window.dispatchEvent(new CustomEvent('fixral-public-theme-change', { detail: t }))
      }, theme)
      await page.reload()
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot(`${route.replace(/\//g, '_')}-${theme}.png`, {
        maxDiffPixelRatio: 0.05,
        fullPage: false,
      })
    })
  }
}
