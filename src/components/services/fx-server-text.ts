/**
 * Sunucu bileşenleri için küçük `fx.*` metin okuyucu (metadata, JSON-LD).
 * İstemci tarafında `useAppTranslations('fx')` kullanılır; ikisi aynı
 * `messages/{tr,es}.json` dosyalarını okur.
 */
import { getMessages } from '@/i18n'

export type FxText = (key: string, params?: Record<string, string | number>) => string

export async function getFxText(lang: string, namespace = 'fx'): Promise<FxText> {
  const messages = (await getMessages(lang)) as Record<string, unknown>
  const root = messages[namespace]
  return (key, params) => {
    let node: unknown = root
    for (const k of key.split('.')) {
      if (node && typeof node === 'object' && k in (node as Record<string, unknown>)) node = (node as Record<string, unknown>)[k]
      else return key
    }
    if (typeof node !== 'string') return key
    return params ? node.replace(/\{(\w+)\}/g, (_, n: string) => (params[n] !== undefined ? String(params[n]) : `{${n}}`)) : node
  }
}

/** 160 karakteri aşmayan, kelime ortasında kesilmeyen meta açıklama */
export function clampDescription(text: string, max = 160): string {
  const s = text.replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  const cut = s.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`
}
