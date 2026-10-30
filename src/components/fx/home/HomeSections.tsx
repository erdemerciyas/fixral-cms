'use client'

/**
 * Anasayfa bölümleri: seçili işler, yazılımlar, teslimat, haberler/videolar,
 * teklif bandı. Proje ve haberler yönetim panelinden (public API) gelir.
 */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { newsBase, softwareHref, toFxLocale } from '@/content/fixral'
import type { FxSoftware } from '@/content/fx-data'
import { useFx } from '../FxData'
import { isEmail, sendQuote } from '@/lib/fx-quote'
import { FxSectionHead } from '../FxSectionHead'
import { ArrowRight, ExternalIcon, GithubIcon, ServiceIcon } from '../FxIcons'
import { PostCard, WorkCard, WORK_SPANS, pickTranslation, stripHtml, type PostCardData, type WorkCardData } from '../FxCards'
import { SoftwareVisual } from '../FxVisuals'

/* ------------------------------------------------------------- Seçili işler */

interface PortfolioItem {
  _id?: string
  id?: string
  title: string
  slug?: string
  description?: string
  coverImage?: string
  client?: string
  completionDate?: string
  technologies?: string[]
  categories?: { name: string }[]
  category?: { name: string } | string
  translations?: Record<string, { title?: string; description?: string }>
}

export function toWorkCard(p: PortfolioItem, lang: string): WorkCardData {
  const t = pickTranslation(p as PortfolioItem & Record<string, unknown>, lang)
  const cats = p.categories?.map((c) => c.name) ?? (typeof p.category === 'object' && p.category ? [p.category.name] : typeof p.category === 'string' && p.category ? [p.category] : [])
  const year = p.completionDate ? String(new Date(p.completionDate).getFullYear() || '').replace('NaN', '') : ''
  return {
    href: `/${lang}/portfolio/${p.slug || p._id || p.id}`,
    title: t.title,
    summary: stripHtml(t.description).slice(0, 160),
    image: p.coverImage || undefined,
    tags: cats.map((c) => c.toUpperCase()),
    metaLeft: p.client || (p.technologies || []).slice(0, 2).join(' · '),
    metaRight: year,
  }
}

