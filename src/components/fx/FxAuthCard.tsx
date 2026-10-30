'use client'

/**
 * Giriş / kayıt / şifre sıfırlama kartı (redesign 2026): sayfa zemininde ince
 * ızgara, ortada her temada koyu ada kart (FX işareti, başlık, alanlar, alt bağlantı).
 */
import { useState, type ReactNode, type InputHTMLAttributes } from 'react'
import { FxMark } from './FxLogo'

export function FxAuthCard({ title, lede, titleId, children, foot }: { title: string; lede?: string; titleId: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <section className="fx-auth" aria-labelledby={titleId}>
      <div className="fx-auth__grid" aria-hidden="true" />
      <div className="fx-auth__card public-theme public-dark fx-rv">
        <div className="fx-auth__head">
          <FxMark tone="light" className="fx-auth__mark" />
          <h1 id={titleId}>{title}</h1>
          {lede && <p>{lede}</p>}
        </div>
        {children}
        {foot && <div className="fx-auth__foot">{foot}</div>}
      </div>
    </section>
  )
}

const Eye = ({ off }: { off?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
)

/** Göster/gizle düğmeli şifre alanı */
export function FxPasswordInput({ showLabel, hideLabel, ...props }: InputHTMLAttributes<HTMLInputElement> & { showLabel: string; hideLabel: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="fx-pass">
      <input {...props} type={show ? 'text' : 'password'} />
      <button type="button" className="fx-pass__toggle" onClick={() => setShow((s) => !s)} aria-label={show ? hideLabel : showLabel} aria-pressed={show} aria-controls={props.id}>
        <Eye off={show} />
      </button>
    </span>
  )
}

/** Yalnızca site içi göreli yollar kabul edilir (açık yönlendirme koruması) */
export function safeRedirect(raw: string | null | undefined, fallback: string) {
  if (!raw) return fallback
  try {
    let v = decodeURIComponent(raw)
    if (typeof window !== 'undefined' && v.startsWith(window.location.origin)) v = v.slice(window.location.origin.length) || '/'
    if (v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') && !v.startsWith('/api/')) return v
  } catch { /* geçersiz kodlama */ }
  return fallback
}
