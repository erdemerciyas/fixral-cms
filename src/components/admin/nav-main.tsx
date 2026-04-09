'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Box,
  Image as ImageIcon,
  Paintbrush,
  Settings,
  ChevronRight,
  Mail,
  Database,
} from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useSidebarCounts } from '@/hooks/use-sidebar-counts'

type NavChild = {
  name: string
  href: string
}

type NavItem = {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavChild[]
}

const ALERT_PATHS = ['/admin/messages']

const navigation: NavItem[] = [
  { name: 'Kontrol Paneli', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'İçerik Yönetimi',
    icon: FileText,
    children: [
      { name: 'Haberler', href: '/admin/news' },
      { name: 'Sayfalar', href: '/admin/pages' },
      { name: 'Hizmetler', href: '/admin/services' },
      { name: 'Tüm İçerikler', href: '/admin/content' },
    ],
  },
  {
    name: 'Portfolyo',
    icon: Box,
    children: [
      { name: 'Tüm Projeler', href: '/admin/portfolio' },
      { name: 'Kategoriler', href: '/admin/categories' },
      { name: '3D Modeller', href: '/admin/models' },
    ],
  },
  {
    name: 'Medya',
    icon: ImageIcon,
    children: [
      { name: 'Kütüphane', href: '/admin/media' },
      { name: 'Videolar', href: '/admin/videos' },
    ],
  },
  {
    name: 'Görünüm',
    icon: Paintbrush,
    children: [
      { name: 'Tema Özelleştir', href: '/admin/theme-customize' },
      { name: 'Slider', href: '/admin/slider' },
      { name: 'Alt Bilgi', href: '/admin/footer' },
    ],
  },
  {
    name: 'Sistem',
    icon: Settings,
    children: [
      { name: 'Site Ayarları', href: '/admin/site-settings' },
      { name: 'SEO Ayarları', href: '/admin/seo' },
      { name: 'Analitik', href: '/admin/analytics' },
      { name: 'Sosyal Medya', href: '/admin/social-media' },
      { name: 'İletişim Ayarları', href: '/admin/contact' },
      { name: 'Kullanıcılar', href: '/admin/users' },
      { name: 'Dil Ayarları', href: '/admin/languages' },
      { name: 'Sitemap', href: '/admin/sitemap' },
    ],
  },
  {
    name: 'Yedekleme & İzleme',
    icon: Database,
    children: [
      { name: 'Dışa Aktar', href: '/admin/backup' },
    ],
  },
  {
    name: 'İletişim',
    icon: Mail,
    children: [
      { name: 'Mesajlar', href: '/admin/messages' },
    ],
  },
]

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/admin/dashboard') return pathname === href
  return pathname.startsWith(href)
}

export function NavMain() {
  const pathname = usePathname()
  const counts = useSidebarCounts()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Yönetim</SidebarGroupLabel>
      <SidebarMenu>
        {navigation.map((item) => {
          if (item.children) {
            const groupActive = item.children.some((c) => isActive(pathname, c.href))

            return (
              <Collapsible key={item.name} asChild defaultOpen={groupActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.name} isActive={groupActive}>
                      <item.icon />
                      <span>{item.name}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((child) => {
                        const active = isActive(pathname, child.href)
                        const count = counts[child.href] || 0
                        const isAlert = ALERT_PATHS.includes(child.href)

                        return (
                          <SidebarMenuSubItem key={child.name}>
                            <SidebarMenuSubButton asChild isActive={active}>
                              <Link href={child.href}>
                                <span>{child.name}</span>
                                {count > 0 && (
                                  <span
                                    className={cn(
                                      'ml-auto flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums',
                                      isAlert
                                        ? 'bg-destructive text-destructive-foreground'
                                        : 'text-sidebar-foreground/70'
                                    )}
                                  >
                                    {count}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          const active = isActive(pathname, item.href || '')
          const count = item.href ? counts[item.href] || 0 : 0
          const isAlert = item.href ? ALERT_PATHS.includes(item.href) : false

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild tooltip={item.name} isActive={active}>
                <Link href={item.href || '#'}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              {count > 0 && (
                <SidebarMenuBadge
                  className={
                    isAlert
                      ? 'bg-destructive text-destructive-foreground'
                      : ''
                  }
                >
                  {count}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
