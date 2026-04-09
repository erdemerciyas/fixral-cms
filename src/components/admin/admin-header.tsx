'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, FileText, Image as ImageIcon, Box, Layers } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

const ID_PATTERN = /^[a-f0-9]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-/

function isObjectId(segment: string): boolean {
  return ID_PATTERN.test(segment)
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname
    .replace('/admin', '')
    .split('/')
    .filter(Boolean)

  const crumbs: { label: string; href: string }[] = []
  let currentPath = '/admin'

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    if (isObjectId(segment)) {
      crumbs.push({ label: '#' + segment.slice(0, 6), href: currentPath })
    } else {
      const label = ROUTE_LABELS[segment] || segment
      crumbs.push({ label, href: currentPath })
    }
  }

  return crumbs
}

const quickCreateActions = [
  { name: 'Haber Ekle', href: '/admin/news/create', icon: FileText },
  { name: 'Portfolyo Ekle', href: '/admin/portfolio/new', icon: ImageIcon },
  { name: 'Hizmet Ekle', href: '/admin/services/new', icon: Box },
  { name: 'Sayfa Ekle', href: '/admin/pages', icon: Layers },
]

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="hidden md:inline-flex">
              <Plus className="mr-1 h-4 w-4" />
              Yeni İçerik
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {quickCreateActions.map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                <Link href={action.href} className="flex items-center gap-2">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  {action.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
