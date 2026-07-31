/**
 * Phase 0 primitives smoke tests.
 * Covers: render with content, eyebrow opt-in behavior, alert role,
 * pointer-event safety on motion primitives.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { SectionHeader } from '../SectionHeader'
import { RevealStagger } from '../RevealStagger'
import { SpotlightCard } from '../SpotlightCard'

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
  if (!window.IntersectionObserver) {
    class IntersectionObserverMock {
      readonly root = null
      readonly rootMargin = '0px'
      readonly thresholds = [0]
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }
    window.IntersectionObserver =
      IntersectionObserverMock as unknown as typeof IntersectionObserver
  }
})

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(
      <EmptyState
        title="No results"
        description="Try adjusting the filters"
        action={<button type="button">Reset</button>}
      />,
    )
    expect(screen.getByText('No results')).toBeTruthy()
    expect(screen.getByText('Try adjusting the filters')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy()
  })
})

describe('ErrorState', () => {
  it('renders with role="alert" and recovery action', () => {
    render(<ErrorState title="Something failed" action={<button type="button">Retry</button>} />)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Something failed')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  })
})

describe('SectionHeader', () => {
  it('renders title and subtitle without eyebrow by default', () => {
    render(<SectionHeader title="Services" subtitle="What we do" />)
    expect(screen.getByRole('heading', { name: 'Services' })).toBeTruthy()
    expect(screen.getByText('What we do')).toBeTruthy()
  })

  it('renders eyebrow only when provided', () => {
    const { queryByText } = render(<SectionHeader title="Services" eyebrow="Capabilities" />)
    expect(queryByText('Capabilities')).toBeTruthy()
  })
})

describe('RevealStagger', () => {
  it('renders all children', () => {
    render(
      <LazyMotion features={domAnimation}>
        <RevealStagger>
          <p>Item A</p>
          <p>Item B</p>
        </RevealStagger>
      </LazyMotion>,
    )
    expect(screen.getByText('Item A')).toBeTruthy()
    expect(screen.getByText('Item B')).toBeTruthy()
  })
})

describe('SpotlightCard', () => {
  it('renders children and survives pointer events', () => {
    const { container } = render(
      <LazyMotion features={domAnimation}>
        <SpotlightCard>
          <p>Card body</p>
        </SpotlightCard>
      </LazyMotion>,
    )
    expect(screen.getByText('Card body')).toBeTruthy()
    const card = container.firstElementChild
    expect(card).toBeTruthy()
    fireEvent.mouseMove(card as Element, { clientX: 10, clientY: 10 })
    fireEvent.mouseLeave(card as Element)
  })
})
