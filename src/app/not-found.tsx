'use client'

import StatusTemplate from '@/templates/StatusTemplate'
import { useLocale } from '@/hooks/useLocale'

export default function NotFound() {
  const lang = useLocale()

  return (
    <StatusTemplate
      code="404"
      title="Sayfa bulunamadı"
      description="Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir."
      actionLabel="Portfolyoya git"
      actionHref={`/${lang}/portfolio`}
    />
  )
}
