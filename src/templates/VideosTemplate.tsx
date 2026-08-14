'use client'

import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import VideosClient from '@/components/videos/VideosClient'

interface VideosTemplateProps {
  title: string
  description: string
}

export default function VideosTemplate({ title, description }: VideosTemplateProps) {
  return (
    <PageShell>
      <div className="container-main">
        <PageHeader title={title} description={description} kinetic={false} />
      </div>
      <Section variant="editorial">
        <VideosClient />
      </Section>
    </PageShell>
  )
}
