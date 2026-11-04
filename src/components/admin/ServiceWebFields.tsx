'use client';

/**
 * Hizmet formu → "Web sitesi (FIXRAL tasarımı)" bölümü.
 *
 * Yeni sitedeki hizmet sayfasının panelden düzenlenen alanları. Depolama,
 * `mergeServices()` (src/content/fx-data.ts) ile birebir aynıdır:
 *  - ServiceRow.slug                        → /<dil>/services/<slug>
 *  - ServiceRow.isActive                    → kayıt aktif/pasif
 *  - ServiceRow.translations._fx            → enabled, discipline, icon, files, viz, part, software
 *  - ServiceRow.translations.<tr|es>        → lede, when[], flow[[başlık, metin]], spec[[etiket, değer]]
 *    (title = hizmet adı, excerpt = kart metni, description = "Hizmet hakkında" — formun mevcut alanları)
 */

import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  Box,
  Check,
  ExternalLink,
  Globe,
  Info,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import TagInput from '@/components/ui/TagInput';
import { ServiceIcon } from '@/components/fx/FxIcons';
import {
  SERVICES,
  type DisciplineId,
  type FxLocale,
  type PartName,
  type ServiceDef,
  type ServiceKey,
  type VizMode,
} from '@/content/fixral';
import {
  FX_LOCALES,
  catalogSoftware,
  mergeServices,
  type FxServiceLangFields,
  type FxServiceMeta,
  type ServiceRowLike,
} from '@/content/fx-data';
import { cn } from '@/lib/utils';

const PartViewer = dynamic(() => import('@/components/fx/FxVisuals').then((m) => m.PartViewer), {
  ssr: false,
  loading: () => <div className="aspect-4/3 w-full animate-pulse rounded-lg bg-muted" />,
});

/* ------------------------------------------------------------------ Seçenekler */

export const DISCIPLINE_OPTIONS: { value: DisciplineId; label: string }[] = [
  { value: 'muhendislik', label: 'Mühendislik' },
  { value: 'tasarim', label: 'Tasarım' },
  { value: 'uretim', label: 'Üretim' },
];

export const ICON_OPTIONS: { value: ServiceKey; label: string; short: string }[] = [
  { value: 'tarama', label: '3D tarama', short: 'Tarama' },
  { value: 'tersine', label: 'Tersine mühendislik', short: 'Tersine' },
  { value: 'otomotiv', label: 'Otomotiv teknolojileri', short: 'Otomotiv' },
  { value: 'cad', label: 'CAD / 3D çizim', short: 'CAD' },
  { value: 'pcb', label: 'PCB / Gerber', short: 'PCB' },
  { value: 'gomulu', label: 'Gömülü sistem', short: 'Gömülü' },
  { value: 'baski', label: '3D baskı', short: 'Baskı' },
  { value: 'cnc', label: 'CNC / CAM', short: 'CNC' },
];

export const VIZ_OPTIONS: { value: VizMode; label: string }[] = [
  { value: 'points', label: 'Nokta bulutu (tarama)' },
  { value: 'wire', label: 'Tel kafes (model)' },
  { value: 'dev', label: 'Sapma haritası' },
  { value: 'solid', label: 'Katı parça' },
  { value: 'print', label: 'Katman katman baskı' },
];

export const PART_OPTIONS: { value: PartName; label: string }[] = [
  { value: 'gear', label: 'Dişli' },
  { value: 'bracket', label: 'Fikstür plakası' },
  { value: 'pcb', label: 'Devre kartı' },
  { value: 'enclosure', label: 'Elektronik kutusu' },
  { value: 'impeller', label: 'Pompa çarkı' },
  { value: 'vase', label: 'Vazo' },
];

const LANG_LABEL: Record<FxLocale, string> = { tr: 'Türkçe' };
const FLOW_MIN = 3;
const FLOW_MAX = 6;
const LIST_MAX = 12;

/* ---------------------------------------------------------------- Durum tipi */

export type Pair = [string, string];
export interface ServiceWebLang { lede: string; when: string[]; flow: Pair[]; spec: Pair[] }
export interface ServiceWebMeta {
  enabled: boolean;
  discipline: DisciplineId;
  icon: ServiceKey;
  files: string[];
  viz: VizMode;
  part: PartName;
  software: string[];
}
type StructKey = Exclude<keyof ServiceWebMeta, 'enabled'>;
const STRUCT_KEYS: StructKey[] = ['discipline', 'icon', 'files', 'viz', 'part', 'software'];

