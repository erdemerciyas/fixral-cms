'use client'

/**
 * Modal diyalog davranışı: odak tuzağı, Escape ile kapatma, açılışta odak,
 * kapanışta odağı geri verme ve gövde kaydırma kilidi.
 * Teklif modalı ve hesap sayfasındaki adres formu kullanır.
 */
import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFxDialog(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>, initialFocusRef?: RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const { body, documentElement } = document
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    const gap = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`

    const focusFirst = () => {
      const panel = panelRef.current
      if (!panel) return
      const target = initialFocusRef?.current || panel.querySelector<HTMLElement>('[data-autofocus]') || panel.querySelector<HTMLElement>(FOCUSABLE) || panel
      target.focus({ preventScroll: true })
    }
    const raf = window.requestAnimationFrame(focusFirst)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (!items.length) { e.preventDefault(); panel.focus(); return }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && (active === first || !panel.contains(active))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (active === last || !panel.contains(active))) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey, true)

    return () => {
      window.cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey, true)
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus({ preventScroll: true })
    }
  }, [open, panelRef, initialFocusRef])
}
