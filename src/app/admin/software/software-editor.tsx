'use client'

/**
 * Yazılım düzenleme penceresi: genel alanlar + dil başına metinler.
 * Taslak üzerinde çalışır; "Uygula" ile listeye yazılır.
 */
import * as React from 'react'
import { Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChipsInput, LOCALE_LABEL, PairRows, TextField } from '@/components/admin/fx-fields'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import { FX_LOCALES, emptySwText, type FxSoftware } from '@/content/fx-data'
import type { FxLocale, SoftwareText, SoftwareViz } from '@/content/fixral'

export interface ServiceOption { value: string; label: string; slug: string }

export const VIZ_INFO: Record<SoftwareViz, { label: string; desc: string }> = {
  split: { label: '3D bölme sahnesi', desc: 'Model parçalara ayrılıp birleşir (ör. 3D Splitter).' },
  toolpath: { label: 'Takım yolu animasyonu', desc: 'Freze takım yolu çizilir (ör. Router Studio).' },
  gauge: { label: 'Yuvarlak gösterge', desc: 'Gösterge ibresi döner (ör. OBD-II ekranı).' },
}
const VIZ_KEYS: SoftwareViz[] = ['split', 'toolpath', 'gauge']

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const URL_RE = /^https?:\/\/\S+$/i