export function WorksSection({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx')
  const head = useFx(lang).section('works')
  const [items, setItems] = useState<PortfolioItem[] | null>(null)
  useEffect(() => {
    let off = false
    fetch('/api/public/portfolio?limit=4')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (!off) setItems(Array.isArray(data) ? data : data.data || data.items || []) })
      .catch(() => { if (!off) setItems([]) })
    return () => { off = true }
  }, [])
  const list = (items || []).slice(0, 4)
  const spans = list.length === 4 ? [8, 4, 4, 8] : list.length === 3 ? [8, 4, 12] : list.length === 2 ? [6, 6] : [12]
  return (
    <section className="fx-sec fx-sec--alt fx-sec--ruled" aria-labelledby="fx-works-title">
      <div className="fx-wrap">
        <FxSectionHead
          id="fx-works-title"
          eyebrow={head.eyebrow}
          title={head.title}
          aside={<Link className="fx-link" href={`/${lang}/portfolio`}>{t('works.all')} <ArrowRight /></Link>}
        />
        {items === null ? (
          <div className="fx-works" aria-busy="true" aria-label={t('common.loading')}>
            {[8, 4, 4, 8].map((s, i) => <div key={i} className={`fx-work fx-skel ${s === 8 ? 'fx-work--wide' : 'fx-work--s4'}`}><div className="fx-work__img" /></div>)}
          </div>
        ) : list.length === 0 ? (
          <div className="fx-empty">
            <b>{t('works.empty')}</b>
            <span>{t('works.emptyBody')}</span>
          </div>
        ) : (
          <div className="fx-works">
            {list.map((p, i) => (
              <WorkCard key={p._id || p.id || p.slug || i} data={toWorkCard(p, lang)} span={spans[i] as 4 | 6 | 8 | 12} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
export { WORK_SPANS }

/* ----------------------------------------------------------------- Yazılımlar */

export function useSoftwareLabels(lang: string) {
  const { t } = useAppTranslations('fx')
  const L = toFxLocale(lang)
  return (s: FxSoftware) => ({
    label: s.viz === 'split' ? t('software.splitLabel') : s.viz === 'toolpath' ? t('software.toolpathLabel') : t('software.gaugeLabel'),
    hud: s.viz === 'split' ? t('software.build') : undefined,
    gauge: { rpm: 'RPM', speed: 'KM/H', coolant: 'SU °C', volt: 'AKÜ V' },
  })
}

export function SoftwareCard({ sw, lang, feature }: { sw: FxSoftware; lang: string; feature?: boolean }) {
  const { t } = useAppTranslations('fx')
  const L = toFxLocale(lang)
  const tx = sw.text[L]
  const v = useSoftwareLabels(lang)(sw)
  return (
    <article className={`fx-sw-card ${feature ? 'fx-sw-card--feature' : ''}`}>
      <SoftwareVisual viz={sw.viz} label={v.label} hud={v.hud} gaugeLabels={v.gauge} />
      <div className="fx-sw-card__body">
        <div className="fx-sw-card__top">
          <span className="fx-eyebrow">{tx.kicker}</span>
          <span className="fx-tag">{tx.status}{sw.version ? ` · v${sw.version}` : ''}</span>
        </div>
        <h3><Link href={softwareHref(lang, sw)}>{sw.name}</Link></h3>
        <p>{feature ? tx.lede : tx.tagline}</p>
        {tx.chips.length > 0 && <div className="fx-badges">{tx.chips.map((c, n) => <span key={n} className="fx-badge">{c}</span>)}</div>}
        <div className="fx-sw-card__foot">
          <Link className="fx-link" href={softwareHref(lang, sw)}>{t('software.details')} <ArrowRight /></Link>
          {sw.url ? (
            <a className="fx-link" href={sw.url} target="_blank" rel="noopener noreferrer">{t('software.open')} <ExternalIcon /></a>
          ) : sw.repo ? (
            <a className="fx-link" href={sw.repo} target="_blank" rel="noopener noreferrer"><GithubIcon /> {t('software.github')}</a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function SoftwareSection({ lang }: { lang: string }) {
  const fx = useFx(lang)
  const head = fx.section('software')
  const [a, ...rest] = fx.software
  if (!a) return null
  return (
    <section className="fx-sec" id="yazilimlar" aria-labelledby="fx-sw-title">
      <div className="fx-wrap">
        <FxSectionHead id="fx-sw-title" eyebrow={head.eyebrow} title={head.title} aside={head.lede ? <p className="fx-lede fx-lede--narrow">{head.lede}</p> : undefined} />
        <div className={`fx-sw-grid ${rest.length ? '' : 'fx-sw-grid--solo'}`}>
          <SoftwareCard sw={a} lang={lang} feature />
          {rest.length > 0 && (
            <div className="fx-sw-stack">
              {rest.map((sw) => <SoftwareCard key={sw.slug} sw={sw} lang={lang} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- Teslimat */

export function DeliverablesSection({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const { L } = fx
  const head = fx.section('deliv')
  const docs = fx.site.docs
  const [docId, setDoc] = useState<string>(docs[0]?.id ?? '')
  const [shown, setShown] = useState(3)
  const doc = docs.find((d) => d.id === docId) ? docId : docs[0]?.id ?? ''
  const lines = docs.find((d) => d.id === doc)?.lines ?? []
  const reduced = useRef(false)
  useEffect(() => { reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches }, [])
  useEffect(() => {
    if (reduced.current) { setShown(lines.length); return }
    setShown(3)
    const id = window.setInterval(() => setShown((n) => { if (n >= lines.length) { window.clearInterval(id); return n } return n + 1 }), 260)
    return () => window.clearInterval(id)
  }, [doc, lines.length])
  return (
    <section className="fx-sec fx-sec--alt" aria-labelledby="fx-deliv-title">
      <div className="fx-wrap fx-deliv">
        <div className="fx-stack-28">
          <div className="fx-callout">
            <div className="fx-callout__ref"><span className="fx-eyebrow">{head.eyebrow}</span></div>
            <h2 className="fx-h2" id="fx-deliv-title">{head.title}</h2>
            {head.lede && <p className="fx-lede">{head.lede}</p>}
          </div>
          <div className="fx-files">
            {fx.site.deliverables[L].map(([a, b], i) => <div key={`${a}-${i}`} className="fx-file"><b>{a}</b><span>{b}</span></div>)}
          </div>
        </div>
        <div className="fx-term" aria-label={t('deliv.docLabel')}>
          <div className="fx-term__bar">
            <div className="fx-term__tabs" role="tablist">
              {docs.map((d) => (
                <button key={d.id} type="button" role="tab" aria-selected={doc === d.id} onClick={() => setDoc(d.id)}>{d.file}</button>
              ))}
            </div>
            <span>UTF-8 · mm</span>
          </div>
          <pre role="tabpanel">
            {lines.slice(0, shown).map(([k, txt], i) => (
              <span key={i} className={`fx-${k}`}>{txt}{'\n'}</span>
            ))}
            {shown < lines.length && <span className="fx-caret" />}
          </pre>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- Haberler/video */

interface NewsItem { _id?: string; slug: string; translations?: Record<string, { title?: string; excerpt?: string; content?: string }>; title?: string; excerpt?: string; featuredImage?: { url: string }; publishedAt?: string; createdAt?: string }
interface VideoItem { videoId?: string; id?: string; title?: string; thumbnail?: string; publishedAt?: string; status?: string }

export function JournalSection({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx')
  const head = useFx(lang).section('journal')
  const L = toFxLocale(lang)
  const [posts, setPosts] = useState<PostCardData[] | null>(null)
  useEffect(() => {
    let off = false
    const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : undefined)
    const news = fetch('/api/public/news?status=published&limit=3&sortBy=publishedAt&sortOrder=desc')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const items: NewsItem[] = data?.data?.items || data?.items || data?.data || []
        return (Array.isArray(items) ? items : []).map((n): PostCardData => {
          const tr = n.translations?.[L] || n.translations?.tr || {}
          return { href: `${newsBase(L)}/${n.slug}`, title: tr.title || n.title || '', summary: stripHtml(tr.excerpt || tr.content || n.excerpt).slice(0, 140), image: n.featuredImage?.url, kind: 'HABER', date: fmt(n.publishedAt || n.createdAt) }
        })
      })
      .catch(() => [] as PostCardData[])
    const videos = fetch('/api/public/youtube?limit=3&status=visible')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const items: VideoItem[] = data?.videos || data?.data?.videos || data?.items || data?.data || []
        return (Array.isArray(items) ? items : []).slice(0, 3).map((v): PostCardData => {
          const id = v.videoId || v.id || ''
          return { href: `https://www.youtube.com/watch?v=${id}`, external: true, title: v.title || '', image: v.thumbnail && /^https:\/\/i\.ytimg\.com\//.test(v.thumbnail) ? v.thumbnail : undefined, kind: 'VİDEO', date: fmt(v.publishedAt), video: true }
        })
      })
      .catch(() => [] as PostCardData[])
    Promise.all([news, videos]).then(([n, v]) => {
      if (off) return
      const mixed: PostCardData[] = []
      for (let i = 0; mixed.length < 3 && (i < n.length || i < v.length); i++) {
        if (n[i]) mixed.push(n[i])
        if (v[i] && mixed.length < 3) mixed.push(v[i])
      }
      setPosts(mixed.filter((p) => p.title))
    })
    return () => { off = true }
  }, [L])
  return (
    <section className="fx-sec" aria-labelledby="fx-journal-title">
      <div className="fx-wrap">
        <FxSectionHead
          id="fx-journal-title"
          eyebrow={head.eyebrow}
          title={head.title}
          aside={
            <div className="fx-inline-links">
              <Link className="fx-link" href={newsBase(L)}>{t('journal.all')} <ArrowRight /></Link>
              <Link className="fx-link" href={`/${L}/videos`}>{t('journal.videos')} <ArrowRight /></Link>
            </div>
          }
        />
        {posts === null ? (
          <div className="fx-journal" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="fx-post fx-skel"><div className="fx-post__thumb" /></div>)}</div>
        ) : posts.length === 0 ? (
          <div className="fx-empty"><b>{t('journal.empty')}</b></div>
        ) : (
          <div className="fx-journal">{posts.map((p, i) => <PostCard key={p.href + i} data={p} />)}</div>
        )}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Teklif bandı */

export function QuoteBand({ lang, presetService }: { lang: string; presetService?: string }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const { L } = fx
  const head = fx.section('quote')
  const [sel, setSel] = useState<string[]>(presetService ? [presetService] : [])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [qty, setQty] = useState('')
  const [msg, setMsg] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [err, setErr] = useState<string | null>(null)
  const toggle = (k: string) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (name.trim().length < 2) { setErr(t('quote.nameRequired')); return }
    if (!isEmail(email)) { setErr(t('quote.emailInvalid')); return }
    setState('sending')
    const res = await sendQuote({ name: name.trim(), email: email.trim(), quantity: qty, services: sel.map((k) => fx.service(k)?.text.tr.name || k), message: msg.trim() || '-', source: 'home' })
    setState(res.ok ? 'done' : 'error')
  }
  return (
    <section className="fx-sec public-theme public-dark fx-sec--quote" aria-labelledby="fx-quote-title">
      <div className="fx-wrap fx-quote">
        <div className="fx-stack-22">
          <div className="fx-callout__ref"><span className="fx-eyebrow">{head.eyebrow}</span></div>
          <h2 className="fx-h1" id="fx-quote-title">{head.title}</h2>
          {head.lede && <p className="fx-lede">{head.lede}</p>}
        </div>
        <form className="fx-form" onSubmit={submit} noValidate>
          <fieldset className="fx-field fx-fieldset">
            <legend className="fx-lbl">{t('quote.need')}</legend>
            <div className="fx-chips">
              {fx.services.map((s) => (
                <button key={s.key} type="button" className="fx-chip" aria-pressed={sel.includes(s.key)} onClick={() => toggle(s.key)}>
                  <ServiceIcon name={s.icon} />
                  {s.text[L].name}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="fx-row2">
            <div className="fx-field"><label htmlFor="fxq-name">{t('quote.name')}</label><input id="fxq-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="fx-field"><label htmlFor="fxq-mail">{t('quote.email')}</label><input id="fxq-mail" type="email" autoComplete="email" placeholder={t('quote.emailPh')} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          </div>
          <div className="fx-row2">
            <div className="fx-field"><label htmlFor="fxq-qty">{t('quote.qty')}</label><input id="fxq-qty" inputMode="numeric" placeholder="1" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
            <div className="fx-field fx-field--end"><Link className="fx-link" href={`/${L}/contact`}>{t('quote.more')} <ArrowRight /></Link></div>
          </div>
          <div className="fx-field"><label htmlFor="fxq-msg">{t('quote.msg')}</label><textarea id="fxq-msg" placeholder={t('quote.msgPh')} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
          {err && <p className="fx-form__err" role="alert">{err}</p>}
          <div className="fx-form-actions">
            <span />
            <button className="fx-btn fx-btn--primary" type="submit" disabled={state === 'sending' || state === 'done'}>
              {state === 'sending' ? t('quote.sending') : t('quote.submit')} <ArrowRight />
            </button>
          </div>
          {state === 'done' && <div className="fx-notice" role="status"><b>{t('quote.done')}</b><span className="fx-small fx-muted">{t('quote.doneBody')}</span></div>}
          {state === 'error' && <div className="fx-notice fx-notice--err" role="alert"><b>{t('quote.error')}</b></div>}
        </form>
      </div>
    </section>
  )
}
