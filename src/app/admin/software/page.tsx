'use client'

/**
 * Panel → Yazılımlar: sitedeki yazılım ürünleri (liste, sıra, aktiflik, içerik).
 * Kaynak: GET/PUT/DELETE /api/admin/fx-content?key=software (ContentSettingRow 'fx-software').
 * Kayıtta tüm liste `{ items }` olarak gönderilir; sıra listedeki konumdan gelir.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, Copy, ExternalLink, GitBranch, Loader2, Pencil, Plus, RotateCcw, Save, Trash2, Undo2 } from 'lucide-react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { ListPageSkeleton } from '@/components/admin/admin-skeletons'
import { FormActions } from '@/components/admin/form-section'
import { RowActions, SaveStatus, moveItem, useUnsavedChangesGuard } from '@/components/admin/fx-fields'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import type { FxService, FxSoftware } from '@/content/fx-data'
import { SoftwareEditor, VIZ_INFO, emptySoftware, validateSoftware, type ServiceOption } from './software-editor'

const API = '/api/admin/fx-content?key=software'

interface SoftwareResponse { stored: unknown; resolved: FxSoftware[] | { items: FxSoftware[] }; defaults: FxSoftware[]; updatedAt: string | null; error?: string }

const asItems = (v: SoftwareResponse['resolved'] | undefined): FxSoftware[] => (Array.isArray(v) ? v : v?.items ?? [])

/** Formda tutarlı karşılaştırma için alanları tamamlar */
const normalize = (sw: FxSoftware): FxSoftware => ({ ...sw, version: sw.version ?? '', url: sw.url ?? '', services: [...(sw.services ?? [])] })

/** Sırayı konumdan yazar; boş url/version '' olarak gider (katalog varsayılanına düşmesin) */
const toPayload = (items: FxSoftware[]) => items.map((sw, i) => ({ ...normalize(sw), order: i + 1 }))

