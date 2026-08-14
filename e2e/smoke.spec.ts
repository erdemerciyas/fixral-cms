import { test, expect } from '@playwright/test'

const PUBLIC_ROUTES = [
  '/tr',
  '/tr/portfolio',
  '/tr/contact',
  '/tr/services',
  '/tr/videos',
  '/tr/haberler',
  '/tr/login',
  '/tr/register',
  '/es',
  '/es/portfolio',
  '/es/contact',
  '/es/services',
  '/es/videos',
  '/es/noticias',
]

for (const route of PUBLIC_ROUTES) {
  test(`smoke: ${route} renders`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('main, [role="main"], #main-content').first()).toBeVisible()
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
  })
}
