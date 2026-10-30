import type { ReactNode } from 'react'

/**
 * Bölüm başlığı — teknik resim çağrısı: turuncu eyebrow + çizgi, başlık,
 * sağda açıklama ya da bağlantı. Yapı bilgisi taşır, süs değildir.
 */
export function FxSectionHead({ id, eyebrow, title, aside, level = 2 }: { id?: string; eyebrow: string; title: ReactNode; aside?: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? 'h2' : 'h3'
  return (
    <div className="fx-sec-head">
      <div className="fx-callout">
        <div className="fx-callout__ref">
          <span className="fx-eyebrow">{eyebrow}</span>
        </div>
        <H className="fx-h2" id={id}>
          {title}
        </H>
      </div>
      {aside}
    </div>
  )
}
