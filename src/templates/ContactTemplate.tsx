'use client'

import { PageShell } from '@/components/layout/PageShell'
import ContactClient from '@/app/[lang]/contact/ContactClient'

export default function ContactTemplate() {
  return (
    <PageShell>
      <ContactClient />
    </PageShell>
  )
}