export function slugify(s: string) {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', ñ: 'n', á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }
  return s.toLocaleLowerCase('tr').replace(/[çğıöşüñáéíóú]/g, (c) => map[c] ?? c).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export const emptySoftware = (order: number): FxSoftware => ({
  slug: '', name: '', version: '', viz: 'toolpath', url: '', repo: '', services: [], isActive: true, order,
  text: { tr: emptySwText() },
})

export type SoftwareErrors = Partial<Record<'slug' | 'name' | 'repo' | 'url', string>>

export function validateSoftware(sw: FxSoftware, otherSlugs: string[]): SoftwareErrors {
  const e: SoftwareErrors = {}
  const slug = sw.slug.trim()
  if (!slug) e.slug = 'Slug gerekli.'
  else if (slug.length < 2 || slug.length > 80) e.slug = 'Slug 2–80 karakter olmalı.'
  else if (!SLUG_RE.test(slug)) e.slug = 'Yalnız küçük harf, rakam ve tek tire (ör. router-studio).'
  else if (otherSlugs.includes(slug)) e.slug = 'Bu slug başka bir yazılımda kullanılıyor.'
  if (!sw.name.trim()) e.name = 'Ad gerekli.'
  if (!sw.repo.trim()) e.repo = 'Depo adresi gerekli (sitede "GitHub" düğmesi her zaman görünür).'
  else if (!URL_RE.test(sw.repo.trim())) e.repo = 'https:// ile başlayan bir adres girin.'
  if (sw.url && sw.url.trim() && !URL_RE.test(sw.url.trim())) e.url = 'https:// ile başlayan bir adres girin.'
  return e
}

interface EditorProps {
  open: boolean
  initial: FxSoftware | null
  isNew: boolean
  otherSlugs: string[]
  catalogSlugs: string[]
  services: ServiceOption[]
  servicesLoading: boolean
  onClose: () => void
  onApply: (sw: FxSoftware, andSave: boolean) => void
}

export function SoftwareEditor({ open, initial, isNew, otherSlugs, catalogSlugs, services, servicesLoading, onClose, onApply }: EditorProps) {
  const { confirm } = useConfirm()
  const [draft, setDraft] = React.useState<FxSoftware | null>(initial)
  const [tab, setTab] = React.useState<'general' | FxLocale>('general')
  const [showErrors, setShowErrors] = React.useState(false)
  const [src, setSrc] = React.useState(initial)
  if (src !== initial) {
    // Yeni kayıt açıldı: taslağı ve sekmeyi sıfırla
    setSrc(initial)
    setDraft(initial)
    setTab('general')
    setShowErrors(false)
  }

  const errors = React.useMemo(() => (draft ? validateSoftware(draft, otherSlugs) : {}), [draft, otherSlugs])
  const hasErrors = Object.keys(errors).length > 0
  const changed = !!draft && JSON.stringify(draft) !== JSON.stringify(initial)
  const err = (k: keyof SoftwareErrors) => (showErrors || (k === 'slug' && draft?.slug) ? errors[k] ?? null : null)

  const set = <K extends keyof FxSoftware>(k: K, v: FxSoftware[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))
  const setText = <K extends keyof SoftwareText>(l: FxLocale, k: K, v: SoftwareText[K]) =>
    setDraft((d) => (d ? { ...d, text: { ...d.text, [l]: { ...d.text[l], [k]: v } } } : d))

  const requestClose = async () => {
    if (changed) {
      const ok = await confirm({ title: 'Değişiklikler uygulanmadı', description: 'Bu penceredeki değişiklikler listeye aktarılmadı. Kapatılırsa kaybolur.', confirmText: 'Kapat', cancelText: 'Düzenlemeye dön' })
      if (!ok) return
    }
    onClose()
  }

  const apply = (andSave: boolean) => {
    if (!draft) return
    if (hasErrors) { setShowErrors(true); setTab('general'); return }
    onApply({ ...draft, slug: draft.slug.trim(), name: draft.name.trim(), repo: draft.repo.trim(), url: (draft.url ?? '').trim(), version: (draft.version ?? '').trim() }, andSave)
  }

  const isCatalog = !!draft && catalogSlugs.includes(draft.slug.trim())
  const knownValues = services.map((s) => s.value)
  const unknown = draft ? draft.services.filter((v) => !knownValues.includes(v)) : []
  const toggleService = (v: string, on: boolean) => draft && set('services', on ? [...draft.services, v] : draft.services.filter((x) => x !== v))

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) void requestClose() }}>
      <DialogContent className="max-w-4xl gap-0 p-0" onInteractOutside={(e) => e.preventDefault()}>
        {draft && (
          <form onSubmit={(e) => { e.preventDefault(); apply(false) }} noValidate className="flex min-h-0 flex-col">
            <DialogHeader className="border-b px-6 pb-4 pt-6">
              <DialogTitle>{isNew ? 'Yeni yazılım' : `Yazılımı düzenle: ${initial?.name || initial?.slug}`}</DialogTitle>
              <DialogDescription>Genel bilgiler ve iki dildeki sayfa metinleri. Değişiklikler &quot;Uygula&quot; ile listeye aktarılır, &quot;Kaydet&quot; ile siteye yayınlanır.</DialogDescription>
            </DialogHeader>

            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="px-6 pb-6">
              <div className="-mx-1 overflow-x-auto px-1 pt-2">
                <TabsList aria-label="Yazılım bilgileri" className="min-w-max">
                  <TabsTrigger value="general">
                    Genel
                    {showErrors && hasErrors && <span className="ml-1.5 size-1.5 rounded-full bg-destructive" aria-label="hatalı alan var" />}
                  </TabsTrigger>
                  {FX_LOCALES.map((l) => (
                    <TabsTrigger key={l} value={l} className="gap-2">
                      <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] uppercase text-muted-foreground">{l}</span>
                      {LOCALE_LABEL[l]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="general" className="mt-5 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Ad" required value={draft.name} onChange={(v) => set('name', v)} placeholder="Router Studio" invalid={err('name')} />
                  <div className="space-y-1.5">
                    <TextField
                      label="Slug (adres)"
                      required
                      mono
                      value={draft.slug}
                      onChange={(v) => set('slug', v.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="router-studio"
                      invalid={err('slug')}
                      hint={<>Sayfa adresi: <span className="font-mono">/tr/software/{draft.slug || '…'}</span></>}
                    />
                    {draft.name.trim() && draft.slug !== slugify(draft.name) && (
                      <Button type="button" variant="link" size="sm" className="h-auto px-0 text-xs" onClick={() => set('slug', slugify(draft.name))}>
                        <Wand2 /> Addan oluştur ({slugify(draft.name) || '—'})
                      </Button>
                    )}
                  </div>
                  <TextField label="Sürüm" value={draft.version ?? ''} onChange={(v) => set('version', v)} placeholder="2.0.0" hint="İsteğe bağlı; durum satırında “v2.0.0” olarak görünür." />
                  <SwitchRow label="Sitede göster" desc="Kapalıyken yazılım listede ve sitede görünmez." checked={draft.isActive} onChange={(v) => set('isActive', v)} />
                  <TextField label="Canlı uygulama adresi" type="url" inputMode="url" value={draft.url ?? ''} onChange={(v) => set('url', v)} placeholder="https://…" invalid={err('url')} hint="İsteğe bağlı; doluysa “Uygulamayı aç” düğmesi görünür." />
                  <TextField label="Kaynak kod deposu (GitHub)" required type="url" inputMode="url" value={draft.repo} onChange={(v) => set('repo', v)} placeholder="https://github.com/…" invalid={err('repo')} />
                </div>

                <fieldset>
                  <legend className="mb-1 text-sm font-medium">Görsel (3D sahne)</legend>
                  <p className="mb-3 text-xs text-muted-foreground">Kartta ve ürün sayfasında oynayan animasyon.</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {VIZ_KEYS.map((v) => (
                      <label key={v} className={cn('flex cursor-pointer flex-col gap-1 rounded-md border border-border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring')}>
                        <span className="flex items-center gap-2">
                          <input type="radio" name="sw-viz" value={v} checked={draft.viz === v} onChange={() => set('viz', v)} className="accent-[hsl(var(--primary))]" />
                          <span className="text-sm font-medium">{VIZ_INFO[v].label}</span>
                          <span className="ml-auto font-mono text-[11px] text-muted-foreground">{v}</span>
                        </span>
                        <span className="pl-6 text-xs text-muted-foreground">{VIZ_INFO[v].desc}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-1 text-sm font-medium">İlgili hizmetler</legend>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Ürün sayfasında &quot;İlgili hizmetler&quot; olarak listelenir.
                    {isCatalog && ' Hiçbiri seçilmezse varsayılan katalogdaki hizmetler kullanılır.'}
                  </p>
                  {servicesLoading ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Hizmetler yükleniyor…</p>
                  ) : services.length === 0 && unknown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Hizmet listesi alınamadı.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {services.map((s) => (
                        <ServiceCheck key={s.value} label={s.label} sub={s.slug} checked={draft.services.includes(s.value)} onChange={(on) => toggleService(s.value, on)} />
                      ))}
                      {unknown.map((v) => (
                        <ServiceCheck key={v} label={v} sub="sitede bulunamadı" warn checked onChange={(on) => toggleService(v, on)} />
                      ))}
                    </div>
                  )}
                </fieldset>
              </TabsContent>

              {FX_LOCALES.map((l) => {
                const t = draft.text[l]
                return (
                  <TabsContent key={l} value={l} lang={l} className="mt-5 space-y-6">
                    {isCatalog && (
                      <p className="rounded-md border border-info/30 bg-info/5 px-3 py-2 text-xs text-muted-foreground">
                        Bu yazılım varsayılan katalogda da var: boş bıraktığınız metinler ve tamamen boş listeler sitede varsayılan içerikle doldurulur.
                      </p>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextField label="Üst etiket (kicker)" value={t.kicker} onChange={(v) => setText(l, 'kicker', v)} placeholder="CNC · CAM · GRBL" />
                      <TextField label="Durum" value={t.status} onChange={(v) => setText(l, 'status', v)} placeholder="Canlı · ücretsiz" />
                      <TextField className="md:col-span-2" label="Kısa tanım (tagline)" value={t.tagline} onChange={(v) => setText(l, 'tagline', v)} hint="Kartlarda ve sayfa başlığının altında görünen tek cümle." />
                      <TextField className="md:col-span-2" label="Giriş metni (lede)" multiline rows={4} value={t.lede} onChange={(v) => setText(l, 'lede', v)} />
                    </div>
                    <ChipsInput label="Etiketler (chips)" values={t.chips} onChange={(v) => setText(l, 'chips', v)} placeholder="Etiket yazıp Enter'a basın" hint="Enter ya da virgülle ekleyin; Backspace son etiketi siler." />
                    <PairRows legend="Teknik bilgiler (facts)" labels={['Etiket', 'Değer']} placeholders={['Girdi', 'STL · OBJ']} rows={t.facts} onChange={(r) => setText(l, 'facts', r)} />
                    <PairRows legend="Özellikler (features)" labels={['Başlık', 'Metin']} multilineSecond rows={t.features} onChange={(r) => setText(l, 'features', r)} addLabel="Özellik ekle" />
                    <PairRows legend="Akış adımları (flow)" labels={['Adım', 'Açıklama']} placeholders={['Tasarla', 'Şekil, yazı, DXF / SVG']} rows={t.flow} onChange={(r) => setText(l, 'flow', r)} addLabel="Adım ekle" />
                  </TabsContent>
                )
              })}
            </Tabs>

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t bg-background px-6 py-3 sm:flex-row sm:items-center sm:justify-end">
              {showErrors && hasErrors && <p role="alert" className="text-sm text-destructive sm:mr-auto">Genel sekmesinde düzeltilmesi gereken alanlar var.</p>}
              <Button type="button" variant="ghost" onClick={() => void requestClose()}>Vazgeç</Button>
              <Button type="submit" variant="outline">Uygula</Button>
              <Button type="button" onClick={() => apply(true)}>Uygula ve kaydet</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SwitchRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = React.useId()
  return (
    <div className="flex items-start gap-3 self-end rounded-md border border-border p-3">
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={`${id}-d`} className="mt-0.5" />
      <div>
        <Label htmlFor={id} className="cursor-pointer">{label}</Label>
        <p id={`${id}-d`} className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function ServiceCheck({ label, sub, checked, onChange, warn }: { label: string; sub: string; checked: boolean; onChange: (on: boolean) => void; warn?: boolean }) {
  const id = React.useId()
  return (
    <div className={cn('flex items-start gap-2.5 rounded-md border border-border p-2.5', checked && 'border-primary/50 bg-primary/5')}>
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <Label htmlFor={id} className="min-w-0 cursor-pointer leading-tight">
        <span className="block truncate">{label}</span>
        <span className={cn('block truncate font-mono text-[11px] font-normal', warn ? 'text-warning' : 'text-muted-foreground')}>{sub}</span>
      </Label>
    </div>
  )
}
