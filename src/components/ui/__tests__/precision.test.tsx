/**
 * Precision kit primitives smoke tests (Phase 3).
 * Covers: BlueprintGrid overlay rendering, TechLabel index/marker formatting,
 * MeasureRule separator semantics, DataStat reduced-motion final value,
 * and motion preset variant shapes (incl. reduced-motion collapse).
 *
 * matchMedia is mocked with prefers-reduced-motion: reduce so DataStat
 * renders its final value deterministically (no rAF timing in jsdom).
 */
import { render, screen } from '@testing-library/react'
import { BlueprintGrid } from '../BlueprintGrid'
import { TechLabel, Eyebrow } from '../TechLabel'
import { MeasureRule } from '../MeasureRule'
import { DataStat } from '../DataStat'
import {
  MOTION_DURATION,
  MOTION_STAGGER,
  fadeUp,
  clipReveal,
  staggerContainer,
  staggerItem,
} from '../motion'

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})

describe('BlueprintGrid', () => {
  it('renders as an aria-hidden, pointer-safe overlay with grid layers', () => {
    render(<BlueprintGrid />)
    const grid = screen.getByTestId('blueprint-grid')
    expect(grid.getAttribute('aria-hidden')).toBe('true')
    expect(grid.className).toContain('pointer-events-none')
    expect(grid.className).toContain('absolute')
    // minor + major grid layers by default
    expect(grid.children).toHaveLength(2)
    expect(grid.children[0].className).toContain('var(--color-line)')
  })

  it('skips major lines when major=false and merges className', () => {
    render(<BlueprintGrid major={false} density="fine" opacity="strong" className="z-10" />)
    const grid = screen.getByTestId('blueprint-grid')
    expect(grid.children).toHaveLength(1)
    expect(grid.children[0].className).toContain('24px_24px')
    expect(grid.className).toContain('z-10')
  })
})

describe('TechLabel', () => {
  it('renders children with a zero-padded numeric index', () => {
    render(<TechLabel index={1}>TARAMA</TechLabel>)
    expect(screen.getByText('TARAMA')).toBeTruthy()
    expect(screen.getByText('01')).toBeTruthy()
    expect(screen.getByText('/')).toBeTruthy()
  })

  it('renders the crosshair marker and honors the as prop', () => {
    render(
      <TechLabel as="p" marker="crosshair">
        Precision
      </TechLabel>,
    )
    expect(screen.getByText('+')).toBeTruthy()
    expect(screen.getByText('Precision').closest('p')).toBeTruthy()
  })

  it('is also exported as Eyebrow', () => {
    expect(Eyebrow).toBe(TechLabel)
  })
})

describe('MeasureRule', () => {
  it('renders as a horizontal separator by default', () => {
    render(<MeasureRule />)
    const rule = screen.getByRole('separator')
    expect(rule.getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('renders an optional monospace label and vertical orientation', () => {
    render(<MeasureRule orientation="vertical" label="Ø 0.02" />)
    const rule = screen.getByRole('separator')
    expect(rule.getAttribute('aria-orientation')).toBe('vertical')
    expect(screen.getByText('Ø 0.02')).toBeTruthy()
  })
})

describe('DataStat', () => {
  it('shows the final value immediately under reduced motion', () => {
    render(<DataStat value={120} suffix="+" label="Tamamlanan proje" />)
    expect(screen.getByText('120')).toBeTruthy()
    expect(screen.getByText('+')).toBeTruthy()
    expect(screen.getByText('Tamamlanan proje')).toBeTruthy()
  })

  it('respects decimals and prefix', () => {
    render(<DataStat value={0.05} prefix="±" decimals={2} suffix="mm" />)
    expect(screen.getByText(/±/)).toBeTruthy()
    expect(screen.getByText(/0\.05/)).toBeTruthy()
  })
})

describe('motion presets', () => {
  it('fadeUp animates opacity + y with token duration', () => {
    const variants = fadeUp(false)
    expect(variants.hidden).toMatchObject({ opacity: 0, y: 24 })
    expect(variants.visible).toMatchObject({
      opacity: 1,
      y: 0,
      transition: { duration: MOTION_DURATION.base },
    })
  })

  it('clipReveal wipes via clip-path', () => {
    const variants = clipReveal(false)
    expect(variants.hidden).toMatchObject({ clipPath: 'inset(0 0 100% 0)' })
    expect(variants.visible).toMatchObject({ clipPath: 'inset(0 0 0% 0)' })
  })

  it('staggerContainer/staggerItem share the stagger token', () => {
    const container = staggerContainer(false)
    expect(container.visible).toMatchObject({
      transition: { staggerChildren: MOTION_STAGGER },
    })
    expect(staggerItem(false).hidden).toMatchObject({ opacity: 0, y: 20 })
  })

  it('collapses every preset to instant opacity-only under reduced motion', () => {
    for (const variants of [
      fadeUp(true),
      clipReveal(true),
      staggerContainer(true),
      staggerItem(true),
    ]) {
      expect(variants.hidden).toEqual({ opacity: 0 })
      expect(variants.visible).toEqual({ opacity: 1, transition: { duration: 0 } })
    }
  })
})