export interface ServiceWebState {
  slug: string;
  isActive: boolean;
  meta: ServiceWebMeta;
  lang: Record<FxLocale, ServiceWebLang>;
  /** Kayıtta açıkça belirlenmiş / elle değiştirilmiş yapı alanları. "Katalogdan doldur" bunlara dokunmaz. Kaydedilmez. */
  setKeys: StructKey[];
}

/** Metin alanları (formun mevcut dil alanları) — durum/katalog doldurma için */
export interface ServiceBaseTexts { title?: string; excerpt?: string; description?: string }

/* ------------------------------------------------------------------ Yardımcılar */

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const pairList = (v: unknown): Pair[] =>
  Array.isArray(v) ? v.filter(Array.isArray).map((p) => [String(p[0] ?? ''), String(p[1] ?? '')] as Pair) : [];
const oneOf = <T extends string>(v: unknown, list: { value: T }[]): T | undefined =>
  list.some((o) => o.value === v) ? (v as T) : undefined;

export const emptyWebLang = (): ServiceWebLang => ({ lede: '', when: [], flow: [], spec: [] });

/** Slug'ı eşleşen katalog hizmeti (boş alanların varsayılan içeriği) */
export const catalogMatch = (slug: string): ServiceDef | undefined =>
  slug ? SERVICES.find((s) => s.slug === slug) : undefined;

/** Türkçe karakterleri dönüştürerek URL uyumlu slug üretir */
export const toServiceSlug = (text: string): string =>
  slugify(text || '', { lower: true, strict: true, locale: 'tr', replacement: '-' }).replace(/-+/g, '-').replace(/^-|-$/g, '');

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Boş string = geçerli */
export function slugError(slug: string): string {
  if (!slug.trim()) return 'Slug zorunludur (sitedeki adres).';
  if (!SLUG_RE.test(slug)) return 'Slug yalnızca küçük harf, rakam ve tek tire içerebilir (ör. 3d-tarama).';
  if (slug.length > 120) return 'Slug en fazla 120 karakter olabilir.';
  return '';
}

/** Kayıttan form durumunu kurar. `_fx` yoksa yapı alanları eşleşen katalog hizmetinden (yoksa genel varsayılanlardan) gelir. */
export function initServiceWebState(row: { slug?: string; isActive?: boolean; translations?: unknown } | null, opts: { isNew?: boolean } = {}): ServiceWebState {
  const slug = row?.slug || '';
  const tr = isObj(row?.translations) ? (row!.translations as Record<string, unknown>) : {};
  const stored = isObj(tr._fx) ? (tr._fx as FxServiceMeta & Record<string, unknown>) : null;
  const base = catalogMatch(slug);

  const discipline = oneOf(stored?.discipline, DISCIPLINE_OPTIONS);
  const icon = oneOf(stored?.icon, ICON_OPTIONS);
  const viz = oneOf(stored?.viz, VIZ_OPTIONS);
  const part = oneOf(stored?.part, PART_OPTIONS);
  const files = stored ? strList(stored.files) : [];
  const software = stored && Array.isArray(stored.software) ? strList(stored.software) : null;

  const setKeys: StructKey[] = [];
  if (discipline) setKeys.push('discipline');
  if (icon) setKeys.push('icon');
  if (viz) setKeys.push('viz');
  if (part) setKeys.push('part');
  if (files.length) setKeys.push('files');
  if (software) setKeys.push('software');

  const lang = {} as Record<FxLocale, ServiceWebLang>;
  for (const l of FX_LOCALES) {
    const f = isObj(tr[l]) ? (tr[l] as Record<string, unknown>) : {};
    lang[l] = {
      lede: typeof f.lede === 'string' ? f.lede : '',
      when: strList(f.when),
      flow: pairList(f.flow),
      spec: pairList(f.spec),
    };
  }

  return {
    slug,
    isActive: row?.isActive !== false,
    meta: {
      enabled: stored ? stored.enabled !== false : !!opts.isNew,
      discipline: discipline ?? base?.discipline ?? 'uretim',
      icon: icon ?? base?.key ?? 'cad',
      files: files.length ? files : stored ? [] : [...(base?.files ?? [])],
      viz: viz ?? base?.viz ?? 'solid',
      part: part ?? base?.part ?? 'bracket',
      software: software ?? [...(base?.software ?? [])],
    },
    lang,
    setKeys,
  };
}

