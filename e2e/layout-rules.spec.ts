import { test, expect } from '@playwright/test'

test('nav single line at desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/tr')
  const header = page.locator('header').first()
  const box = await header.boundingBox()
  expect(box?.height).toBeLessThanOrEqual(80)
})

test('hero CTA visible without scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/tr')
  const cta = page.getByRole('link').filter({ hasText: /portfolyo|portfolio|iletişim|contact/i }).first()
  await expect(cta).toBeInViewport()
})
