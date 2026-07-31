'use client'

/**
 * TechShowcase3D — 3D teknoloji vitrin.
 * 2-column layout: sol metin + bilgi kartları, sağ 3D model (dynamic import, ssr: false).
 * Printables tarzı düz çerçeve: token tabanlı border/yüzey, ağır 3D efekt yok.
 */
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Cpu, Box, Layers, Zap } from 'lucide-react'
import { RevealStagger } from '@/components/ui/RevealStagger'
import { SectionHeader } from '@/components/ui/SectionHeader'

/* ─── 3D viewer: dynamic import, SSR off ─── */
const ModelViewer3D = dynamic(() => import('@/components/3DModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square rounded-sm bg-secondary animate-pulse flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
    </div>
  ),
})

interface Model3DItem {
  _id: string
  url: string
  name: string
  format: string
}

const INFO_CARDS = [
  {
    icon: Cpu,
    title: 'Tersine Mühendislik',
    desc: '3D tarama ile parça geometrilerini dijitalleştirin.',
  },
  {
    icon: Box,
    title: '3D Modelleme',
    desc: 'CAD/CAM çözümleri ile hassas dijital modeller.',
  },
  {
    icon: Layers,
    title: 'Prototipleme',
    desc: 'Hızlı prototip üretimi ve iterasyon döngüleri.',
  },
  {
    icon: Zap,
    title: 'Kalite Kontrol',
    desc: '3D ölçüm ve analiz ile kalite güvencesi.',
  },
]

export default function TechShowcase3D() {
  const [models, setModels] = useState<Model3DItem[]>([])
  const [loadingModels, setLoadingModels] = useState(true)

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/public/3dmodels?limit=1')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setModels(Array.isArray(data) ? data : data.data || data.models || [])
      } catch {
        setModels([])
      } finally {
        setLoadingModels(false)
      }
    }
    fetchModels()
  }, [])

  const firstModel = models[0]

  return (
    <section className="relative py-20 md:py-28" aria-label="3D Teknolojimiz">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div>
            <SectionHeader
              eyebrow="Teknoloji"
              className="mb-10 md:mb-12"
              title="3D Teknolojimiz"
              subtitle="Endüstriyel 3D tarama, modelleme ve prototipleme çözümlerimizle üretim süreçlerinizi dijitalleştirin. Yüksek hassasiyetli ekipmanlarımız ve uzman kadromuzla yanınızdayız."
            />

            {/* Info cards grid */}
            <RevealStagger
              staggerDelay={0.08}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              itemClassName="h-full"
            >
              {INFO_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="flex h-full items-start gap-3 rounded-sm border border-border bg-card p-4 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-accent">
                    <card.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-0.5">{card.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </RevealStagger>
          </div>

          {/* Right: 3D model frame */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-sm border border-border bg-surface-tertiary flex items-center justify-center">
              {loadingModels ? (
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
              ) : firstModel ? (
                <div className="w-full h-full">
                  <ModelViewer3D modelUrl={firstModel.url} format={firstModel.format} />
                </div>
              ) : (
                /* Static fallback poster */
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 bg-accent">
                  <div className="flex h-32 w-32 items-center justify-center rounded-sm border border-border bg-card">
                    <Box size={48} className="text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    3D model yüklenemedi. <br />
                    <span className="text-xs">Admin panel üzerinden model ekleyebilirsiniz.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
