/**
 * Capture after-redesign QA screenshots for public routes (light + dark).
 * Usage: node scripts/qa-after-screenshots.mjs
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', '.qa-after')
const base = process.env.QA_BASE_URL || 'http://localhost:3000'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const routes = [
  { name: 'home', path: '/tr' },
  { name: 'services', path: '/tr/services' },
  { name: 'portfolio', path: '/tr/portfolio' },
  { name: 'news', path: '/tr/haberler' },
  { name: 'videos', path: '/tr/videos' },
  { name: 'contact', path: '/tr/contact' },
  { name: 'login', path: '/tr/login' },
  { name: 'register', path: '/tr/register' },
]

async function main() {
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  let portfolioDetailPath = null
  try {
    const res = await fetch(`${base}/api/public/portfolio?limit=1`)
    if (res.ok) {
      const data = await res.json()
      const item = Array.isArray(data) ? data[0] : data?.data?.[0] || data?.items?.[0]
      if (item?.slug) portfolioDetailPath = `/tr/portfolio/${item.slug}`
    }
  } catch {
    /* optional */
  }

  const allRoutes = [...routes]
  if (portfolioDetailPath) {
    allRoutes.splice(3, 0, { name: 'portfolio-detail', path: portfolioDetailPath })
  }

  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    })
    await context.addInitScript((t) => {
      localStorage.setItem('fixral-public-theme', t)
    }, theme)

    const page = await context.newPage()

    for (const route of allRoutes) {
      await page.goto(`${base}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForFunction(
        (t) => {
          const root = document.documentElement
          const hasPublic = root.classList.contains('public-theme')
          const isDark = root.classList.contains('public-dark')
          return hasPublic && (t === 'dark' ? isDark : !isDark)
        },
        theme,
        { timeout: 10000 },
      ).catch(() => {})
      await page.waitForTimeout(800)
      const classes = await page.evaluate(() => document.documentElement.className)
      const file = join(outDir, `${route.name}-${theme}.png`)
      await page.screenshot({ path: file, fullPage: false })
      console.log(`✓ ${route.name}-${theme}  [${classes}]`)
    }

    // Mobile home
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/tr`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: join(outDir, `home-mobile-${theme}.png`), fullPage: false })
    console.log(`✓ home-mobile-${theme}`)

    await context.close()
  }

  writeFileSync(
    join(outDir, 'manifest.json'),
    JSON.stringify(
      { capturedAt: new Date().toISOString(), base, routes: allRoutes, themes: ['light', 'dark'] },
      null,
      2,
    ),
  )

  await browser.close()
  console.log(`\nDone → ${outDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
