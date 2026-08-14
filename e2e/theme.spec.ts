import { test, expect } from '@playwright/test'

const ROUTES = ['/tr', '/tr/portfolio', '/tr/contact']

async function setTheme(page: import('@playwright/test').Page, theme: 'light' | 'dark' | 'system') {
  await page.evaluate((t) => {
    localStorage.setItem('fixral-public-theme', t)
    window.dispatchEvent(new CustomEvent('fixral-public-theme-change', { detail: t }))
  }, theme)
  await page.reload({ waitUntil: 'domcontentloaded' })
}

for (const route of ROUTES) {
  test(`theme lock light: ${route}`, async ({ page }) => {
    await page.goto(route)
    await setTheme(page, 'light')
    const headerBg = await page.locator('header').first().evaluate((el) => getComputedStyle(el).backgroundColor)
    const footerBg = await page.locator('footer').first().evaluate((el) => getComputedStyle(el).backgroundColor)
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(headerBg).toBe(bodyBg)
    expect(footerBg).toBe(bodyBg)
  })

  test(`theme lock dark: ${route}`, async ({ page }) => {
    await page.goto(route)
    await setTheme(page, 'dark')
    const html = page.locator('html')
    await expect(html).toHaveClass(/theme-dark|public-dark/)
  })
}