const cleanPairs = (list: Pair[]): Pair[] =>
  list.map(([a, b]) => [a.trim(), b.trim()] as Pair).filter(([a, b]) => a || b);

export function cleanServiceWebLang(l: ServiceWebLang): Required<Pick<FxServiceLangFields, 'lede' | 'when' | 'flow' | 'spec'>> {
  return {
    lede: l.lede.trim(),
    when: l.when.map((s) => s.trim()).filter(Boolean),
    flow: cleanPairs(l.flow),
    spec: cleanPairs(l.spec),
  };
}

export function cleanServiceWebMeta(m: ServiceWebMeta): Required<FxServiceMeta> {
  return {
    enabled: m.enabled,
    discipline: m.discipline,
    icon: m.icon,
    files: m.files.map((s) => s.trim()).filter(Boolean),
    viz: m.viz,
    part: m.part,
    software: Array.from(new Set(m.software.filter(Boolean))),
  };
}

/**
 * Kaydedilecek `translations` nesnesi: kayıttaki orijinal içerik (bilinmeyen anahtarlar,
 * `_fx`, diğer diller) korunur; formun dil alanları ve web alanları üstüne yazılır.
 */
export function buildServiceTranslations(
  original: unknown,
  formTranslations: Record<string, object>,
  web: ServiceWebState,
): Record<string, unknown> {
  const orig = isObj(original) ? original : {};
  const out: Record<string, unknown> = { ...orig };
  for (const [code, t] of Object.entries(formTranslations)) {
    out[code] = { ...(isObj(orig[code]) ? orig[code] : {}), ...t };
  }
  for (const l of FX_LOCALES) {
    out[l] = { ...(isObj(out[l]) ? (out[l] as object) : {}), ...cleanServiceWebLang(web.lang[l]) };
  }
  out._fx = cleanServiceWebMeta(web.meta);
  return out;
}

/** Kaydedilmemiş değişiklik karşılaştırması için (setKeys hariç) */
export const serializeServiceWeb = (w: ServiceWebState) =>
  JSON.stringify({ slug: w.slug, isActive: w.isActive, meta: w.meta, lang: w.lang });

/* ------------------------------------------------------------------- Bileşen */

interface SoftwareOption { slug: string; name: string; isActive: boolean }
interface AdminServiceLite { _id?: string; id?: string; slug?: string; title?: string }

interface ServiceWebFieldsProps {
  value: ServiceWebState;
  onChange: Dispatch<SetStateAction<ServiceWebState>>;
  /** Formdaki aktif dil sekmesi */
  activeLanguage: string;
  /** Formun dil alanları (ad, kart metni, uzun açıklama) */
  texts: Record<string, ServiceBaseTexts | undefined>;
  /** "Katalogdan doldur": boş ad / kart metni alanlarını doldurur */
  onFillTexts: (fill: Partial<Record<FxLocale, { title?: string; excerpt?: string }>>) => void;
  /** Slug alanı elle değiştirildiğinde (yeni kayıtta otomatik slug'ı durdurmak için) */
  onSlugEdit?: () => void;
  recordId?: string;
  image?: string;
  disabled?: boolean;
}

