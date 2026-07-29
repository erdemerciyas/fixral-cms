'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Search, FileText, Image as ImageIcon, Box, Layers } from 'lucide-react'
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
import { CommandPalette } from '@/components/admin/command-palette'
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
  portfolio: 'Portfolyo',
  categories: 'Kategoriler',
  models: '3D Modeller',
  media: 'Medya',
  videos: 'Videolar',
  slider: 'Slider',
  footer: 'Alt Bilgi',
  seo: 'SEO',
  'social-media': 'Sosyal Medya',
  analytics: 'Analitik',
  users: 'Kullanıcılar',
  'site-settings': 'Site Ayarları',
  settings: 'Ayarlar',
  sitemap: 'Sitemap',
  languages: 'Dil Ayarları',
  messages: 'Mesajlar',
  contact: 'İletişim',
  profile: 'Profil',
  backup: 'Yedekleme',
  content: 'İçerik',
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
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="contents">
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="min-w-0">
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="truncate">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="hidden truncate sm:block">
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Komut paleti tetikleyici: masaüstünde arama kutusu, mobilde ikon */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPaletteOpen(true)}
          className="hidden h-8 w-56 justify-start gap-2 px-3 text-muted-foreground md:inline-flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-sm font-normal">Ara veya komut çalıştır...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPaletteOpen(true)}
          aria-label="Komut paletini aç"
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Yeni İçerik</span>
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
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  )
}