export default function SoftwareAdminPage() {
  const { status } = useSession()
  const router = useRouter()
  const { confirm } = useConfirm()

  const [items, setItems] = useState<FxSoftware[] | null>(null)
  const [catalogSlugs, setCatalogSlugs] = useState<string[]>([])
  const [initial, setInitial] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  /** Düzenlenen kaydın konumu; -1 yeni kayıt, null kapalı */
  const [editing, setEditing] = useState<number | null>(null)
  const [newDraft, setNewDraft] = useState<FxSoftware | null>(null)

  const dirty = useMemo(() => !!items && JSON.stringify(items) !== initial, [items, initial])
  useUnsavedChangesGuard(dirty && !saving)

  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: 'no-store' })
      const data = (await res.json().catch(() => null)) as SoftwareResponse | null
      if (!res.ok || !data) throw new Error(data?.error || 'Yazılımlar yüklenemedi')
      const list = asItems(data.resolved).map(normalize)
      setItems(list)
      setInitial(JSON.stringify(list))
      setCatalogSlugs((data.defaults ?? []).map((d) => d.slug))
      setUpdatedAt(data.updatedAt)
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Yazılımlar yüklenemedi')
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/admin/login'); return }
    if (status !== 'authenticated') return
    void Promise.resolve().then(load)
    fetch('/api/public/fx-data', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { services?: FxService[] } | null) => {
        setServices((d?.services ?? []).map((s) => ({ value: s.key, label: s.text?.tr?.name || s.slug, slug: s.slug })))
      })
      .catch(() => {})
      .finally(() => setServicesLoading(false))
  }, [status, router, load])

  const slugErrors = useMemo(() => {
    if (!items) return [] as (string | null)[]
    return items.map((sw, i) => {
      const e = validateSoftware(sw, items.filter((_, j) => j !== i).map((x) => x.slug.trim()))
      return e.slug ?? e.name ?? e.repo ?? e.url ?? null
    })
  }, [items])
  const invalidCount = slugErrors.filter(Boolean).length

  const persist = useCallback(async (list: FxSoftware[]) => {
    const bad = list.findIndex((sw, i) => Object.keys(validateSoftware(sw, list.filter((_, j) => j !== i).map((x) => x.slug.trim()))).length > 0)
    if (bad !== -1) {
      toast.error('Kaydedilemedi', { description: `"${list[bad].name || list[bad].slug || `#${bad + 1}`}" kaydında eksik ya da hatalı alan var.` })
      return false
    }
    setSaving(true)
    try {
      const payload = toPayload(list)
      const res = await fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: { items: payload } }) })
      const data = (await res.json().catch(() => null)) as { updatedAt?: string; error?: string } | null
      if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi')
      setItems(payload)
      setInitial(JSON.stringify(payload))
      setUpdatedAt(data?.updatedAt ?? new Date().toISOString())
      toast.success('Yazılımlar kaydedildi', { description: 'Değişiklikler sitede hemen görünür.' })
      return true
    } catch (e) {
      toast.error('Kaydedilemedi', { description: e instanceof Error ? e.message : undefined })
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const save = useCallback(() => { if (items && !saving) void persist(items) }, [items, saving, persist])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing === null && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save, editing])

  if (status === 'loading' || (!items && !loadError)) return <ListPageSkeleton />

  if (!items) {
    return (
      <AdminPageLayout title="Yazılımlar">
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 font-medium text-destructive"><AlertTriangle className="size-5" aria-hidden="true" />{loadError}</div>
          <Button variant="outline" onClick={() => { setLoadError(null); void load() }}>Tekrar dene</Button>
        </div>
      </AdminPageLayout>
    )
  }

  const update = (fn: (list: FxSoftware[]) => FxSoftware[]) => setItems((prev) => (prev ? fn(prev) : prev))

  const openNew = () => { setNewDraft(emptySoftware(items.length + 1)); setEditing(-1) }

  const duplicate = (i: number) => {
    const src = items[i]
    const taken = new Set(items.map((x) => x.slug))
    const base = `${src.slug || 'yazilim'}-kopya`.slice(0, 74)
    let slug = base
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
    const copy: FxSoftware = { ...structuredClone(src), slug, name: `${src.name} (kopya)`, isActive: false }
    update((l) => [...l.slice(0, i + 1), copy, ...l.slice(i + 1)])
    toast.info('Kopya oluşturuldu', { description: 'Kopya pasif olarak eklendi; düzenleyip etkinleştirin ve kaydedin.' })
  }

  const remove = async (i: number) => {
    const sw = items[i]
    const ok = await confirm({ title: `"${sw.name || sw.slug}" silinsin mi?`, description: 'Yazılım listeden kaldırılır. Kaydettiğinizde sitedeki ürün sayfası da kaldırılır.', confirmText: 'Sil' })
    if (ok) update((l) => l.filter((_, j) => j !== i))
  }

  const resetToDefaults = async () => {
    const ok = await confirm({
      title: 'Varsayılan yazılımlara dönülsün mü?',
      description: 'Panelde kaydedilmiş yazılım listesi silinir; sitede varsayılan katalog (3D Splitter, Router Studio, ESP32-S3 OBD-II) gösterilir. Bu işlem geri alınamaz.',
      confirmText: 'Varsayılanlara dön',
    })
    if (!ok) return
    setResetting(true)
    try {
      const res = await fetch(API, { method: 'DELETE' })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(data?.error || 'Sıfırlanamadı')
      await load()
      toast.success('Varsayılan yazılımlara dönüldü')
    } catch (e) {
      toast.error('Sıfırlanamadı', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setResetting(false)
    }
  }

  const discard = async () => {
    const ok = await confirm({ title: 'Değişiklikler geri alınsın mı?', description: 'Kaydedilmemiş tüm değişiklikler son kaydedilen hâline döner.', confirmText: 'Geri al' })
    if (ok && initial) setItems(JSON.parse(initial) as FxSoftware[])
  }

  const applyEdit = (sw: FxSoftware, andSave: boolean) => {
    const next = editing === -1 ? [...items, sw] : items.map((x, j) => (j === editing ? sw : x))
    setItems(next)
    setEditing(null)
    setNewDraft(null)
    if (andSave) void persist(next)
    else toast.message('Değişiklik listeye aktarıldı', { description: 'Sitede görünmesi için Kaydet’e basın.' })
  }

  const editingItem = editing === null ? null : editing === -1 ? newDraft : items[editing] ?? null
  const otherSlugs = items.filter((_, j) => j !== editing).map((x) => x.slug.trim())

  return (
    <AdminPageLayout
      title="Yazılımlar"
      description="Sitedeki yazılım ürünleri: sıra, görünürlük ve iki dildeki ürün sayfası içeriği."
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SaveStatus updatedAt={updatedAt} dirty={dirty} storedLabel="Henüz panelden kaydedilmedi; sitede varsayılan katalog görünüyor." />
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <a href="/tr/software" target="_blank" rel="noopener noreferrer"><ExternalLink /> Sitede gör<span className="sr-only"> (yeni sekmede açılır)</span></a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void resetToDefaults()} disabled={resetting || saving}>
            {resetting ? <Loader2 className="animate-spin" /> : <RotateCcw />} Varsayılanlara dön
          </Button>
          <Button variant="outline" size="sm" onClick={openNew}><Plus /> Yeni yazılım</Button>
          <Button size="sm" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />} {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {invalidCount > 0 && (
        <p role="alert" className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> {invalidCount} kayıtta düzeltilmesi gereken alan var; kaydetmeden önce düzenleyin.
        </p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Listede yazılım yok. Boş listeyi kaydederseniz sitede varsayılan katalog görünür.</p>
          <Button onClick={openNew}><Plus /> Yeni yazılım</Button>
        </div>
      ) : (
        <ol className="space-y-3" aria-label="Yazılımlar (site sırasıyla)">
          {items.map((sw, i) => (
            <SoftwareRow
              key={i}
              sw={sw}
              index={i}
              count={items.length}
              error={slugErrors[i]}
              servicesLabel={sw.services.map((k) => services.find((s) => s.value === k)?.label ?? k).join(', ')}
              onToggle={(v) => update((l) => l.map((x, j) => (j === i ? { ...x, isActive: v } : x)))}
              onMove={(d) => update((l) => moveItem(l, i, d))}
              onEdit={() => setEditing(i)}
              onDuplicate={() => duplicate(i)}
              onRemove={() => void remove(i)}
            />
          ))}
        </ol>
      )}

      {dirty && (
        <FormActions sticky className="sm:justify-between">
          <p className="text-sm font-medium text-warning">Kaydedilmemiş değişiklikler var</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => void discard()} disabled={saving}><Undo2 /> Değişiklikleri geri al</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />} {saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
          </div>
        </FormActions>
      )}

      <SoftwareEditor
        open={editing !== null}
        initial={editingItem}
        isNew={editing === -1}
        otherSlugs={otherSlugs}
        catalogSlugs={catalogSlugs}
        services={services}
        servicesLoading={servicesLoading}
        onClose={() => { setEditing(null); setNewDraft(null) }}
        onApply={applyEdit}
      />
    </AdminPageLayout>
  )
}

