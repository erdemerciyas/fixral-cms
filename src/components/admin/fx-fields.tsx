'use client'

/**
 * FIXRAL web içeriği panel sayfaları (Site İçeriği, Yazılımlar) için ortak
 * form parçaları: dil sekmeleri, etiketli alanlar, [a, b] satır düzenleyici,
 * etiket (chip) girişi ve kaydedilmemiş değişiklik koruması.
 */
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConfirm } from '@/hooks/use-confirm'
import { cn } from '@/lib/utils'
import { FX_LOCALES } from '@/content/fx-data'
import type { FxLocale } from '@/content/fixral'

export const LOCALE_LABEL: Record<FxLocale, string> = { tr: 'Türkçe' }

/* ------------------------------------------------------------------ Yardımcılar */

export function moveItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const to = index + dir
  if (to < 0 || to >= arr.length) return arr
  const next = [...arr]
  const [it] = next.splice(index, 1)
  next.splice(to, 0, it)
  return next
}

export const formatDateTime = (v: string | Date | null | undefined) => {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
}

/* ---------------------------------------------------------------- Dil sekmeleri */

interface LangTabsProps {
  value: FxLocale
  onChange: (l: FxLocale) => void
  children: (l: FxLocale) => React.ReactNode
  /** Sekme listesinin erişilebilir adı */
  label?: string
  className?: string
}

/** Dil sekmeleri (şu an yalnızca TR); içerik seçili dil için render edilir */
export function LangTabs({ value, onChange, children, label = 'İçerik dili', className }: LangTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as FxLocale)} className={className}>
      <TabsList aria-label={label}>
        {FX_LOCALES.map((l) => (
          <TabsTrigger key={l} value={l} className="gap-2">
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] uppercase text-muted-foreground">{l}</span>
            {LOCALE_LABEL[l]}
          </TabsTrigger>
        ))}
      </TabsList>
      {FX_LOCALES.map((l) => (
        <TabsContent key={l} value={l} lang={l}>
          {children(l)}
        </TabsContent>
      ))}
    </Tabs>
  )
}

/* -------------------------------------------------------------- Etiketli alanlar */

interface TextFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: React.ReactNode
  multiline?: boolean
  rows?: number
  mono?: boolean
  className?: string
  required?: boolean
  invalid?: string | null
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}

export function TextField({ label, value, onChange, placeholder, hint, multiline, rows = 3, mono, className, required, invalid, type = 'text', inputMode }: TextFieldProps) {
  const id = React.useId()
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  const describedBy = [hint ? hintId : null, invalid ? errId : null].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    value,
    placeholder,
    required,
    'aria-invalid': invalid ? true : undefined,
    'aria-describedby': describedBy,
  }
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
      </Label>
      {multiline ? (
        <Textarea {...common} rows={rows} onChange={(e) => onChange(e.target.value)} className={cn(mono && 'font-mono text-xs leading-5', invalid && 'border-destructive')} />
      ) : (
        <Input {...common} type={type} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} className={cn(mono && 'font-mono text-sm', invalid && 'border-destructive')} />
      )}
      {invalid && <p id={errId} className="text-xs font-medium text-destructive">{invalid}</p>}
      {hint && <p id={hintId} className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* --------------------------------------------------------------- Satır işlemleri */

interface RowActionsProps {
  index: number
  count: number
  name: string
  onMove?: (dir: -1 | 1) => void
  onRemove?: () => void
  className?: string
}

export function RowActions({ index, count, name, onMove, onRemove, className }: RowActionsProps) {
  return (
    <div className={cn('flex shrink-0 items-center gap-0.5', className)}>
      {onMove && (
        <>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`${name}: yukarı taşı`}>
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`${name}: aşağı taşı`}>
            <ArrowDown />
          </Button>
        </>
      )}
      {onRemove && (
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={onRemove} aria-label={`${name}: sil`}>
          <Trash2 />
        </Button>
      )}
    </div>
  )
}

/* ------------------------------------------------------- [a, b] satır düzenleyici */

interface PairRowsProps {
  /** Grubun başlığı (görünür) */
  legend: string
  rows: [string, string][]
  onChange: (rows: [string, string][]) => void
  labels: [string, string]
  placeholders?: [string, string]
  /** İkinci alan çok satırlı olsun */
  multilineSecond?: boolean
  addLabel?: string
  hint?: React.ReactNode
  reorder?: boolean
  className?: string
}

