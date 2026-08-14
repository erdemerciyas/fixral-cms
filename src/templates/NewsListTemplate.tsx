'use client'

import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import NewsListClient from '@/components/news/NewsListClient'

interface ArticleData {
  _id?: string
  slug: string
  tags?: string[]
  publishedAt?: Date | string
  createdAt: Date | string
  featuredImage?: { url: string; altText?: string }
  translations?: {
    tr?: { title: string; excerpt: string; content: string; keywords: string[] }
    es?: { title: string; excerpt: string; content: string; keywords: string[] }
  }
}

interface NewsListTemplateProps {
  title: string
  description?: string
  articles: ArticleData[]
  lang: string
  locale?: 'tr' | 'es'
  search: string
  tag: string
  total: number
  page: number
  totalPages: number
  allTags: string[]
  newsT: Record<string, string>
  commonT: Record<string, string>
}

export default function NewsListTemplate({
  title,
  description,
  ...clientProps
}: NewsListTemplateProps) {
  return (
    <PageShell>
      <div className="container-main">
        <PageHeader title={title} description={description} kinetic={false} />
      </div>
      <Section variant="editorial">
        <NewsListClient {...clientProps} />
      </Section>
    </PageShell>
  )
}