interface RowProps {
  sw: FxSoftware
  index: number
  count: number
  error: string | null
  servicesLabel: string
  onToggle: (v: boolean) => void
  onMove: (d: -1 | 1) => void
  onEdit: () => void
  onDuplicate: () => void
  onRemove: () => void
}

function SoftwareRow({ sw, index, count, error, servicesLabel, onToggle, onMove, onEdit, onDuplicate, onRemove }: RowProps) {
  const name = sw.name || sw.slug || `Yazılım ${index + 1}`
  const switchId = `sw-active-${index}`
  return (
    <li className={cn('rounded-xl border bg-card p-4 md:p-5', !sw.isActive && 'border-dashed', error && 'border-destructive/50')}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted font-mono text-xs font-semibold text-muted-foreground" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">{name}</h2>
              {sw.version && <Badge variant="outline" className="font-mono">v{sw.version}</Badge>}
              <Badge variant="info">{VIZ_INFO[sw.viz]?.label ?? sw.viz}</Badge>
              {!sw.isActive && <Badge variant="warning">Pasif</Badge>}
            </div>
            <p className="truncate font-mono text-xs text-muted-foreground">/software/{sw.slug || '—'}</p>
            <p className="line-clamp-1 text-sm text-muted-foreground">{sw.text.tr.tagline || <span className="italic">Kısa tanım yok</span>}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {sw.url && <a href={sw.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground hover:underline"><ExternalLink className="size-3" aria-hidden="true" /> Uygulama<span className="sr-only"> (yeni sekmede açılır)</span></a>}
              {sw.repo && <a href={sw.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground hover:underline"><GitBranch className="size-3" aria-hidden="true" /> Depo<span className="sr-only"> (yeni sekmede açılır)</span></a>}
              {servicesLabel && <span className="truncate">Hizmetler: {servicesLabel}</span>}
            </div>
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t pt-3 lg:border-0 lg:pt-0">
          <div className="mr-2 flex items-center gap-2">
            <Switch id={switchId} checked={sw.isActive} onCheckedChange={onToggle} />
            <label htmlFor={switchId} className="cursor-pointer text-sm">Aktif<span className="sr-only">: {name}</span></label>
          </div>
          <RowActions index={index} count={count} name={name} onMove={onMove} />
          <Button variant="outline" size="sm" onClick={onEdit} aria-label={`${name}: düzenle`}><Pencil /> Düzenle</Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate} aria-label={`${name}: çoğalt`}><Copy /> Çoğalt</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={onRemove} aria-label={`${name}: sil`}><Trash2 /></Button>
        </div>
      </div>
    </li>
  )
}