/** [etiket, değer] gibi ikili satır listeleri: ekle / sil / sırala */
export function PairRows({ legend, rows, onChange, labels, placeholders, multilineSecond, addLabel = 'Satır ekle', hint, reorder = true, className }: PairRowsProps) {
  const set = (i: number, k: 0 | 1, v: string) => onChange(rows.map((r, j) => (j === i ? (k === 0 ? [v, r[1]] : [r[0], v]) : r)))
  return (
    <fieldset className={cn('space-y-2', className)}>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      {hint && <p className="-mt-1 mb-2 text-xs text-muted-foreground">{hint}</p>}
      {rows.length > 0 && (
        <div aria-hidden="true" className={cn('hidden gap-2 px-0.5 text-xs font-medium text-muted-foreground sm:grid', multilineSecond ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]' : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]')}>
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
          <span className={reorder ? 'w-[6.25rem]' : 'w-9'} />
        </div>
      )}
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className={cn('grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-md border border-border/70 bg-muted/30 p-2 sm:border-0 sm:bg-transparent sm:p-0', multilineSecond ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]' : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]')}>
            <Input value={r[0]} onChange={(e) => set(i, 0, e.target.value)} aria-label={`${labels[0]} ${i + 1}`} placeholder={placeholders?.[0] ?? labels[0]} className="col-start-1" />
            {multilineSecond ? (
              <Textarea value={r[1]} onChange={(e) => set(i, 1, e.target.value)} aria-label={`${labels[1]} ${i + 1}`} placeholder={placeholders?.[1] ?? labels[1]} rows={2} className="col-start-1 min-h-[2.25rem] sm:col-start-auto" />
            ) : (
              <Input value={r[1]} onChange={(e) => set(i, 1, e.target.value)} aria-label={`${labels[1]} ${i + 1}`} placeholder={placeholders?.[1] ?? labels[1]} className="col-start-1 sm:col-start-auto" />
            )}
            <RowActions
              className="col-start-2 row-span-2 row-start-1 flex-col sm:row-span-1 sm:flex-row sm:col-start-auto"
              index={i}
              count={rows.length}
              name={`${legend} ${i + 1}`}
              onMove={reorder ? (d) => onChange(moveItem(rows, i, d)) : undefined}
              onRemove={() => onChange(rows.filter((_, j) => j !== i))}
            />
          </li>
        ))}
      </ol>
      {rows.length === 0 && <p className="rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">Henüz satır yok.</p>}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, ['', '']])}>
        <Plus /> {addLabel}
      </Button>
    </fieldset>
  )
}

/* ---------------------------------------------------------------- Etiket girişi */

interface ChipsInputProps {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  hint?: string
}

/** Enter ya da virgülle etiket ekler; Backspace son etiketi siler */
export function ChipsInput({ label, values, onChange, placeholder, hint }: ChipsInputProps) {
  const id = React.useId()
  const [draft, setDraft] = React.useState('')
  const add = (raw: string) => {
    const v = raw.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-sm border border-input bg-transparent px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
        <ul className="contents" aria-label={`${label} listesi`}>
          {values.map((v) => (
            <li key={v} className="inline-flex items-center gap-1 rounded-sm bg-muted py-0.5 pl-2 pr-1 text-xs font-medium">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${v} etiketini kaldır`}>
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
        <input
          id={id}
          value={draft}
          placeholder={placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft) }
            if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1))
          }}
          onBlur={() => draft.trim() && add(draft)}
          className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm outline-hidden placeholder:text-muted-foreground"
        />
      </div>
      {hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------ Kaydedilmemiş değişiklik koruması */

/**
 * Sayfadan ayrılmadan önce uyarır: tarayıcı kapatma/yenileme (beforeunload)
 * ve panel içi bağlantı tıklamaları (onay penceresi).
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const router = useRouter()
  const { confirm } = useConfirm()
  const dirtyRef = React.useRef(dirty)
  React.useEffect(() => { dirtyRef.current = dirty }, [dirty])

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return
      e.preventDefault()
      e.stopPropagation()
      void confirm({
        title: 'Kaydedilmemiş değişiklikler var',
        description: 'Sayfadan ayrılırsanız yaptığınız değişiklikler kaybolur.',
        confirmText: 'Kaydetmeden ayrıl',
        cancelText: 'Sayfada kal',
      }).then((ok) => {
        if (ok) { dirtyRef.current = false; router.push(url.pathname + url.search + url.hash) }
      })
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [confirm, router])
}

/* ---------------------------------------------------------------- Durum satırı */

export function SaveStatus({ updatedAt, dirty, storedLabel }: { updatedAt: string | null; dirty: boolean; storedLabel?: string }) {
  const when = formatDateTime(updatedAt)
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-live="polite">
      <span>{when ? <>Son güncelleme: <time dateTime={updatedAt ?? undefined} className="font-medium text-foreground">{when}</time></> : storedLabel ?? 'Henüz panelden kaydedilmedi; sitede varsayılan içerik görünüyor.'}</span>
      {dirty && <span className="inline-flex items-center gap-1.5 font-medium text-warning"><span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />Kaydedilmemiş değişiklikler var</span>}
    </p>
  )
}
