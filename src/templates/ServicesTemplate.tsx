'use client'

import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import ServicesPageClient from '@/components/services/ServicesPageClient'

interface ServicesTemplateProps {
  title: string
  description: string
}

export default function ServicesTemplate({ title, description }: ServicesTemplateProps) {
  return (
    <PageShell>
      <div className="container-main">
        <PageHeader title={title} description={description} kinetic={false} />
      </div>
      <Section variant="default" id="services">
        <ServicesPageClient />
      </Section>
    </PageShell>
  )
}
