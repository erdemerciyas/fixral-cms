'use client'

/**
 * Site İçeriği sayfasının sekme panelleri. Her panel `FxSiteContent`
 * nesnesinin bir parçasını düzenler; değişiklikler `edit(fn)` ile
 * üst bileşendeki forma yazılır.
 */
import * as React from 'react'
import Link from 'next/link'
import { ExternalLink, FileCode2, GalleryHorizontal, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormSection } from '@/components/admin/form-section'
import { LangTabs, PairRows, RowActions, TextField, moveItem } from '@/components/admin/fx-fields'
import { cn } from '@/lib/utils'
import type { FxDoc, FxHeroText, FxHomeSection, FxPageKey, FxSectionText, FxSiteContent } from '@/content/fx-data'
import type { DisciplineId, DocLine, FxLocale } from '@/content/fixral'

export type Edit = (fn: (draft: FxSiteContent) => void) => void

export interface PanelProps {
  form: FxSiteContent
  defaults: FxSiteContent
  edit: Edit
  lang: FxLocale
  setLang: (l: FxLocale) => void
}

/* ---------------------------------------------------------------- Etiketler */

type TextSection = Exclude<FxHomeSection, 'strip'>

export const SECTION_INFO: Record<FxHomeSection, { label: string; desc: string }> = {
  strip: { label: 'Hizmet şeridi', desc: 'Hero altındaki, hizmet adlarının kaydığı şerit.' },
  services: { label: 'Hizmetler', desc: 'Üç disiplin ve altındaki hizmet kartları.' },
  process: { label: 'Süreç', desc: 'Tara → Modelle → Doğrula → Üret adımları.' },
  works: { label: 'Projeler', desc: 'Portfolyodan seçilen işler.' },
  software: { label: 'Yazılımlar', desc: 'Yazılım ürünleri kartları.' },
  deliv: { label: 'Teslimat', desc: 'Teslim edilen dosyalar ve örnek belge penceresi.' },
  journal: { label: 'Haberler', desc: 'Son haberler / günlük.' },
  quote: { label: 'Teklif çağrısı', desc: 'Sayfa sonundaki teklif bandı.' },
}

const TEXT_SECTIONS: TextSection[] = ['services', 'process', 'works', 'software', 'deliv', 'journal', 'quote']

const DISCIPLINE_LABEL: Record<DisciplineId, string> = { muhendislik: 'Mühendislik', tasarim: 'Tasarım', uretim: 'Üretim' }
const DISCIPLINES: DisciplineId[] = ['muhendislik', 'tasarim', 'uretim']

export const PAGE_INFO: Record<FxPageKey, { label: string; path: (l: FxLocale) => string }> = {
  services: { label: 'Hizmetler', path: (l) => `/${l}/services` },
  software: { label: 'Yazılımlar', path: (l) => `/${l}/software` },
  portfolio: { label: 'Projeler (portfolyo)', path: (l) => `/${l}/portfolio` },
  news: { label: 'Haberler', path: () => '/tr/haberler' },
  videos: { label: 'Videolar', path: (l) => `/${l}/videos` },
  contact: { label: 'İletişim', path: (l) => `/${l}/contact` },
}
const PAGES: FxPageKey[] = ['services', 'software', 'portfolio', 'news', 'videos', 'contact']

const FALLBACK_HINT = 'Boş bırakılırsa sitede varsayılan metin görünür.'

/** eyebrow / başlık / giriş metni üçlüsü */
function SectionTextFields({ value, def, onChange, ledeRows = 2 }: { value: FxSectionText; def: FxSectionText; onChange: (k: keyof FxSectionText, v: string) => void; ledeRows?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField label="Üst etiket (eyebrow)" value={value.eyebrow} placeholder={def.eyebrow} onChange={(v) => onChange('eyebrow', v)} />
      <TextField label="Başlık" value={value.title} placeholder={def.title} onChange={(v) => onChange('title', v)} />
      <TextField className="md:col-span-2" label="Giriş metni (lede)" multiline rows={ledeRows} value={value.lede} placeholder={def.lede || 'Varsayılan: boş (gösterilmez)'} onChange={(v) => onChange('lede', v)} />
    </div>
  )
}

/* ------------------------------------------------------------------- Hero */

