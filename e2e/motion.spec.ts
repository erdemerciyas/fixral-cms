import { test, expect } from '@playwright/test'

test('reduced motion disables scroll pin markers', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/tr')
  await page.waitForTimeout(1000)
  const pinCount = await page.evaluate(() => {
    return document.querySelectorAll('.pin-spacer').length
  })
  expect(pinCount).toBe(0)
})

test('mobile uses poster not canvas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/tr')
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveCount(0)
})
