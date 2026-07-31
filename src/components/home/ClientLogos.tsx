'use client'

/**
 * ClientLogos — Sonsuz kayan sektör bandı.
 * MarqueeStrip ile ikon destekli tam kelime etiketler.
 * Speed: 40s, gradient mask kenarlarda, aria-hidden dekoratif.
 */
import {
  Factory,
  Building2,
  Cog,
  Cpu,
  Wrench,
  Puzzle,
  Ruler,
  Truck,
  FlaskConical,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { MarqueeStrip } from '@/components/ui/MarqueeStrip'

const SECTORS: { icon: LucideIcon; label: string }[] = [
  { icon: Factory, label: 'Üretim' },
  { icon: Building2, label: 'İnşaat' },
  { icon: Cog, label: 'Mekanik' },
  { icon: Cpu, label: 'Elektronik' },
  { icon: Wrench, label: 'Bakım' },
  { icon: Puzzle, label: 'Montaj' },
  { icon: Ruler, label: 'Ölçüm' },
  { icon: Truck, label: 'Lojistik' },
  { icon: FlaskConical, label: 'Ar-Ge' },
  { icon: ShieldCheck, label: 'Kalite' },
]

export default function ClientLogos() {
  return (
    <div className="py-8 md:py-10 border-y border-border" aria-hidden="true">
      <MarqueeStrip speed={40} pauseOnHover>
        {SECTORS.map((sector, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-6 py-3 shrink-0 select-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary/70">
              <sector.icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight text-muted-foreground whitespace-nowrap">
              {sector.label}
            </span>
          </div>
        ))}
      </MarqueeStrip>
    </div>
  )
}
