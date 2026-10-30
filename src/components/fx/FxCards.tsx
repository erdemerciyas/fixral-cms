'use client'

/**
 * Ortak FIXRAL kartları — proje (WorkCard) ve haber/video (PostCard).
 * Görsel yoksa marka işaretli teknik yer tutucu gösterilir.
 */
import Image from 'next/image'
import Link from 'next/link'
import { FxMark } from './FxLogo'
import { PlayIcon } from './FxIcons'

export interface WorkCardData {
  href: string
  title: string
  summary?: string
  image?: string
  tags?: string[]
  metaLeft?: string
  metaRight?: string
}

export type WorkSpan = 4 | 6 | 8 | 12
const spanClass = (s?: WorkSpan) => (s === 8 ? 'fx-work--wide' : s === 6 ? 'fx-work--s6' : s === 4 ? 'fx-work--s4' : s === 12 ? 'fx-work--s12' : '')
/** Masonry ritmi (8/4/4/8/6/6) — eski portfolyo şablonundaki 6'lı döngü korunur */
export const WORK_SPANS: WorkSpan[] = [8, 4, 4, 8, 6, 6]

export function WorkPlaceholder() {
  return (
    <span className="fx-work__ph" aria-hidden="true">
      <FxMark tone="light" />
    </span>
  )
}

export function WorkCard({ data, span, priority }: { data: WorkCardData; span?: WorkSpan; priority?: boolean }) {
  return (
    <Link className={`fx-work ${spanClass(span)}`} href={data.href}>
      <div className="fx-work__img">
        {data.image ? (
          <Image src={data.image} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 66vw" priority={priority} />
        ) : (
          <WorkPlaceholder />
        )}
        {data.tags && data.tags.length > 0 && <span className="fx-tag">{data.tags.slice(0, 3).join(' · ')}</span>}
        <span className="fx-scanline" aria-hidden="true" />
      </div>
      {(data.metaLeft || data.metaRight) && (
        <div className="fx-work__meta">
          <span>{data.metaLeft}</span>
          <span>{data.metaRight}</span>
        </div>
      )}
      <h3>{data.title}</h3>
      {data.summary && <p>{data.summary}</p>}
    </Link>
  )
}

export interface PostCardData {
  href: string
  external?: boolean
  title: string
  summary?: string
  image?: string
  kind: string
  date?: string
  video?: boolean
}

export function PostCard({ data }: { data: PostCardData }) {
  const inner = (
    <>
      <div className="fx-post__thumb">
        {data.image ? <Image src={data.image} alt="" fill sizes="(max-width: 960px) 100vw, 33vw" /> : <WorkPlaceholder />}
        {data.video && (
          <span className="fx-play" aria-hidden="true">
            <PlayIcon />
          </span>
        )}
      </div>
      <div className="fx-post__meta">
        <span>{data.kind}</span>
        {data.date && <span>{data.date}</span>}
      </div>
      <h3>{data.title}</h3>
      {data.summary && <p>{data.summary}</p>}
    </>
  )
  return data.external ? (
    <a className="fx-post" href={data.href} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <Link className="fx-post" href={data.href}>{inner}</Link>
  )
}

/** Çeviri alanı olan kayıtlarda aktif dilin metnini seçer */
export function pickTranslation<T extends Record<string, unknown>>(item: { translations?: unknown } & T, lang: string): T {
  const tr = item.translations as Record<string, Partial<T>> | undefined
  const loc = tr?.[lang]
  if (!loc) return item
  const merged = { ...item } as T
  for (const [k, v] of Object.entries(loc)) if (v) (merged as Record<string, unknown>)[k] = v
  return merged
}

export const stripHtml = (s?: string) => (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
