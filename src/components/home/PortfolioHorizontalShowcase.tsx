'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { StickyStack } from '@/components/motion/StickyStack'
import { useLocale } from '@/hooks/useLocale'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/skeletons'

interface PortfolioProject {
  _id: string
  title: string
  slug: string
  description: string
  coverImage: string
  client?: string
  completionDate?: string
}

export default function PortfolioHorizontalShowcase() {
  const lang = useLocale()
  const { t } = useAppTranslations('home')
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/public/portfolio?limit=4')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setProjects(Array.isArray(data) ? data : data.data || data.items || [])
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24" aria-label={t('portfolio.title')}>
        <div className="container-main">
          <SkeletonGrid count={4} label={t('portfolio.loading')} className="grid-cols-1 md:grid-cols-2" />
        </div>
      </section>
    )
  }

  if (!projects.length) {
    return (
      <section className="py-16 md:py-24" aria-label={t('portfolio.title')}>
        <div className="container-main">
          <EmptyState title={t('portfolio.empty')} description={t('portfolio.emptyDescription')} />
        </div>
      </section>
    )
  }

  const cards = projects.map((project) => (
    <div
      key={project._id}
      className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden border border-border bg-card md:flex-row"
    >
      <div className="relative aspect-video w-full md:aspect-auto md:w-1/2 md:min-h-[420px]">
        {project.coverImage ? (
          <Image src={project.coverImage} alt={project.title} fill className="object-cover" sizes="50vw" />
        ) : (
          <div className="absolute inset-0 bg-secondary" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
        <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{project.title}</h3>
        <p className="mt-4 line-clamp-3 text-muted-foreground">{project.description}</p>
        <Link
          href={`/${lang}/portfolio/${project.slug || project._id}`}
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          {t('portfolio.viewProject', { defaultValue: 'Projeyi incele' })}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  ))

  return (
    <section className="relative border-y border-border bg-background" aria-label={t('portfolio.title')}>
      <div className="container-main py-16 md:py-20">
        <h2 className="section-title max-w-3xl">{t('portfolio.title')}</h2>
      </div>
      <StickyStack cards={cards} />
    </section>
  )
}
