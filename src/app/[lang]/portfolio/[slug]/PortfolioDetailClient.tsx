'use client';

/**
 * Proje detayı (redesign 2026) — prototip `PAGES.project(id)`.
 * PageHero → 5 hücreli proje künyesi (fx-case-meta) → 3D görüntüleyici /
 * görseller → zengin içerik (public-prose) → sonraki proje → benzer projeler → QuoteBand.
 */
import Link from 'next/link';
import PageHero from '@/components/common/PageHero';
import { WorkCard } from '@/components/fx/FxCards';
import { QuoteBand } from '@/components/fx/home/HomeSections';
import { FxSectionHead } from '@/components/fx/FxSectionHead';
import { ArrowRight, ExternalIcon, GithubIcon } from '@/components/fx/FxIcons';
import PortfolioMediaGallery from '@/components/portfolio/PortfolioMediaGallery';
import { usePfT } from '@/components/portfolio/usePfT';
import { clip, fmtMonthYear, stripTags, toProjectCard, upper, type PfProject } from '@/components/portfolio/portfolio-data';
import HTMLContent from '@/components/HTMLContent';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import PortfolioJsonLd from '@/components/seo/PortfolioJsonLd';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SITE_URL } from '@/lib/seo-utils';

interface Props {
  project: PfProject;
  next: PfProject | null;
  related: PfProject[];
  slug: string;
  lang: string;
}

const LEAD_P = /^\s*<p\b[^>]*>([\s\S]*?)<\/p>/i;

/**
 * Hero açıklaması ile gövde içeriğini ayırır; aynı metin iki kez gösterilmez.
 * Açıklama HTML ise ilk paragraf hero'ya çıkar, kalanı gövdede kalır.
 */
