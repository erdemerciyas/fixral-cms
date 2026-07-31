'use client'

/**
 * MarqueeStrip — Sonsuz kayan logo/ikon bandı.
 * CSS animation marquee-continuous kullanarak sonsuz döngü illüzyonu oluşturur.
 * İçerik 2 kez render edilir, gradient mask ile kenarlarda fade-out.
 * Dekoratif içerik için aria-hidden="true" kullanır.
 */
import { forwardRef, type ReactNode, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface MarqueeStripProps {
  children: ReactNode
  className?: string
  /** Animasyon süresi (saniye, varsayılan 30) */
  speed?: number
  /** Ters yönde kaydırma */
  reverse?: boolean
  /** Hover'da duraklatma */
  pauseOnHover?: boolean
}

export const MarqueeStrip = forwardRef<HTMLDivElement, MarqueeStripProps>(
  function MarqueeStrip(
    {
      children,
      className,
      speed = 30,
      reverse = false,
      pauseOnHover = true,
    },
    ref,
  ) {
    const animationStyle = useMemo(
      () => ({
        animationDuration: `${speed}s`,
        animationDirection: reverse ? ('reverse' as const) : ('normal' as const),
        animationPlayState: 'running',
      }),
      [speed, reverse],
    )

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          // Gradient mask: sol ve sağ kenarlarda fade-out
          'mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
          '[-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
          pauseOnHover && 'group',
          className,
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            'flex min-w-max animate-[marquee-continuous_linear_infinite]',
            'motion-reduce:animate-none',
            pauseOnHover && 'group-hover:paused',
          )}
          style={animationStyle}
        >
          {/* İlk kopya */}
          <div className="flex shrink-0 items-center gap-8 px-4">
            {children}
          </div>
          {/* İkinci kopya — sonsuz döngü illüzyonu */}
          <div className="flex shrink-0 items-center gap-8 px-4" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>
    )
  },
)
