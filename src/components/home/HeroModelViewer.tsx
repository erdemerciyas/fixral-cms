'use client'

/**
 * HeroModelViewer — hero sağ panelinde restrained 3D öğe.
 * /api/public/3dmodels?limit=1 veri akışı TechShowcase3D'den buraya taşındı.
 * R3F viewer next/dynamic (ssr: false) arkasında; reduced-motion'da canvas
 * hiç yüklenmez, statik blueprint poster render edilir. Scan-line overlay
 * globals.css `scan-line` utility'sinden gelir (reduced-motion'da gizli).
 */
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box } from 'lucide-react'
import { BlueprintGrid, TechLabel } from '@/components/ui'
import { useReducedMotionGuard } from '@/hooks/use-motion'
import { useAppTranslations } from '@/hooks/useAppTranslations'

/* ─── 3D viewer: dynamic import, SSR off ─── */
const ModelViewer3D = dynamic(() => import('@/components/3DModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
})

interface Model3DItem {
  _id: string
  url: string
  name: string
  format: string
}

/* Statik poster — model yokken veya reduced-motion'da wireframe küp glyph'i */
function StaticPoster({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-sm border border-border bg-card">
        <Box size={40} className="text-primary" strokeWidth={1} aria-hidden="true" />
      </div>
      <TechLabel marker="tick">{label}</TechLabel>
    </div>
  )
}

export default function HeroModelViewer() {
  const reducedMotion = useReducedMotionGuard()
  const { t } = useAppTranslations('home')
  const [models, setModels] = useState<Model3DItem[]>([])
  const [loading, setLoading] = useState(true)

  /* Veri akışı korunur: /api/public/3dmodels?limit=1 */
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
        setLoading(false)
      }
    }
    fetchModels()
  }, [])

  const firstModel = models[0]
  const showLive = !reducedMotion && Boolean(firstModel)

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-border bg-card/60">
      {/* Blueprint zemin — viewer'ın altında */}
      <BlueprintGrid density="fine" opacity="subtle" major={false} />

      {/* İçerik */}
      <div className="absolute inset-0">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : showLive ? (
          <ModelViewer3D modelUrl={firstModel.url} format={firstModel.format} transparent />
        ) : (
          <StaticPoster label={t('hero.modelStatic')} />
        )}
      </div>

      {/* Scan-line overlay — dekoratif, reduced-motion'da gizli */}
      {showLive && <span className="scan-line" aria-hidden="true" />}

      {/* Köşe crosshair işaretleri */}
      <span aria-hidden="true" className="absolute left-2 top-2 font-mono text-[10px] text-muted-foreground">+</span>
      <span aria-hidden="true" className="absolute right-2 top-2 font-mono text-[10px] text-muted-foreground">+</span>
      <span aria-hidden="true" className="absolute bottom-2 left-2 font-mono text-[10px] text-muted-foreground">+</span>
      <span aria-hidden="true" className="absolute bottom-2 right-2 font-mono text-[10px] text-muted-foreground">+</span>

      {/* Alt spec çizgisi */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <TechLabel marker="crosshair">
          {showLive ? t('hero.modelLabel') : t('hero.modelStatic')}
        </TechLabel>
        {showLive && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('hero.modelHint')}
          </span>
        )}
      </div>
    </div>
  )
}
