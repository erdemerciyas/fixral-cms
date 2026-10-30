'use client'

/**
 * Panel → Site İçeriği: anasayfa hero'su, antet, bölüm başlıkları ve
 * görünürlüğü, disiplinler, süreç, teslimat, iç sayfa başlıkları ve hizmetler sayfasındaki
 * hizmet yolları.
 * Kaynak: GET/PUT/DELETE /api/admin/fx-content?key=site (ContentSettingRow 'fx-site').
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, ExternalLink, Loader2, RotateCcw, Save, Undo2 } from 'lucide-react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { FormPageSkeleton } from '@/components/admin/admin-skeletons'
import { FormActions } from '@/components/admin/form-section'
import { SaveStatus, useUnsavedChangesGuard } from '@/components/admin/fx-fields'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConfirm } from '@/hooks/use-confirm'
import type { FxSiteContent } from '@/content/fx-data'
import type { FxLocale } from '@/content/fixral'
import { CombosPanel, DeliveryPanel, HeroPanel, PagesPanel, ProcessPanel, SectionsPanel, type Edit } from './site-content-panels'

const API = '/api/admin/fx-content?key=site'

const TABS = [
  { id: 'hero', label: 'Anasayfa hero' },
  { id: 'sections', label: 'Bölümler' },
  { id: 'process', label: 'Süreç' },
  { id: 'delivery', label: 'Teslimat' },
  { id: 'pages', label: 'Sayfa başlıkları' },
  { id: 'combos', label: 'Hizmetler sayfası' },
] as const
type TabId = (typeof TABS)[number]['id']

interface SiteResponse { stored: unknown; resolved: FxSiteContent; defaults: FxSiteContent; updatedAt: string | null }

const filled = (...v: string[]) => v.some((s) => s.trim() !== '')

/** Tamamen boş liste satırlarını ayıklar */
function cleanForSave(f: FxSiteContent): FxSiteContent {
  const c = structuredClone(f)
  c.titleblock = c.titleblock.filter((r) => filled(r.label.tr, r.value))
  for (const l of ['tr'] as FxLocale[]) {
    c.process[l] = c.process[l].map((s) => ({ ...s, spec: s.spec.filter(([a, b]) => filled(a, b)) }))
    c.deliverables[l] = c.deliverables[l].filter(([a, b]) => filled(a, b))
  }
  c.combos.items = c.combos.items.filter((x) => x.services.length > 0)
  return c
}

function docsError(f: FxSiteContent): string | null {
  const ids = f.docs.map((d) => d.id.trim())
  if (ids.some((id) => !id)) return 'Her örnek belgenin bir kimliği (id) olmalı.'
  if (new Set(ids).size !== ids.length) return 'Örnek belge kimlikleri benzersiz olmalı.'
  return null
}

