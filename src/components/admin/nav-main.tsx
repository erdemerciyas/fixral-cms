'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Box,
  Image as ImageIcon,
  Paintbrush,
  Settings,
  MessageSquare,
  ChevronRight,
  Plus,
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

const ALERT_PATHS = ['/admin/orders', '/admin/messages', '/admin/products/questions']

const navigation: NavItem[] = [
  { name: 'Kontrol Paneli', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'İçerik Yönetimi',
    icon: FileText,
    children: [
      { name: 'Haberler', href: '/admin/news' },
      { name: 'Sayfalar', href: '/admin/pages' },
      { name: 'Hizmetler', href: '/admin/services' },
    ],
  },
  {
    name: 'Ürün Yönetimi',
    icon: ShoppingBag,
    children: [
      { name: 'Tüm Ürünler', href: '/admin/products' },
      { name: 'Yeni Ekle', href: '/admin/products/new' },
      { name: 'Kategoriler', href: '/admin/product-categories' },
      { name: 'Yorumlar', href: '/admin/product-reviews' },
      { name: 'Ürün Medyası', href: '/admin/product-media' },
      { name: 'Ürün Mesajları', href: '/admin/products/questions' },
      { name: 'Siparişler', href: '/admin/orders' },
    ],
  },
  {
    name: 'Portfolyo',
    icon: Box,
    children: [
      { name: 'Tüm Projeler', href: '/admin/portfolio' },
      { name: 'Yeni Ekle', href: '/admin/portfolio/new' },
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
      { name: 'Temalar', href: '/admin/themes' },
      { name: 'Slider', href: '/admin/slider' },
      { name: 'Alt Bilgi (Footer)', href: '/admin/footer' },
    ],
  },
  {
    name: 'Sistem',
    icon: Settings,
    children: [
      { name: 'Eklentiler', href: '/admin/plugins' },
      { name: 'Kullanıcılar', href: '/admin/users' },
      { name: 'Site Ayarları', href: '/admin/site-settings' },
      { name: 'Sitemap', href: '/admin/sitemap' },
      { name: 'Dil Ayarları', href: '/admin/languages' },
      { name: 'Güncellemeler', href: '/admin/updates' },
    ],
  },
  { name: 'Mesajlar', href: '/admin/messages', icon: MessageSquare },
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
                              </Link>
                            </SidebarMenuSubButton>
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
