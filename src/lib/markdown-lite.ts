/**
 * Cults3D açıklamaları için küçük Markdown → HTML dönüştürücü.
 * Başlık, liste, tablo, yatay çizgi, paragraf; satır içi kalın/italik/kod/bağlantı.
 * Girdideki tüm HTML önce kaçırılır, bağlantılar yalnızca http(s) olabilir; çıktı güvenlidir.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer nofollow">$1</a>')
}

const HEADING = /^(#{1,6})\s+(.*)$/
const LIST = /^\s*([-*+]|\d+[.)])\s+(.*)$/
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
const cells = (l: string) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => inline(c.trim()))

/** `dropTitle`: ilk satırdaki "# Başlık" atlanır (sayfa başlığı zaten gösteriliyor) */
export function markdownToHtml(md: string, { dropTitle = false } = {}): string {
  const lines = md.replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  const isTable = (n: number) => lines[n]?.includes('|') && TABLE_SEP.test(lines[n + 1] ?? '')
  let i = 0
  if (dropTitle) {
    while (i < lines.length && !lines[i].trim()) i++
    if (/^#\s/.test(lines[i] ?? '')) i++
  }
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    const h = HEADING.exec(line)
    if (h) {
      // Sayfada h1 başlık, h2 bölüm başlığı var: açıklama başlıkları h3/h4 olur
      const lvl = h[1].length <= 2 ? 3 : 4
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`)
      i++
    } else if (RULE.test(line)) {
      out.push('<hr>')
      i++
    } else if (isTable(i)) {
      const head = cells(line)
      const rows: string[][] = []
      for (i += 2; i < lines.length && lines[i].includes('|') && lines[i].trim(); i++) rows.push(cells(lines[i]))
      out.push(`<div class="fx-table-wrap"><table><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)
    } else if (LIST.test(line)) {
      const tag = /^\s*\d/.test(line) ? 'ol' : 'ul'
      const items: string[] = []
      for (; i < lines.length && LIST.test(lines[i]); i++) items.push(`<li>${inline(LIST.exec(lines[i])![2])}</li>`)
      out.push(`<${tag}>${items.join('')}</${tag}>`)
    } else {
      const para: string[] = []
      for (; i < lines.length && lines[i].trim() && !HEADING.test(lines[i]) && !LIST.test(lines[i]) && !RULE.test(lines[i]) && !isTable(i); i++) {
        para.push(inline(lines[i].replace(/^>\s?/, '').trim()))
      }
      out.push(`<p>${para.join('<br>')}</p>`)
    }
  }
  return out.join('\n')
}