const HERO_FIELDS: { key: keyof FxHeroText; label: string; multiline?: boolean; hint?: string; wide?: boolean }[] = [
  { key: 'eyebrow', label: 'Üst etiket (eyebrow)', wide: true },
  { key: 'titleA', label: 'Başlık, 1. satır' },
  { key: 'titleB', label: 'Başlık, 2. satır (turuncu)', hint: 'Başlığın turuncu renkle vurgulanan ikinci satırı.' },
  { key: 'lede', label: 'Giriş metni (lede)', multiline: true, wide: true },
]
const CTA_FIELDS: { key: keyof FxHeroText; label: string }[] = [
  { key: 'ctaQuote', label: 'Teklif düğmesi' },
  { key: 'ctaProjects', label: 'Projeler düğmesi' },
  { key: 'ctaSoftware', label: 'Yazılımlar düğmesi' },
]

export function HeroPanel({ form, defaults, edit, lang, setLang, activeSlides }: PanelProps & { activeSlides: number | null }) {
  const switchId = React.useId()
  const tb = form.titleblock
  return (
    <div className="space-y-6">
      <FormSection title="Hero metinleri" description={`Anasayfanın en üstündeki başlık alanı. ${FALLBACK_HINT}`}>
        <LangTabs value={lang} onChange={setLang} label="Hero metinleri dili">
          {(l) => {
            const t = form.hero.text[l]
            const d = defaults.hero.text[l]
            const set = (k: keyof FxHeroText, v: string) => edit((f) => { f.hero.text[l][k] = v })
            return (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {HERO_FIELDS.map((fd) => (
                    <TextField key={fd.key} className={cn(fd.wide && 'md:col-span-2')} label={fd.label} hint={fd.hint} multiline={fd.multiline} rows={3} value={t[fd.key]} placeholder={d[fd.key]} onChange={(v) => set(fd.key, v)} />
                  ))}
                </div>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium">Düğme metinleri</legend>
                  <div className="grid gap-4 md:grid-cols-3">
                    {CTA_FIELDS.map((fd) => (
                      <TextField key={fd.key} label={fd.label} value={t[fd.key]} placeholder={d[fd.key]} onChange={(v) => set(fd.key, v)} />
                    ))}
                  </div>
                </fieldset>
              </div>
            )
          }}
        </LangTabs>
      </FormSection>

      <FormSection title="Slider entegrasyonu" description="Hero metninin yerine Slider kayıtlarının dönmesini sağlar.">
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-4">
          <Switch id={switchId} checked={form.hero.useSlider} onCheckedChange={(v) => edit((f) => { f.hero.useSlider = v })} aria-describedby={`${switchId}-help`} className="mt-0.5" />
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor={switchId} className="cursor-pointer">Slider kayıtlarını hero&apos;da göster</Label>
            <p id={`${switchId}-help`} className="text-sm text-muted-foreground">
              Açıkken panel → Slider&apos;daki <strong className="font-medium text-foreground">aktif</strong> kayıtlar Türkçe anasayfanın hero alanında sırayla döner
              (başlık, açıklama, düğme).
              Kapalıyken ya da aktif kayıt yoksa hero yalnız yukarıdaki metinleri gösterir.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/slider"><GalleryHorizontal /> Slider kayıtlarını yönet</Link>
              </Button>
              {activeSlides !== null && (
                <Badge variant={activeSlides > 0 ? 'info' : 'warning'}>
                  {activeSlides > 0 ? `${activeSlides} aktif slider kaydı` : 'Aktif slider kaydı yok'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Antet hücreleri" description="Hero'daki teknik resim antedi (titleblock).  Satırlar girildiği gibi kullanılır; listeyi tamamen boşaltırsanız varsayılan hücreler döner.">
        <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 px-0.5 text-xs font-medium text-muted-foreground md:grid">
          <span>Etiket</span><span>Değer</span><span className="w-[6.25rem]" />
        </div>
        <ol className="space-y-2">
          {tb.map((c, i) => (
            <li key={i} className="grid grid-cols-1 gap-2 rounded-md border border-border/70 bg-muted/30 p-2 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:border-0 md:bg-transparent md:p-0">
              <Input aria-label={`Hücre ${i + 1} etiketi`} placeholder="Etiket" value={c.label.tr} onChange={(e) => edit((f) => { f.titleblock[i].label.tr = e.target.value })} />
              <Input aria-label={`Hücre ${i + 1} değeri`} placeholder="Değer" value={c.value} className="font-mono" onChange={(e) => edit((f) => { f.titleblock[i].value = e.target.value })} />
              <RowActions
                className="justify-end sm:col-span-2 md:col-span-1"
                index={i}
                count={tb.length}
                name={`Hücre ${i + 1}`}
                onMove={(dir) => edit((f) => { f.titleblock = moveItem(f.titleblock, i, dir) })}
                onRemove={() => edit((f) => { f.titleblock.splice(i, 1) })}
              />
            </li>
          ))}
        </ol>
        <Button type="button" variant="outline" size="sm" onClick={() => edit((f) => { f.titleblock.push({ label: { tr: '' }, value: '' }) })}>
          <Plus /> Hücre ekle
        </Button>
      </FormSection>
    </div>
  )
}

/* ---------------------------------------------------------------- Bölümler */

function VisibilitySwitch({ section, checked, onChange }: { section: FxHomeSection; checked: boolean; onChange: (v: boolean) => void }) {
  const id = React.useId()
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        Anasayfada göster<span className="sr-only">: {SECTION_INFO[section].label}</span>
      </Label>
    </div>
  )
}

export function SectionsPanel({ form, defaults, edit, lang, setLang }: PanelProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Anasayfadaki her bölümü gizleyebilir, başlıklarını iki dilde değiştirebilirsiniz. {FALLBACK_HINT}</p>
      <LangTabs value={lang} onChange={setLang} label="Bölüm metinleri dili">
        {(l) => (
          <div className="space-y-4">
            <section className="flex flex-col gap-3 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between md:p-6" aria-labelledby="sec-strip">
              <div>
                <h2 id="sec-strip" className="text-base font-semibold">{SECTION_INFO.strip.label}</h2>
                <p className="text-sm text-muted-foreground">{SECTION_INFO.strip.desc} Metni yok; hizmet adlarından oluşur.</p>
              </div>
              <VisibilitySwitch section="strip" checked={form.visibility.strip} onChange={(v) => edit((f) => { f.visibility.strip = v })} />
            </section>

            {TEXT_SECTIONS.map((s) => {
              const visible = form.visibility[s]
              return (
                <section key={s} className={cn('rounded-xl border bg-card p-5 md:p-6', !visible && 'border-dashed')} aria-labelledby={`sec-${s}`}>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 id={`sec-${s}`} className="flex items-center gap-2 text-base font-semibold">
                        {SECTION_INFO[s].label}
                        {!visible && <Badge variant="warning">Gizli</Badge>}
                      </h2>
                      <p className="text-sm text-muted-foreground">{SECTION_INFO[s].desc}</p>
                    </div>
                    <VisibilitySwitch section={s} checked={visible} onChange={(v) => edit((f) => { f.visibility[s] = v })} />
                  </div>
                  <div className={cn(!visible && 'opacity-70')}>
                    <SectionTextFields value={form.sections[s][l]} def={defaults.sections[s][l]} onChange={(k, v) => edit((f) => { f.sections[s][l][k] = v })} />
                  </div>
                </section>
              )
            })}

            <FormSection title="Disiplinler" description="Hizmetler bölümündeki üç sütunun adı ve açıklaması.">
              <div className="grid gap-5 lg:grid-cols-3">
                {DISCIPLINES.map((d) => (
                  <fieldset key={d} className="space-y-3 rounded-md border border-border/70 p-4">
                    <legend className="px-1 text-sm font-semibold">{DISCIPLINE_LABEL[d]}</legend>
                    <TextField label="Ad" value={form.disciplines[d][l].name} placeholder={defaults.disciplines[d][l].name} onChange={(v) => edit((f) => { f.disciplines[d][l].name = v })} />
                    <TextField label="Açıklama" multiline rows={4} value={form.disciplines[d][l].body} placeholder={defaults.disciplines[d][l].body} onChange={(v) => edit((f) => { f.disciplines[d][l].body = v })} />
                  </fieldset>
                ))}
              </div>
            </FormSection>
          </div>
        )}
      </LangTabs>
    </div>
  )
}

/* ------------------------------------------------------------------ Süreç */

export function ProcessPanel({ form, defaults, edit, lang, setLang }: PanelProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Anasayfadaki süreç bölümünün adımları. Teknik satırlar girildiği gibi kullanılır; bir adımın satırlarını tamamen silerseniz o adım satırsız görünür.</p>
      <LangTabs value={lang} onChange={setLang} label="Süreç dili">
        {(l) => (
          <div className="grid gap-4 xl:grid-cols-2">
            {form.process[l].map((step, i) => {
              const def = defaults.process[l][i]
              return (
                <FormSection key={i} title={`${String(i + 1).padStart(2, '0')} · ${step.title || def?.title || 'Adım'}`}>
                  <TextField label="Adım adı" value={step.title} placeholder={def?.title} onChange={(v) => edit((f) => { f.process[l][i].title = v })} />
                  <TextField label="Açıklama" multiline rows={3} value={step.body} placeholder={def?.body} onChange={(v) => edit((f) => { f.process[l][i].body = v })} />
                  <PairRows
                    legend="Teknik satırlar"
                    labels={['Etiket', 'Değer']}
                    rows={step.spec}
                    onChange={(rows) => edit((f) => { f.process[l][i].spec = rows })}
                  />
                </FormSection>
              )
            })}
          </div>
        )}
      </LangTabs>
    </div>
  )
}

