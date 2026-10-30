'use client'

/**
 * Panel → FX 3D: Cults3D'deki FIXRAL modelleri.
 * Modeller Cults3D GraphQL API'sinden canlı okunur (düzenleme Cults3D'de yapılır);
 * burada yalnızca sitede hangi modellerin görüneceği seçilir ve önbellek yenilenir.
 * Kaynak: GET/PUT/POST /api/admin/fx-3d (ContentSettingRow 'fx-3d').
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, Download, ExternalLink, Eye, Heart, Loader2, RefreshCw, Save, Search, Undo2 } from 'lucide-react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { ListPageSkeleton } from '@/components/admin/admin-skeletons'
import { FormActions } from '@/components/admin/form-section'
import { SaveStatus, useUnsavedChangesGuard } from '@/components/admin/fx-fields'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import type { Fx3dModel } from '@/lib/cults3d'

const API = '/api/admin/fx-3d'

interface Fx3dResponse {
  configured: boolean
  nick: string | null
  profileUrl: string
  models: Fx3dModel[]
  hidden: string[]
  updatedAt: string | null
  error?: string
}

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x))

export default function Fx3dAdminPage() {
  const { status } = useSession()
  const router = useRouter()
  const { confirm } = useConfirm()

  const [data, setData] = useState<Fx3dResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')

  const initial = useMemo(() => new Set(data?.hidden ?? []), [data])
  const dirty = !!data && !sameSet(hidden, initial)
  useUnsavedChangesGuard(dirty && !saving)

  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: 'no-store' })
      const json = (await res.json().catch(() => null)) as Fx3dResponse | null
      if (!res.ok || !json) throw new Error((json as { error?: string } | null)?.error || 'FX 3D verisi yüklenemedi')
      setData(json)
      setHidden(new Set(json.hidden))
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'FX 3D verisi yüklenemedi')
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/admin/login'); return }
    if (status === 'authenticated') void Promise.resolve().then(load)
  }, [status, router, load])

  const save = useCallback(async () => {
    if (!data || saving) return
    setSaving(true)
    try {
      const res = await fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hidden: [...hidden] }) })
      const json = (await res.json().catch(() => null)) as { updatedAt?: string; error?: string } | null
      if (!res.ok) throw new Error(json?.error || 'Kaydedilemedi')
      setData({ ...data, hidden: [...hidden], updatedAt: json?.updatedAt ?? new Date().toISOString() })
      toast.success('Görünürlük kaydedildi', { description: 'Değişiklikler sitede hemen görünür.' })
    } catch (e) {
      toast.error('Kaydedilemedi', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setSaving(false)
    }
  }, [data, hidden, saving])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); void save() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  const refresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(API, { method: 'POST' })
      if (!res.ok) throw new Error('Önbellek yenilenemedi')
      await load()
      toast.success('Cults3D verisi yenilendi', { description: 'Sitedeki liste ve detay sayfaları güncel veriyle yeniden oluşturulur.' })
    } catch (e) {
      toast.error('Yenilenemedi', { description: e instanceof Error ? e.message : undefined })
    } finally {
      setRefreshing(false)
    }
  }

  const discard = async () => {
    const ok = await confirm({ title: 'Değişiklikler geri alınsın mı?', description: 'Görünürlük seçimleri son kaydedilen hâline döner.', confirmText: 'Geri al' })
    if (ok) setHidden(new Set(initial))
  }

  const models = useMemo(() => data?.models ?? [], [data])
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return q ? models.filter((m) => `${m.name} ${m.category} ${m.tags.join(' ')}`.toLocaleLowerCase('tr').includes(q)) : models
  }, [models, query])

  if (status === 'loading' || (!data && !loadError)) return <ListPageSkeleton />

  if (!data) {
    return (
      <AdminPageLayout title="FX 3D">
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 font-medium text-destructive"><AlertTriangle className="size-5" aria-hidden="true" />{loadError}</div>
          <Button variant="outline" onClick={() => { setLoadError(null); void load() }}>Tekrar dene</Button>
        </div>
      </AdminPageLayout>
    )
  }

  const shownCount = models.filter((m) => !hidden.has(m.slug)).length
  const setAll = (show: boolean) => setHidden(show ? new Set() : new Set(models.map((m) => m.slug)))

  return (
    <AdminPageLayout
      title="FX 3D"
      description="Cults3D'deki 3D modelleriniz. İçerik ve fiyatlar Cults3D'den otomatik gelir; burada sitede hangi modellerin listeleneceğini seçersiniz."
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {data.error ? (
              <Badge variant="danger">Bağlantı hatası</Badge>
            ) : (
              <Badge variant="success">Cults3D bağlı</Badge>
            )}
            {data.nick && <span className="font-mono text-xs text-muted-foreground">@{data.nick}</span>}
            {!data.error && <span className="text-muted-foreground">{models.length} model · sitede {shownCount}</span>}
          </div>
          <SaveStatus updatedAt={data.updatedAt} dirty={dirty} storedLabel="Henüz görünürlük kaydı yok; tüm modeller sitede listelenir." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <a href="/tr/fx-3d" target="_blank" rel="noopener noreferrer"><ExternalLink /> Sitede gör<span className="sr-only"> (yeni sekmede açılır)</span></a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={data.profileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink /> Cults3D profili<span className="sr-only"> (yeni sekmede açılır)</span></a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={refreshing || !data.configured}>
            {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />} Önbelleği yenile
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />} {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {data.error && (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{data.error}{!data.configured && ' Vercel ve .env.local dosyasına ekleyip sunucuyu yeniden başlatın.'}</span>
        </p>
      )}

      {models.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad, kategori ya da etiket" aria-label="Modellerde ara" className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAll(true)}>Tümünü göster</Button>
            <Button variant="ghost" size="sm" onClick={() => setAll(false)}>Tümünü gizle</Button>
          </div>
        </div>
      )}

      {!data.error && models.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Cults3D hesabında yayınlanmış model yok.</div>
      ) : visible.length === 0 && models.length > 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Aramayla eşleşen model yok.</div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3" aria-label="Cults3D modelleri">
          {visible.map((m) => (
            <ModelRow
              key={m.slug}
              model={m}
              shown={!hidden.has(m.slug)}
              onToggle={(show) => setHidden((prev) => {
                const next = new Set(prev)
                if (show) next.delete(m.slug)
                else next.add(m.slug)
                return next
              })}
            />
          ))}
        </ul>
      )}

      {dirty && (
        <FormActions sticky className="sm:justify-between">
          <p className="text-sm font-medium text-warning">Kaydedilmemiş değişiklikler var</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => void discard()} disabled={saving}><Undo2 /> Değişiklikleri geri al</Button>
            <Button onClick={() => void save()} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />} {saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
          </div>
        </FormActions>
      )}
    </AdminPageLayout>
  )
}

function ModelRow({ model: m, shown, onToggle }: { model: Fx3dModel; shown: boolean; onToggle: (show: boolean) => void }) {
  const switchId = `fx3d-${m.slug}`
  return (
    <li className={cn('flex gap-4 rounded-xl border bg-card p-3', !shown && 'border-dashed opacity-70')}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {m.image && <Image src={m.image} alt="" fill sizes="80px" className="object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug">{m.name}</h2>
          <a href={m.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground" aria-label={`${m.name}: Cults3D'de aç (yeni sekmede açılır)`}>
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={m.price ? 'outline' : 'info'} className="font-mono">{m.price ?? 'Ücretsiz'}</Badge>
          {m.discount ? <Badge variant="warning">-%{m.discount}</Badge> : null}
          {m.category && <span className="text-xs text-muted-foreground">{m.category}</span>}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
            <span className="inline-flex items-center gap-1" title="Görüntülenme"><Eye className="size-3" aria-hidden="true" />{m.views}</span>
            <span className="inline-flex items-center gap-1" title="Beğeni"><Heart className="size-3" aria-hidden="true" />{m.likes}</span>
            <span className="inline-flex items-center gap-1" title="İndirme / satış"><Download className="size-3" aria-hidden="true" />{m.downloads}</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch id={switchId} checked={shown} onCheckedChange={onToggle} />
            <label htmlFor={switchId} className="cursor-pointer text-xs">Sitede<span className="sr-only">: {m.name}</span></label>
          </div>
        </div>
      </div>
    </li>
  )
}
