/**
 * Design lint — taste-skill pre-flight mechanical checks for public site.
 * Usage: node scripts/design-lint.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const PUBLIC_DIRS = [
  path.join(root, 'src/components'),
  path.join(root, 'src/templates'),
  path.join(root, 'src/app/[lang]'),
  path.join(root, 'messages'),
]

const SKIP_DIRS = ['admin', 'api', '__tests__']

let errors = 0
let warnings = 0

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.some((s) => full.includes(`${path.sep}${s}${path.sep}`) || entry.name === s)) continue
      walk(full, files)
    } else if (/\.(tsx|ts|json)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
}

const files = PUBLIC_DIRS.flatMap((d) => walk(d))

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8')
  const content = stripComments(raw)
  const rel = path.relative(root, file)

  if (/['"`][^'"`]*[\u2014\u2013][^'"`]*['"`]/.test(content)) {
    console.error(`[FAIL] em-dash/en-dash in string literal: ${rel}`)
    errors++
  }

  if (/window\.addEventListener\(['"]scroll/.test(content)) {
    console.error(`[FAIL] scroll listener in ${rel}`)
    errors++
  }

  if (/from ['"]gsap/.test(content) && /from ['"]framer-motion|from ['"]motion\/react/.test(content)) {
    console.error(`[FAIL] GSAP + framer-motion mix in ${rel}`)
    errors++
  }

  if (/className=\{?[^}]*public-theme public-dark|className=["'][^"']*public-theme public-dark/.test(content)) {
    console.error(`[FAIL] forced dark subtree in ${rel}`)
    errors++
  }

  if (/blueprint-grid|hex-grid|eyebrow-tag|bg-gradient-subtle|bg-mesh/.test(content)) {
    console.warn(`[WARN] banned utility in ${rel}`)
    warnings++
  }
}

console.log(`\nDesign lint: ${errors} errors, ${warnings} warnings`)
process.exit(errors > 0 ? 1 : 0)