/* ---------------------------------------------------------------- Teslimat */

const LINE_TYPES: { t: DocLine[0]; label: string; cls: string }[] = [
  { t: 'c', label: 'yorum', cls: 'text-muted-foreground' },
  { t: 'k', label: 'anahtar kelime', cls: 'text-primary font-semibold' },
  { t: 'n', label: 'normal', cls: 'text-foreground' },
]

export const docToText = (lines: DocLine[]) => lines.map(([t, s]) => `${t}|${s}`).join('\n')
export function textToDoc(text: string): DocLine[] {
  const rows = text.replace(/\r\n?/g, '\n').split('\n')
  while (rows.length && !rows[rows.length - 1].trim()) rows.pop()
  return rows.map((r) => {
    const m = /^([ckn])\|(.*)$/.exec(r)
    return m ? [m[1] as DocLine[0], m[2]] : ['n', r]
  })
}

function DocEditor({ doc, index, count, onChange, onMove, onRemove, idTaken }: { doc: FxDoc; index: number; count: number; onChange: (d: FxDoc) => void; onMove: (dir: -1 | 1) => void; onRemove: () => void; idTaken: boolean }) {
  // Ham metin yerelde tutulur: yazarken önek ayrıştırması imleci bozmasın
  const [raw, setRaw] = React.useState(() => docToText(doc.lines))
  const [seen, setSeen] = React.useState(doc.lines)
  if (seen !== doc.lines) {
    // Dışarıdan değiştiyse (sıralama, silme, varsayılana dönüş) ham metni eşitle
    setSeen(doc.lines)
    if (JSON.stringify(textToDoc(raw)) !== JSON.stringify(doc.lines)) setRaw(docToText(doc.lines))
  }
  const taId = React.useId()
  const lines = textToDoc(raw)
  const unprefixed = raw.split('\n').filter((r) => r.trim() && !/^[ckn]\|/.test(r)).length
  return (
    <section className="rounded-xl border bg-card p-5 md:p-6" aria-label={`Örnek belge ${index + 1}: ${doc.file}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold"><FileCode2 className="size-4 text-muted-foreground" aria-hidden="true" />{doc.file || `Belge ${index + 1}`}</h3>
        <RowActions index={index} count={count} name={`Belge ${doc.file || index + 1}`} onMove={onMove} onRemove={onRemove} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Kimlik (id)" mono value={doc.id} onChange={(v) => onChange({ ...doc, id: v.toLowerCase().replace(/[^a-z0-9-]/g, '') })} hint="Sekmenin iç anahtarı; küçük harf, rakam ve tire." invalid={!doc.id ? 'Kimlik gerekli' : idTaken ? 'Bu kimlik başka belgede de kullanılıyor' : null} />
        <TextField label="Dosya adı (sekme başlığı)" mono value={doc.file} onChange={(v) => onChange({ ...doc, file: v })} placeholder="ornek.nc" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={taId}>Satırlar</Label>
          <Textarea
            id={taId}
            rows={Math.min(18, Math.max(8, lines.length + 1))}
            value={raw}
            spellCheck={false}
            aria-describedby={`${taId}-help`}
            onChange={(e) => { setRaw(e.target.value); onChange({ ...doc, lines: textToDoc(e.target.value) }) }}
            className="font-mono text-xs leading-5"
          />
          <p id={`${taId}-help`} className="text-xs text-muted-foreground">
            Her satırın başına tür öneki yazın: <code className="font-mono">c|</code> yorum, <code className="font-mono">k|</code> anahtar kelime,{' '}
            <code className="font-mono">n|</code> normal satır. Öneksiz satırlar normal sayılır.
            {unprefixed > 0 && <span className="font-medium text-warning"> {unprefixed} satırda önek yok.</span>}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium" id={`${taId}-pv`}>Önizleme</p>
          <pre aria-labelledby={`${taId}-pv`} className="max-h-[22rem] overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs leading-5">
            {lines.map(([t, s], i) => (
              <span key={i} className={cn('block whitespace-pre', LINE_TYPES.find((x) => x.t === t)?.cls)}>{s || ' '}</span>
            ))}
          </pre>
          <p className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {LINE_TYPES.map((x) => <span key={x.t}><span className={cn('font-mono', x.cls)}>{x.t}|</span> {x.label}</span>)}
          </p>
        </div>
      </div>
    </section>
  )
}

export function DeliveryPanel({ form, edit, lang, setLang }: PanelProps) {
  const ids = form.docs.map((d) => d.id)
  return (
    <div className="space-y-6">
      <FormSection title="Teslim edilen dosyalar" description="Teslimat bölümündeki dosya listesi (ad + kısa açıklama). Listeyi tamamen boşaltırsanız varsayılan liste döner.">
        <LangTabs value={lang} onChange={setLang} label="Teslimat listesi dili">
          {(l) => (
            <PairRows
              legend={`Dosyalar (${l.toUpperCase()})`}
              labels={['Dosya / biçim', 'Açıklama']}
              placeholders={['STEP / IGES', 'Düzenlenebilir katı model']}
              rows={form.deliverables[l]}
              addLabel="Dosya ekle"
              onChange={(rows) => edit((f) => { f.deliverables[l] = rows })}
            />
          )}
        </LangTabs>
      </FormSection>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Örnek belgeler</h2>
          <p className="text-sm text-muted-foreground">Teslimat bölümündeki terminal penceresinde sekme olarak görünen örnek dosyalar. Belgeler tek dillidir (her iki dilde aynı görünür).</p>
        </div>
        {form.docs.map((d, i) => (
          <DocEditor
            key={i}
            doc={d}
            index={i}
            count={form.docs.length}
            idTaken={ids.indexOf(d.id) !== i}
            onChange={(nd) => edit((f) => { f.docs[i] = nd })}
            onMove={(dir) => edit((f) => { f.docs = moveItem(f.docs, i, dir) })}
            onRemove={() => edit((f) => { f.docs.splice(i, 1) })}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => edit((f) => {
            let n = f.docs.length + 1
            while (f.docs.some((d) => d.id === `belge-${n}`)) n++
            f.docs.push({ id: `belge-${n}`, file: `belge_${n}.txt`, lines: [['c', '# Yeni örnek belge']] })
          })}
        >
          <Plus /> Belge ekle
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- Sayfa başlıkları */

export function PagesPanel({ form, defaults, edit, lang, setLang }: PanelProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">İç sayfaların üst bölümündeki (hero) etiket, başlık ve giriş metni. {FALLBACK_HINT}</p>
      <LangTabs value={lang} onChange={setLang} label="Sayfa başlıkları dili">
        {(l) => (
          <div className="space-y-4">
            {PAGES.map((p) => {
              const href = PAGE_INFO[p].path(l)
              return (
                <section key={p} className="rounded-xl border bg-card p-5 md:p-6" aria-labelledby={`page-${p}`}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 id={`page-${p}`} className="text-base font-semibold">{PAGE_INFO[p].label}</h2>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-info underline-offset-4 hover:underline">
                      {href} <ExternalLink className="size-3" aria-hidden="true" /><span className="sr-only">(yeni sekmede açılır)</span>
                    </a>
                  </div>
                  <SectionTextFields value={form.pages[p][l]} def={defaults.pages[p][l]} ledeRows={3} onChange={(k, v) => edit((f) => { f.pages[p][l][k] = v })} />
                </section>
              )
            })}
          </div>
        )}
      </LangTabs>
    </div>
  )
}

/* ------------------------------------------------------- Hizmetler sayfası */

interface ServiceOption { slug: string; title: string; isActive?: boolean }

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'

/** Hizmetler sayfasındaki "Birlikte çalışan hizmetler" bölümü: başlık ve hizmet yolları */
export function CombosPanel({ form, defaults, edit, lang, setLang }: PanelProps) {
  const [options, setOptions] = React.useState<ServiceOption[]>([])
  React.useEffect(() => {
    fetch('/api/admin/services')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setOptions(Array.isArray(rows) ? rows : []))
      .catch(() => setOptions([]))
  }, [])
  const option = (slug: string) => options.find((o) => o.slug === slug)
  const items = form.combos.items

  return (
    <div className="space-y-6">
      <FormSection title="Bölüm başlığı" description={`Hizmetler sayfasındaki "Birlikte çalışan hizmetler" bölümü. ${FALLBACK_HINT}`}>
        <LangTabs value={lang} onChange={setLang} label="Bölüm başlığı dili">
          {(l) => (
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Üst etiket (eyebrow)" value={form.combos.head[l].eyebrow} placeholder={defaults.combos.head[l].eyebrow} onChange={(v) => edit((f) => { f.combos.head[l].eyebrow = v })} />
              <TextField label="Başlık" value={form.combos.head[l].title} placeholder={defaults.combos.head[l].title} onChange={(v) => edit((f) => { f.combos.head[l].title = v })} />
            </div>
          )}
        </LangTabs>
      </FormSection>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Hizmet yolları</h2>
          <p className="text-sm text-muted-foreground">Sık izlenen hizmet sıraları. Yoldaki hizmetlerden biri sitede yoksa (pasif, silinmiş ya da &quot;Sitede göster&quot; kapalı) o yol gösterilmez. Listeyi tamamen boşaltırsanız varsayılan yollar döner.</p>
        </div>
        {items.map((combo, i) => {
          const name = combo.text.tr.name || `Yol ${i + 1}`
          const free = options.filter((o) => !combo.services.includes(o.slug))
          return (
            <section key={i} className="space-y-4 rounded-xl border bg-card p-5 md:p-6" aria-label={name}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{name}</h3>
                <RowActions
                  index={i}
                  count={items.length}
                  name={name}
                  onMove={(dir) => edit((f) => { f.combos.items = moveItem(f.combos.items, i, dir) })}
                  onRemove={() => edit((f) => { f.combos.items.splice(i, 1) })}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Hizmet sırası</p>
                <ol className="space-y-1.5">
                  {combo.services.map((slug, j) => {
                    const o = option(slug)
                    return (
                      <li key={slug} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                        <span className="font-mono text-xs text-muted-foreground">{j + 1}.</span>
                        <span className="min-w-0 flex-1 truncate">{o?.title ?? slug}</span>
                        {(!o || o.isActive === false) && <Badge variant="outline" className="text-[10px] text-warning">sitede yok</Badge>}
                        <RowActions
                          index={j}
                          count={combo.services.length}
                          name={o?.title ?? slug}
                          onMove={(dir) => edit((f) => { f.combos.items[i].services = moveItem(f.combos.items[i].services, j, dir) })}
                          onRemove={() => edit((f) => { f.combos.items[i].services.splice(j, 1) })}
                        />
                      </li>
                    )
                  })}
                </ol>
                <select
                  aria-label={`${name}: hizmet ekle`}
                  className={selectClass}
                  value=""
                  disabled={free.length === 0}
                  onChange={(e) => { const v = e.target.value; if (v) edit((f) => { f.combos.items[i].services.push(v) }) }}
                >
                  <option value="">+ Hizmet ekle…</option>
                  {free.map((o) => <option key={o.slug} value={o.slug}>{o.title}{o.isActive === false ? ' (pasif)' : ''}</option>)}
                </select>
              </div>

              <LangTabs value={lang} onChange={setLang} label={`${name} dili`}>
                {(l) => (
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField label="Yol adı" value={combo.text[l].name} onChange={(v) => edit((f) => { f.combos.items[i].text[l].name = v })} />
                    <TextField label="Açıklama" value={combo.text[l].body} onChange={(v) => edit((f) => { f.combos.items[i].text[l].body = v })} />
                  </div>
                )}
              </LangTabs>
            </section>
          )
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => edit((f) => { f.combos.items.push({ services: [], text: { tr: { name: '', body: '' } } }) })}
        >
          <Plus /> Yol ekle
        </Button>
      </div>
    </div>
  )
}