export default function ServiceWebFields({
  value,
  onChange,
  activeLanguage,
  texts,
  onFillTexts,
  onSlugEdit,
  recordId,
  image,
  disabled,
}: ServiceWebFieldsProps) {
  const [software, setSoftware] = useState<SoftwareOption[]>(() =>
    catalogSoftware().map((s) => ({ slug: s.slug, name: s.name, isActive: s.isActive })),
  );
  const [others, setOthers] = useState<AdminServiceLite[]>([]);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/public/fx-data', { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { software?: SoftwareOption[] } | null) => {
        if (d && Array.isArray(d.software) && d.software.length) {
          setSoftware(d.software.map((s) => ({ slug: s.slug, name: s.name || s.slug, isActive: s.isActive !== false })));
        }
      })
      .catch(() => {});
    fetch('/api/admin/services', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (Array.isArray(d)) setOthers(d as AdminServiceLite[]);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const { meta, slug } = value;
  const match = catalogMatch(slug);
  const sErr = slugError(slug);
  const duplicate = useMemo(
    () => (slug ? others.find((o) => o.slug === slug && (o._id || o.id) !== recordId) : undefined),
    [others, slug, recordId],
  );

  const setMeta = <K extends keyof ServiceWebMeta>(key: K, v: ServiceWebMeta[K]) =>
    onChange((prev) => ({
      ...prev,
      meta: { ...prev.meta, [key]: v },
      setKeys: key === 'enabled' || prev.setKeys.includes(key as StructKey) ? prev.setKeys : [...prev.setKeys, key as StructKey],
    }));

  const fxLang: FxLocale | null = (FX_LOCALES as string[]).includes(activeLanguage) ? (activeLanguage as FxLocale) : null;
  const setLang = <K extends keyof ServiceWebLang>(key: K, v: ServiceWebLang[K]) => {
    if (!fxLang) return;
    onChange((prev) => ({ ...prev, lang: { ...prev.lang, [fxLang]: { ...prev.lang[fxLang], [key]: v } } }));
  };

  /* Bu kayıt sitede nasıl görünür? — sitenin kendi birleştirme kuralıyla hesaplanır */
  const status = useMemo(() => {
    const id = recordId || '__new__';
    const row: ServiceRowLike = {
      id,
      title: texts.tr?.title || '',
      slug,
      image,
      isActive: value.isActive,
      translations: { _fx: cleanServiceWebMeta(meta) },
    };
    return mergeServices([row]).some((s) => s.id === id) ? 'listed' as const : 'off' as const;
  }, [recordId, texts.tr?.title, slug, image, value.isActive, meta]);

  const fillFromCatalog = () => {
    if (!match) return;
    let count = 0;
    const lang = { ...value.lang };
    for (const l of FX_LOCALES) {
      const cur = { ...lang[l] };
      const src = match.text[l];
      if (!cur.lede.trim() && src.lede) { cur.lede = src.lede; count++; }
      if (!cur.when.some((s) => s.trim()) && src.when.length) { cur.when = [...src.when]; count++; }
      if (!cur.flow.some(([a, b]) => a.trim() || b.trim()) && src.flow.length) { cur.flow = src.flow.map((p) => [...p] as Pair); count++; }
      if (!cur.spec.some(([a, b]) => a.trim() || b.trim()) && src.spec.length) { cur.spec = src.spec.map((p) => [...p] as Pair); count++; }
      lang[l] = cur;
    }
    const nextMeta = { ...value.meta };
    const catalogMeta: Omit<ServiceWebMeta, 'enabled'> = {
      discipline: match.discipline, icon: match.key, files: [...match.files], viz: match.viz, part: match.part, software: [...match.software],
    };
    for (const k of STRUCT_KEYS) {
      const empty = k === 'files' ? nextMeta.files.length === 0 : !value.setKeys.includes(k);
      if (!empty) continue;
      if (JSON.stringify(nextMeta[k]) !== JSON.stringify(catalogMeta[k])) count++;
      (nextMeta as Record<StructKey, unknown>)[k] = catalogMeta[k];
    }
    const textFill: Partial<Record<FxLocale, { title?: string; excerpt?: string }>> = {};
    for (const l of FX_LOCALES) {
      const t = texts[l];
      const f: { title?: string; excerpt?: string } = {};
      if (!t?.title?.trim()) { f.title = match.text[l].name; count++; }
      if (!t?.excerpt?.trim()) { f.excerpt = match.text[l].short; count++; }
      if (f.title || f.excerpt) textFill[l] = f;
    }
    onChange((prev) => ({ ...prev, lang, meta: nextMeta, setKeys: Array.from(new Set([...prev.setKeys, ...STRUCT_KEYS])) }));
    if (Object.keys(textFill).length) onFillTexts(textFill);
    if (count) toast.success(`Katalogdaki "${match.text.tr.name}" içeriğinden ${count} boş alan dolduruldu.`);
    else toast.info('Doldurulacak boş alan yok; dolu alanlara dokunulmadı.');
  };

  const cur = fxLang ? value.lang[fxLang] : null;
  const fallback = fxLang && match ? match.text[fxLang] : null;
  const softwareOptions = useMemo(() => {
    const known = new Set(software.map((s) => s.slug));
    const extra = meta.software.filter((s) => !known.has(s)).map((s) => ({ slug: s, name: s, isActive: false, unknown: true }));
    return [...software.map((s) => ({ ...s, unknown: false })), ...extra];
  }, [software, meta.software]);

  const selectCls =
    'flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1.5 text-sm text-foreground focus-visible:outline-hidden focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <section aria-labelledby="svc-web-title" className="bg-card rounded-xl shadow-xs border border-border">
      {/* Başlık */}
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 id="svc-web-title" className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
            Web sitesi (FIXRAL tasarımı)
          </h2>
          <p className="text-xs text-muted-foreground max-w-prose">
            Yeni sitedeki hizmet sayfasında görünen alanlar. Hizmet adı, kart metni ve &quot;Hizmet hakkında&quot; yukarıdaki dil alanlarından gelir.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={fillFromCatalog}
          disabled={disabled || !match}
          title={match ? `Boş alanları katalogdaki "${match.text.tr.name}" içeriğiyle doldurur` : 'Slug bir katalog hizmetiyle eşleşmiyor'}
        >
          <Wand2 aria-hidden="true" />
          Katalogdan doldur
        </Button>
      </div>

      <div className="divide-y divide-border">
        {/* -------------------------------------------------- Yayın */}
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Switch
                id="svc-web-enabled"
                checked={meta.enabled}
                onCheckedChange={(v) => setMeta('enabled', v)}
                disabled={disabled}
                aria-describedby="svc-web-enabled-help"
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="svc-web-enabled" className="font-semibold">Sitede göster</Label>
                <p id="svc-web-enabled-help" className="text-xs text-muted-foreground">
                  Açıkken bu kayıt yeni sitede hizmet olarak listelenir. Bu bölümü olmayan (ya da kapalı) kayıtlar panelde kalır ama yeni sitede listelenmez.
                  Standart 8 hizmet için, bu bölümü açık bir panel kaydı oluşana kadar katalogdaki varsayılan içerik kullanılır;
                  standart bir hizmetin kaydında bu anahtarı kapatırsanız o hizmet sitede gizlenir.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Switch
                id="svc-web-active"
                checked={value.isActive}
                onCheckedChange={(v) => onChange((prev) => ({ ...prev, isActive: v }))}
                disabled={disabled}
                aria-describedby="svc-web-active-help"
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="svc-web-active" className="font-semibold">Kayıt aktif</Label>
                <p id="svc-web-active-help" className="text-xs text-muted-foreground">
                  Kapalıyken kayıt taslaktır ve hiçbir yerde gösterilmez. Slug&apos;ı bir katalog hizmetiyle eşleşen pasif kayıt, o hizmeti sitede gizler.
                </p>
              </div>
            </div>
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="svc-web-slug" className="font-semibold">Adres (slug) <span className="text-destructive">*</span></Label>
            <div className="flex items-stretch overflow-hidden rounded-sm border border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
              <span className="flex items-center bg-muted px-3 font-mono text-xs text-muted-foreground select-none">/tr/services/</span>
              <input
                id="svc-web-slug"
                value={slug}
                onChange={(e) => {
                  onSlugEdit?.();
                  onChange((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }));
                }}
                onBlur={() => slug && onChange((prev) => ({ ...prev, slug: toServiceSlug(prev.slug) }))}
                maxLength={120}
                spellCheck={false}
                autoComplete="off"
                disabled={disabled}
                aria-invalid={!!sErr || !!duplicate}
                aria-describedby="svc-web-slug-help"
                placeholder="ornek-hizmet"
                className="h-9 min-w-0 flex-1 bg-transparent px-3 font-mono text-sm text-foreground outline-hidden disabled:opacity-50"
              />
            </div>
            <div id="svc-web-slug-help" className="space-y-1 text-xs">
              {sErr ? (
                <p className="text-destructive">{sErr}</p>
              ) : duplicate ? (
                <p className="text-destructive">Bu slug başka bir kayıtta kullanılıyor: &quot;{duplicate.title || duplicate.slug}&quot;. Kaydetmeden önce değiştirin.</p>
              ) : (
                <p className="text-muted-foreground">
                  Sitedeki adres. Küçük harf, rakam ve tire. Değiştirirseniz eski bağlantılar çalışmaz.
                  {match && match.slug === slug && <> Katalog eşleşmesi: <span className="font-medium text-foreground">{match.text.tr.name}</span>.</>}
                </p>
              )}
            </div>
          </div>

          <SiteStatus kind={status} slug={slug} slugValid={!sErr} />
        </div>

        {/* -------------------------------------------------- Yapı */}
        <div className="space-y-5 p-5">
          <h3 className="text-sm font-semibold text-foreground">Yapı</h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-web-discipline">Disiplin</Label>
              <select
                id="svc-web-discipline"
                value={meta.discipline}
                onChange={(e) => setMeta('discipline', e.target.value as DisciplineId)}
                disabled={disabled}
                className={selectCls}
              >
                {DISCIPLINE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <p className="text-xs text-muted-foreground">Hizmetler sayfasında hangi disiplin altında listeleneceği.</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium leading-none">Teslim edilen dosya biçimleri</span>
              <TagInput
                values={meta.files}
                onChange={(v) => setMeta('files', v)}
                placeholder="STEP, STL… (Enter ile ekle)"
              />
              <p className="text-xs text-muted-foreground">
                {meta.files.length === 0 && match
                  ? `Boş bırakılırsa katalog değeri kullanılır: ${match.files.join(' · ')}`
                  : 'Enter ya da virgülle ekleyin; × ile kaldırın.'}
              </p>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Marka ikonu</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {ICON_OPTIONS.map((o) => {
                const on = meta.icon === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    aria-label={o.label}
                    title={o.label}
                    disabled={disabled}
                    onClick={() => setMeta('icon', o.value)}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
                      on ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                  >
                    <ServiceIcon name={o.value} className="h-6 w-6" />
                    <span className="text-[10px] leading-tight text-center line-clamp-1" aria-hidden="true">{o.short}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">İlgili yazılımlar</legend>
            <div className="flex flex-wrap gap-2">
              {softwareOptions.map((s) => {
                const on = meta.software.includes(s.slug);
                return (
                  <button
                    key={s.slug}
                    type="button"
                    aria-pressed={on}
                    disabled={disabled}
                    onClick={() => setMeta('software', on ? meta.software.filter((x) => x !== s.slug) : [...meta.software, s.slug])}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
                      on ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                  >
                    {on ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                    {s.name}
                    {s.unknown ? <span className="text-destructive">(bulunamadı)</span> : !s.isActive && <span className="opacity-70">(pasif)</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Hizmet sayfasında &quot;ilgili yazılım&quot; olarak gösterilir. Liste Yazılımlar bölümünden gelir.</p>
          </fieldset>
        </div>

        {/* -------------------------------------------------- 3D görünüm */}
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">3D görünüm</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => setPreview((p) => !p)} aria-expanded={preview} aria-controls="svc-web-preview">
              <Box aria-hidden="true" />
              {preview ? 'Önizlemeyi kapat' : 'Önizle'}
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-web-viz">Görünüm</Label>
              <select id="svc-web-viz" value={meta.viz} onChange={(e) => setMeta('viz', e.target.value as VizMode)} disabled={disabled} className={selectCls}>
                {VIZ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-web-part">Parça</Label>
              <select id="svc-web-part" value={meta.part} onChange={(e) => setMeta('part', e.target.value as PartName)} disabled={disabled} className={selectCls}>
                {PART_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Hizmet sayfasının üst bölümündeki 3D sahne.</p>
          {preview && (
            <div id="svc-web-preview" className="mx-auto max-w-md">
              <PartViewer
                key={`${meta.part}-${meta.viz}`}
                part={meta.part}
                mode={meta.viz}
                label={`3D önizleme: ${PART_OPTIONS.find((p) => p.value === meta.part)?.label}, ${VIZ_OPTIONS.find((v) => v.value === meta.viz)?.label}`}
                className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-[radial-gradient(80%_70%_at_50%_45%,#1E2A42,#0B111D)] [&_canvas]:block [&_canvas]:h-full! [&_canvas]:w-full!"
              />
            </div>
          )}
        </div>

        {/* -------------------------------------------------- Dil alanları */}
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Sayfa metinleri {fxLang && <span className="font-normal text-muted-foreground">— {LANG_LABEL[fxLang]}</span>}
            </h3>
            {fxLang && <span className="text-xs text-muted-foreground">Dili üstteki sekmelerden değiştirin.</span>}
          </div>

          {!fxLang || !cur ? (
            <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              Yeni site yalnızca Türkçe yayında. Bu alanları düzenlemek için TR sekmesine geçin.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="svc-web-lede">Hero açıklaması</Label>
                <Textarea
                  id="svc-web-lede"
                  value={cur.lede}
                  onChange={(e) => setLang('lede', e.target.value)}
                  rows={4}
                  maxLength={600}
                  disabled={disabled}
                  placeholder={fallback?.lede || 'Hizmet sayfasının başındaki 2–3 cümlelik tanıtım'}
                  aria-describedby="svc-web-lede-help"
                  className="resize-y"
                />
                <p id="svc-web-lede-help" className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    {cur.lede.trim()
                      ? 'Hizmet sayfasının başında, adın altında görünür.'
                      : fallback
                        ? 'Boş bırakılırsa katalog metni kullanılır (soluk gösterilen).'
                        : 'Boş bırakılırsa "Hizmet hakkında" metninin başı kullanılır.'}
                  </span>
                  <span>{cur.lede.length}/600</span>
                </p>
              </div>

              <ListBlock
                title="Ne zaman gerekir"
                help={cur.when.length === 0 && fallback ? `Boş bırakılırsa katalogdaki ${fallback.when.length} madde kullanılır.` : 'Müşterinin bu hizmete ihtiyaç duyduğu durumlar, kısa maddeler.'}
              >
                <StringList
                  idPrefix={`svc-when-${fxLang}`}
                  items={cur.when}
                  onChange={(v) => setLang('when', v)}
                  itemLabel="Durum"
                  placeholder="ör. Parçanın çizimi ya da CAD modeli yok"
                  max={LIST_MAX}
                  disabled={disabled}
                />
              </ListBlock>

              <ListBlock
                title="Nasıl çalışıyoruz"
                help={
                  cur.flow.length === 0 && fallback
                    ? `Boş bırakılırsa katalogdaki ${fallback.flow.length} adım kullanılır.`
                    : `${FLOW_MIN}–${FLOW_MAX} adım: kısa başlık + tek satır açıklama.`
                }
                warn={cur.flow.length > 0 && cur.flow.length < FLOW_MIN ? `En az ${FLOW_MIN} adım önerilir (şu an ${cur.flow.length}).` : undefined}
              >
                <PairList
                  idPrefix={`svc-flow-${fxLang}`}
                  items={cur.flow}
                  onChange={(v) => setLang('flow', v)}
                  labels={['Adım başlığı', 'Açıklama']}
                  placeholders={['ör. Tarama', 'ör. Çok açıdan çekim ve hizalama']}
                  max={FLOW_MAX}
                  numbered
                  disabled={disabled}
                />
              </ListBlock>

              <ListBlock
                title="Teknik sınırlar"
                help={cur.spec.length === 0 && fallback ? `Boş bırakılırsa katalogdaki ${fallback.spec.length} satır kullanılır.` : 'Etiket – değer satırları (ör. Tolerans – ±0,05 mm).'}
              >
                <PairList
                  idPrefix={`svc-spec-${fxLang}`}
                  items={cur.spec}
                  onChange={(v) => setLang('spec', v)}
                  labels={['Etiket', 'Değer']}
                  placeholders={['ör. Tolerans', 'ör. ±0,05 mm']}
                  max={LIST_MAX}
                  disabled={disabled}
                />
              </ListBlock>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Alt bileşenler */

function SiteStatus({ kind, slug, slugValid }: { kind: 'listed' | 'off'; slug: string; slugValid: boolean }) {
  const listed = kind === 'listed';
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border p-3 text-xs',
        listed ? 'border-success/30 bg-success/10 text-foreground' : 'border-border bg-muted/50 text-muted-foreground',
      )}
    >
      {listed ? <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" /> : <Info className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1 leading-relaxed">
        {listed ? (
          <>
            <strong className="font-semibold">Sitede listeleniyor.</strong>{' '}
            {slugValid && (
              <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {FX_LOCALES.map((l) => (
                  <a
                    key={l}
                    href={`/${l}/services/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-primary underline-offset-4 hover:underline"
                  >
                    /{l}/services/{slug}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">(yeni sekmede açılır)</span>
                  </a>
                ))}
              </span>
            )}
          </>
        ) : (
          <>
            <strong className="font-semibold">Sitede listelenmiyor.</strong> Kayıt panelde kalır.{' '}
            {slugValid && 'Göstermek için "Sitede göster"i açın ve kaydı aktif tutun.'}
          </>
        )}
      </div>
    </div>
  );
}

function ListBlock({ title, help, warn, children }: { title: string; help: string; warn?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{title}</legend>
      <p className="text-xs text-muted-foreground">{help}</p>
      {warn && <p className="text-xs text-warning">{warn}</p>}
      {children}
    </fieldset>
  );
}

function RowTools({ index, count, onMove, onRemove, label, disabled }: {
  index: number; count: number; onMove: (from: number, to: number) => void; onRemove: () => void; label: string; disabled?: boolean;
}) {
  const btn = 'p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none';
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={btn} onClick={() => onMove(index, index - 1)} disabled={disabled || index === 0} aria-label={`${label} yukarı taşı`}>
        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" className={btn} onClick={() => onMove(index, index + 1)} disabled={disabled || index === count - 1} aria-label={`${label} aşağı taşı`}>
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" className={cn(btn, 'hover:text-destructive hover:bg-destructive/10')} onClick={onRemove} disabled={disabled} aria-label={`${label} sil`}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
};

function StringList({ idPrefix, items, onChange, itemLabel, placeholder, max, disabled }: {
  idPrefix: string; items: string[]; onChange: (v: string[]) => void; itemLabel: string; placeholder: string; max: number; disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={`${idPrefix}-${i}`} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-center text-xs font-medium text-muted-foreground">{i + 1}</span>
          <Input
            id={`${idPrefix}-${i}`}
            value={it}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={placeholder}
            aria-label={`${itemLabel} ${i + 1}`}
            maxLength={200}
            disabled={disabled}
          />
          <RowTools
            index={i}
            count={items.length}
            label={`${itemLabel} ${i + 1}`}
            onMove={(a, b) => onChange(move(items, a, b))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
            disabled={disabled}
          />
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...items, ''])} disabled={disabled || items.length >= max} className="text-primary">
        <Plus aria-hidden="true" />
        Madde ekle
      </Button>
    </div>
  );
}

function PairList({ idPrefix, items, onChange, labels, placeholders, max, numbered, disabled }: {
  idPrefix: string; items: Pair[]; onChange: (v: Pair[]) => void; labels: [string, string]; placeholders: [string, string];
  max: number; numbered?: boolean; disabled?: boolean;
}) {
  const setCell = (i: number, c: 0 | 1, v: string) =>
    onChange(items.map((p, j) => (j === i ? ((c === 0 ? [v, p[1]] : [p[0], v]) as Pair) : p)));
  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="hidden items-center gap-2 pl-7 pr-[92px] text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:flex">
          <span className="w-2/5">{labels[0]}</span>
          <span className="flex-1">{labels[1]}</span>
        </div>
      )}
      {items.map((p, i) => (
        <div key={`${idPrefix}-${i}`} className="flex items-start gap-2 sm:items-center">
          <span className="mt-2.5 w-5 shrink-0 text-center text-xs font-medium text-muted-foreground sm:mt-0">{numbered ? String(i + 1).padStart(2, '0') : i + 1}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
            <Input
              value={p[0]}
              onChange={(e) => setCell(i, 0, e.target.value)}
              placeholder={placeholders[0]}
              aria-label={`${labels[0]} ${i + 1}`}
              maxLength={80}
              disabled={disabled}
              className="sm:w-2/5"
            />
            <Input
              value={p[1]}
              onChange={(e) => setCell(i, 1, e.target.value)}
              placeholder={placeholders[1]}
              aria-label={`${labels[1]} ${i + 1}`}
              maxLength={200}
              disabled={disabled}
              className="sm:flex-1"
            />
          </div>
          <RowTools
            index={i}
            count={items.length}
            label={`Satır ${i + 1}`}
            onMove={(a, b) => onChange(move(items, a, b))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
            disabled={disabled}
          />
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...items, ['', '']])} disabled={disabled || items.length >= max} className="text-primary">
        <Plus aria-hidden="true" />
        Satır ekle {items.length >= max && `(en fazla ${max})`}
      </Button>
    </div>
  );
}