function splitCopy(p: PfProject): { lede?: string; body?: string } {
  const desc = p.description || '';
  const lead = desc.match(LEAD_P);
  const leadText = lead ? stripTags(lead[1]) : '';
  if (p.content) return { lede: p.excerpt || clip(leadText || stripTags(desc), 260) || undefined, body: p.content };
  if (p.excerpt) return { lede: p.excerpt, body: desc || undefined };
  if (lead && leadText) {
    const rest = desc.slice(lead[0].length).trim();
    if (leadText.length <= 320) return { lede: leadText, body: stripTags(rest) ? rest : undefined };
    return { lede: clip(leadText, 240), body: desc };
  }
  const text = stripTags(desc);
  if (text.length <= 320 && !/<[a-z]/i.test(desc)) return { lede: text || undefined, body: undefined };
  return { lede: clip(text, 240) || undefined, body: desc || undefined };
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export default function PortfolioDetailClient({ project, next, related, slug, lang }: Props) {
  const t = usePfT();
  const { t: tf } = useAppTranslations('fx');
  const { lede, body } = splitCopy(project);
  const href = (s: string) => `/${lang}/portfolio/${encodeURIComponent(s)}`;

  const eyebrow = project.categories.length
    ? project.categories.map((c) => c.name).join(' · ')
    : project.technologies.slice(0, 3).join(' · ') || t('eyebrow');

  const links = [
    project.projectUrl && { href: project.projectUrl, label: t('meta.live'), icon: <ExternalIcon /> },
    project.githubUrl && { href: project.githubUrl, label: t('meta.github'), icon: <GithubIcon /> },
    project.externalUrl && { href: project.externalUrl, label: `${t('meta.external')} · ${hostOf(project.externalUrl)}`, icon: <ExternalIcon /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  const date = fmtMonthYear(project.completionDate, lang);
  const cells = [
    project.client && { k: 'client', label: t('meta.client'), value: project.client },
    date && { k: 'date', label: t('meta.date'), value: date },
    project.categories.length > 0 && { k: 'cat', label: t('meta.category'), value: project.categories.map((c) => c.name).join(', ') },
    project.technologies.length > 0 && { k: 'tech', label: t('meta.tech'), value: project.technologies.join(' · ') },
    links.length > 0 && {
      k: 'link',
      label: t('meta.link'),
      value: (
        <span className="fx-pf-links">
          {links.map((l) => (
            <a key={l.href} className="fx-link" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.icon}
              {l.label}
            </a>
          ))}
        </span>
      ),
    },
  ].filter(Boolean) as { k: string; label: string; value: React.ReactNode }[];

  const images = Array.from(new Set([project.coverImage, ...project.images].filter((x): x is string => !!x)));
  const hasMedia = images.length > 0 || project.models3D.length > 0;

  return (
    <>
      <PageHero
        title={project.title}
        description={lede}
        badge={upper(eyebrow, lang)}
        featuredBadge={project.featured ? upper(t('featured'), lang) : undefined}
        crumbs={[
          { label: tf('nav.home'), href: `/${lang}` },
          { label: t('crumb'), href: `/${lang}/portfolio` },
          { label: project.title, href: href(project.slug) },
        ]}
      />

      <BreadcrumbsJsonLd
        items={[
          { name: tf('nav.home'), item: `/${lang}` },
          { name: t('crumb'), item: `/${lang}/portfolio` },
          { name: project.title, item: `/${lang}/portfolio/${slug}` },
        ]}
      />
      <PortfolioJsonLd
        name={project.title}
        description={clip(stripTags(project.excerpt || project.description), 200)}
        url={`${SITE_URL}/${lang}/portfolio/${slug}`}
        images={images}
        baseUrl={SITE_URL}
      />

      {(cells.length > 0 || hasMedia) && (
        <section className="fx-sec fx-sec--tight" aria-label={t('meta.label')}>
          <div className="fx-wrap fx-pf-case">
            {cells.length > 0 && (
              <dl className={`fx-case-meta fx-pf-meta fx-pf-meta--n${cells.length}`}>
                {cells.map((c) => (
                  <div key={c.k}>
                    <dt><small>{c.label}</small></dt>
                    <dd>{typeof c.value === 'string' ? <span>{c.value}</span> : c.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {hasMedia && (
              <PortfolioMediaGallery
                images={project.images}
                models3D={project.models3D}
                title={project.title}
                coverImage={project.coverImage}
              />
            )}
          </div>
        </section>
      )}

      {body && (
        <section className={`fx-sec fx-pf-body ${cells.length > 0 || hasMedia ? 'fx-pf-body--follow' : ''}`} aria-labelledby="fx-pf-notes">
          <div className="fx-wrap">
            <div className="fx-block">
              <h2 id="fx-pf-notes">{t('detailsTitle')}</h2>
              <div className="fx-block__body">
                <HTMLContent content={body} className="fx-pf-prose" />
              </div>
            </div>
          </div>
        </section>
      )}

      {next && (
        <section className="fx-sec fx-sec--alt fx-sec--tight fx-pf-next" aria-labelledby="fx-pf-next-title">
          <div className="fx-wrap fx-pf-next__in">
            <div className="fx-pf-next__copy">
              <span className="fx-tag">{upper(t('next'), lang)}</span>
              <Link id="fx-pf-next-title" href={href(next.slug)} className="fx-h2 fx-pf-next__title">
                {next.title}
              </Link>
            </div>
            <Link className="fx-btn fx-btn--ghost" href={href(next.slug)} aria-label={`${t('goNext')}: ${next.title}`}>
              {t('goNext')} <ArrowRight />
            </Link>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="fx-sec fx-pf-related" aria-labelledby="fx-pf-related-title">
          <div className="fx-wrap">
            <FxSectionHead
              id="fx-pf-related-title"
              eyebrow={t('relatedEyebrow')}
              title={t('relatedTitle')}
              aside={
                <Link className="fx-link" href={`/${lang}/portfolio`}>
                  {t('all')} <ArrowRight />
                </Link>
              }
            />
            <div className="fx-works">
              {related.map((p) => (
                <WorkCard key={p._id} data={toProjectCard(p, lang)} span={related.length === 3 ? 4 : related.length === 2 ? 6 : 12} />
              ))}
            </div>
          </div>
        </section>
      )}

      <QuoteBand lang={lang} />
    </>
  );
}
