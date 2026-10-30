/**
 * FIXRAL hizmet ikonları — 24 × 24 ızgara, 1.75 çizgi, yuvarlak uç, tek renk.
 * Renk `currentColor`; koyu zeminde turuncu, açık zeminde accent tonu kullanılır.
 */
import type { SVGProps } from 'react'
import type { ServiceKey } from '@/content/fixral'

const SERVICE_PATHS: Record<ServiceKey, string> = {
  tarama: 'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M2.5 12h19M8.5 9l3.5-2 3.5 2v4l-3.5 2-3.5-2z',
  tersine: 'M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6M18 3v3.6h-3.6M6 21v-3.6h3.6M9.5 10.5 12 9l2.5 1.5v3L12 15l-2.5-1.5z',
  otomotiv: 'M4 16a8 8 0 1 1 16 0M12 16l3.5-4.5M7 12.5l-1-.6M12 9V8M17 12.5l1-.6M5 19h14',
  cad: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5M15.5 3.8 20 6.3',
  pcb: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4M10 10h4v4h-4z',
  gomulu: 'M4 10h16v10H4zM7 10V4h3v3h3V4h3v6M8 14h3M8 17h5M16 14v3',
  baski: 'M9 3h6v4l-2 2.5h-2L9 7zM12 9.5V12M5 15h14M5 18h14M7 21h10',
  cnc: 'M10 3h4v5h-4zM11 8v6.5l1 2 1-2V8M4 21h16M6 18h12M11 5.5h2',
}

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export function ServiceIcon({ name, ...rest }: IconProps & { name: ServiceKey }) {
  return (
    <svg {...base} {...rest}>
      <path d={SERVICE_PATHS[name]} />
    </svg>
  )
}

export const ArrowRight = (p: IconProps) => (<svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
export const ArrowUpRight = (p: IconProps) => (<svg {...base} {...p}><path d="M7 17 17 7M9 7h8v8" /></svg>)
export const ExternalIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>)
export const SearchIcon = (p: IconProps) => (<svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>)
export const MenuIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h10" /></svg>)
export const CloseIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const PlayIcon = (p: IconProps) => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M7 4v16l13-8z" /></svg>)
export const GithubIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
  </svg>
)
