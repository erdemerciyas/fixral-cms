'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

const ThemeToggle = dynamic(
  () => import('@/components/admin/ThemeToggle'),
  { ssr: false, loading: () => null }
)

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Kontrol Paneli',
  news: 'Haberler',
  pages: 'Sayfalar',
  services: 'Hizmetler',
  products: 'Ürünler',
  'product-categories': 'Ürün Kategorileri',
  'product-reviews': 'Ürün Yorumları',
  'product-media': 'Ürün Medyası',
  orders: 'Siparişler',
  portfolio: 'Portfolyo',
  categories: 'Kategoriler',
  models: '3D Modeller',
  media: 'Medya',
  videos: 'Videolar',
  themes: 'Temalar',
  slider: 'Slider',
  footer: 'Alt Bilgi',
  plugins: 'Eklentiler',
  users: 'Kullanıcılar',
  'site-settings': 'Site Ayarları',
  settings: 'Ayarlar',
  sitemap: 'Sitemap',
  languages: 'Dil Ayarları',
  updates: 'Güncellemeler',
  messages: 'Mesajlar',
  contact: 'İletişim',
  profile: 'Profil',
  backup: 'Yedekleme',
  monitoring: 'İzleme',
  content: 'İçerik',
  editor: 'Editör',
  create: 'Oluştur',
  new: 'Yeni',
  edit: 'Düzenle',
  customize: 'Özelleştir',
  questions: 'Sorular',
  reviews: 'Yorumlar',
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname
    .replace('/admin', '')
    .split('/')
    .filter(Boolean)

  const crumbs: { label: string; href: string }[] = []
  let currentPath = '/admin'

  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = ROUTE_LABELS[segment] || segment
    crumbs.push({ label, href: currentPath })
  }

  return crumbs
}

export function AdminHeader() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname || '/admin/dashboard')

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="contents">
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button size="sm" asChild className="hidden md:inline-flex">
          <Link href="/admin/news/create">
            <Plus className="mr-1 h-4 w-4" />
            Yeni İçerik
          </Link>
        </Button>
      </div>
    </header>
  )
}
