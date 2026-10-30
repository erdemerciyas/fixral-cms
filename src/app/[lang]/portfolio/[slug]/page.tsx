import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Portfolio from '@/models/Portfolio';
import Category from '@/models/Category';
import { PortfolioItem } from '@/types/portfolio';
import { SITE_URL, getPortfolioAlternates, generateOgImages } from '@/lib/seo-utils';
import { stripHtmlTags } from '@/lib/security-utils';
import { normalizeCategoryList, normalizeProject, type PfProject } from '@/components/portfolio/portfolio-data';
import PortfolioDetailClient from './PortfolioDetailClient';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string; lang: string }>;
}

async function getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
  try {
    const item = await Portfolio.findOne({ slug, isActive: true })
      .populate('categoryIds', 'name slug')
      .lean();
    if (!item) return null;
    return JSON.parse(JSON.stringify(item)) as PortfolioItem;
  } catch (error) {
    // Veritabanına ulaşılamazsa sayfa çökmez; 404 durumuna düşer
    console.error('Portfolio detail fetch error:', error);
    return null;
  }
}

/** Sonraki proje + benzer projeler için aktif projelerin hafif listesi (en yeni önce) */
async function getProjectIndex(): Promise<PortfolioItem[]> {
  try {
    const items = await Portfolio.find({ isActive: true })
      .select('slug title description coverImage images client completionDate technologies categoryIds category translations createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return JSON.parse(JSON.stringify(items)) as PortfolioItem[];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const result = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    return normalizeCategoryList(JSON.parse(JSON.stringify(result)));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const items = await Portfolio.find({ isActive: true }).select('slug').lean();
    return items.map(item => ({ lang: 'tr', slug: (item as { slug: string }).slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItem(slug);

  if (!item) {
    return { title: 'Not Found', robots: { index: false, follow: false } };
  }

  const ogImages = item.coverImage
    ? [{ url: item.coverImage, width: 1200, height: 630, alt: item.title }]
    : generateOgImages(undefined, item.title);

  return {
    title: `${item.title} | Fixral Portfolyo`,
    description: stripHtmlTags(item.description || '').slice(0, 160),
    alternates: getPortfolioAlternates(slug),
    openGraph: {
      title: `${item.title} | Fixral Portfolyo`,
      description: stripHtmlTags(item.description || '').slice(0, 160),
      url: `${SITE_URL}/tr/portfolio/${slug}`,
      type: 'article',
      images: ogImages,
    },
  };
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const lang = 'tr';
  const slug = decodeURIComponent(rawSlug);
  const [portfolioItem, index, categories] = await Promise.all([
    getPortfolioItem(slug),
    getProjectIndex(),
    getCategories(),
  ]);

  const project = normalizeProject(portfolioItem, lang, categories);
  if (!project) {
    notFound();
  }

  const list = index
    .map((raw) => normalizeProject(raw, lang, categories))
    .filter((p): p is PfProject => p !== null)
    .map((p) => ({ ...p, content: undefined, models3D: [], images: p.images.slice(0, 1) }));

  // Sonraki proje: listede bir sonraki (sonda ise başa döner)
  const pos = list.findIndex((p) => p.slug === project.slug);
  const others = list.filter((p) => p.slug !== project.slug);
  const next = others.length ? (pos >= 0 ? list[(pos + 1) % list.length] : others[0]) : null;

  // Benzer projeler: ortak kategori önce, kalanı en yeniler; sonraki proje tekrar edilmez
  const catSlugs = new Set(project.categories.map((c) => c.slug));
  const pool = others.filter((p) => p.slug !== next?.slug);
  const related = [
    ...pool.filter((p) => p.categories.some((c) => catSlugs.has(c.slug))),
    ...pool.filter((p) => !p.categories.some((c) => catSlugs.has(c.slug))),
  ].slice(0, 3);

  return (
    <PortfolioDetailClient
      project={project}
      next={next && next.slug !== project.slug ? next : null}
      related={related}
      slug={slug}
      lang={lang}
    />
  );
}
