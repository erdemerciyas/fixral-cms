'use client'

/**
 * MagneticButton — Cursor'a hafif çekilen manyetik buton bileşeni.
 * Mouse hareketine göre transform uygular, spring ile geri döner.
 * asChild prop'u ile children'ı Slot pattern üzerinden render edebilir.
 */
import {
  forwardRef,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import {
  m,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** Çekim gücü katsayısı (0–1 arası, varsayılan 0.3) */
  strength?: number
  /** true ise children kendi DOM elemanı olarak render edilir (Slot pattern) */
  asChild?: boolean
  onClick?: () => void
}

const MAX_OFFSET = 20 // px — maksimum manyetik sapma

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    {
      children,
      className,
      strength = 0.3,
      asChild = false,
      onClick,
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLButtonElement>(null)
    const ref = (forwardedRef as React.RefObject<HTMLButtonElement>) ?? innerRef

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
    const springX = useSpring(x, springConfig)
    const springY = useSpring(y, springConfig)

    const prefersReduced = useReducedMotion()

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current || prefersReduced) return
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const rawX = (e.clientX - centerX) * strength
        const rawY = (e.clientY - centerY) * strength

        // Clamp to ±MAX_OFFSET
        x.set(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, rawX)))
        y.set(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, rawY)))
      },
      [strength, x, y, ref, prefersReduced],
    )

    const handleMouseLeave = useCallback(() => {
      x.set(0)
      y.set(0)
    }, [x, y])

    const sharedClassName = cn(
      'inline-flex items-center justify-center cursor-pointer',
      'active:scale-[0.98]',
      'transition-[transform] duration-200',
      className,
    )

    // Slot ve m.button prop tipleri uyuşmadığı için (MotionValue style) dallar ayrı render edilir
    if (asChild) {
      return (
        <Slot
          ref={ref}
          onClick={onClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={sharedClassName}
        >
          {children}
        </Slot>
      )
    }

    return (
      <m.button
        ref={ref}
        style={{ x: springX, y: springY }}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={sharedClassName}
      >
        {children}
      </m.button>
    )
  },
)