export default function SiteContentPage() {
  const { status } = useSession()
  const router = useRouter()
  const { confirm } = useConfirm()

  const [form, setForm] = useState<FxSiteContent | null>(null)
  const [defaults, setDefaults] = useState<FxSiteContent | null>(null)
  const [initial, setInitial] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [tab, setTab] = useState<TabId>('hero')
  const [lang, setLang] = useState<FxLocale>('tr')
  const [activeSlides, setActiveSlides] = useState<number | null>(null)

  const dirty = useMemo(() => !!form && JSON.stringify(form) !== initial, [form, initial])
  useUnsavedChangesGuard(dirty && !saving)

  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: 'no-store' })
      const data = (await res.json().catch(() => null)) as (SiteResponse & { error?: string }) | null
      if (!res.ok || !data?.resolved) throw new Error(data?.error || 'İçerik yüklenemedi')
      setForm(data.resolved)
      setDefaults(data.defaults)
      setInitial(JSON.stringify(data.resolved))
      setUpdatedAt(data.updatedAt)
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'İçerik yüklenemedi')
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/admin/login'); return }
    if (status !== 'authenticated') return
    void Promise.resolve().then(load)
    // Hero bilgisi için aktif slider sayısı (hata olursa gösterilmez)
    fetch('/api/admin/slider', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => { if (Array.isArray(d)) setActiveSlides(d.filter((s) => (s as { isActive?: boolean }).isActive).length) })
      .catch(() => {})
  }, [status, router, load])

  const edit: Edit = useCallback((fn) => {
    setForm((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }, [])

  const save = useCallback(async () => {
    if (!form || saving) return
    const err = docsError(form)
    if (err) { setTab('delivery'); toast.error(err); return }
    const value = cleanForSave(form)
    setSaving(true)
    try {
      const res = await fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }) })
      const data = (await res.json().catch(() => null)) as { updatedAt?: string; error?: string } | null
      if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi')
      setForm(value)
      setInitial(JSON.stringify(value))
      setUpdatedAt(data?.updatedAt ?? new Date().toISOString())
      toast.success('Site içeriği kaydedildi', { description: 'Değişiklikler sitede hemen görünür.' })
    } catch (e) {
      toast.error('Kaydedilemedi', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setSaving(false)
    }
  }, [form, saving])

  // Ctrl/Cmd + S ile kaydet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); void save() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  const resetToDefaults = async () => {
    const ok = await confirm({
      title: 'Varsayılanlara dönülsün mü?',
      description: 'Panelde kaydedilmiş tüm site içeriği (hero, bölümler, süreç, teslimat, sayfa başlıkları) silinir ve sitede varsayılan metinler gösterilir. Bu işlem geri alınamaz.',
      confirmText: 'Varsayılanlara dön',
    })
    if (!ok) return
    setResetting(true)
    try {
      const res = await fetch(API, { method: 'DELETE' })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(data?.error || 'Sıfırlanamadı')
      await load()
      toast.success('Varsayılan içeriğe dönüldü')
    } catch (e) {
      toast.error('Sıfırlanamadı', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setResetting(false)
    }
  }

  const discard = async () => {
    const ok = await confirm({ title: 'Değişiklikler geri alınsın mı?', description: 'Kaydedilmemiş tüm değişiklikler son kaydedilen hâline döner.', confirmText: 'Geri al' })
    if (ok && initial) setForm(JSON.parse(initial) as FxSiteContent)
  }

  if (status === 'loading' || (!form && !loadError)) return <FormPageSkeleton />

  if (!form || !defaults) {
    return (
      <AdminPageLayout title="Site İçeriği">
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 font-medium text-destructive"><AlertTriangle className="size-5" aria-hidden="true" />{loadError}</div>
          <Button variant="outline" onClick={() => { setLoadError(null); void load() }}>Tekrar dene</Button>
        </div>
      </AdminPageLayout>
    )
  }

  const panelProps = { form, defaults, edit, lang, setLang }

  return (
    <AdminPageLayout
      title="Site İçeriği"
      description="Anasayfa hero'su, bölüm başlıkları, süreç, teslimat ve sayfa başlıkları ."
    >
      <div className="space-y-2">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SaveStatus updatedAt={updatedAt} dirty={dirty} />
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/tr" target="_blank" rel="noopener noreferrer"><ExternalLink /> Sitede gör<span className="sr-only"> (yeni sekmede açılır)</span></a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void resetToDefaults()} disabled={resetting || saving}>
              {resetting ? <Loader2 className="animate-spin" /> : <RotateCcw />} Varsayılanlara dön
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={saving || !dirty}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />} {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          İpucu: Metin alanlarındaki soluk yazı varsayılan metindir; alanı boş bırakırsanız sitede o görünür. Kaydetme sonrası site hemen güncellenir.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList aria-label="Site içeriği bölümleri" className="min-w-max">
            {TABS.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
          </TabsList>
        </div>
        <TabsContent value="hero" className="mt-6"><HeroPanel {...panelProps} activeSlides={activeSlides} /></TabsContent>
        <TabsContent value="sections" className="mt-6"><SectionsPanel {...panelProps} /></TabsContent>
        <TabsContent value="process" className="mt-6"><ProcessPanel {...panelProps} /></TabsContent>
        <TabsContent value="delivery" className="mt-6"><DeliveryPanel {...panelProps} /></TabsContent>
        <TabsContent value="pages" className="mt-6"><PagesPanel {...panelProps} /></TabsContent>
        <TabsContent value="combos" className="mt-6"><CombosPanel {...panelProps} /></TabsContent>
      </Tabs>

      {dirty && (
        <FormActions sticky className="sm:justify-between">
          <p className="text-sm font-medium text-warning">Kaydedilmemiş değişiklikler var</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => void discard()} disabled={saving}><Undo2 /> Değişiklikleri geri al</Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />} {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        </FormActions>
      )}
    </AdminPageLayout>
  )
}
