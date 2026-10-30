'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/providers/AdminThemeProvider'
import {
  LayoutDashboard,
  FileText,
  Layers,
  Box,
  FolderKanban,
  Tags,
  Boxes,
  Image as ImageIcon,
  Clapperboard,
  GalleryHorizontal,
  PanelBottom,
  Settings,
  Search as SearchIcon,
  BarChart3,
  Share2,
  Phone,
  Users,
  Languages,
  Map,
  Database,
  Mail,
  User,
  Plus,
  Moon,
  Sun,
  Monitor,
  AppWindow,
  LayoutTemplate,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

type PaletteItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  keywords?: string[]
}

const NAV_ITEMS: PaletteItem[] = [
  { label: 'Kontrol Paneli', href: '/admin/dashboard', icon: LayoutDashboard, keywords: ['dashboard', 'anasayfa'] },
  { label: 'Haberler', href: '/admin/news', icon: FileText, keywords: ['news', 'blog'] },
  { label: 'Sayfalar', href: '/admin/pages', icon: Layers, keywords: ['pages'] },
  { label: 'Hizmetler', href: '/admin/services', icon: Box, keywords: ['services'] },
  { label: 'Yazılımlar', href: '/admin/software', icon: AppWindow, keywords: ['software', 'yazılım', 'uygulama'] },
  { label: 'Site İçeriği', href: '/admin/site-content', icon: LayoutTemplate, keywords: ['hero', 'anasayfa', 'bölüm', 'süreç', 'teslimat', 'başlık'] },
  { label: 'Tüm İçerikler', href: '/admin/content', icon: FolderKanban, keywords: ['content'] },
  { label: 'Portfolyo', href: '/admin/portfolio', icon: GalleryHorizontal, keywords: ['portfolio', 'proje'] },
  { label: 'Kategoriler', href: '/admin/categories', icon: Tags, keywords: ['categories'] },
  { label: '3D Modeller', href: '/admin/models', icon: Boxes, keywords: ['models', '3d'] },
  { label: 'FX 3D', href: '/admin/fx-3d', icon: Boxes, keywords: ['cults', 'cults3d', 'stl', 'mağaza', '3d'] },
  { label: 'Medya Kütüphanesi', href: '/admin/media', icon: ImageIcon, keywords: ['media', 'görsel', 'resim'] },
  { label: 'Videolar', href: '/admin/videos', icon: Clapperboard, keywords: ['videos', 'youtube'] },
  { label: 'Slider', href: '/admin/slider', icon: GalleryHorizontal, keywords: ['slider', 'carousel'] },
  { label: 'Alt Bilgi', href: '/admin/footer', icon: PanelBottom, keywords: ['footer'] },
  { label: 'Site Ayarları', href: '/admin/site-settings', icon: Settings, keywords: ['settings', 'ayar'] },
  { label: 'SEO Ayarları', href: '/admin/seo', icon: SearchIcon, keywords: ['seo', 'meta'] },
  { label: 'Analitik', href: '/admin/analytics', icon: BarChart3, keywords: ['analytics'] },
  { label: 'Sosyal Medya', href: '/admin/social-media', icon: Share2, keywords: ['social'] },
  { label: 'İletişim Ayarları', href: '/admin/contact', icon: Phone, keywords: ['contact'] },
  { label: 'Kullanıcılar', href: '/admin/users', icon: Users, keywords: ['users'] },
  { label: 'Dil Ayarları', href: '/admin/languages', icon: Languages, keywords: ['languages', 'çeviri'] },
  { label: 'Sitemap', href: '/admin/sitemap', icon: Map, keywords: ['sitemap'] },
  { label: 'Yedekleme', href: '/admin/backup', icon: Database, keywords: ['backup', 'export'] },
  { label: 'Mesajlar', href: '/admin/messages', icon: Mail, keywords: ['messages', 'inbox'] },
  { label: 'Profilim', href: '/admin/profile', icon: User, keywords: ['profile', 'hesap'] },
]

const CREATE_ITEMS: PaletteItem[] = [
  { label: 'Yeni Haber', href: '/admin/news/create', icon: Plus, keywords: ['haber ekle'] },
  { label: 'Yeni Portfolyo', href: '/admin/portfolio/new', icon: Plus, keywords: ['proje ekle'] },
  { label: 'Yeni Hizmet', href: '/admin/services/new', icon: Plus, keywords: ['hizmet ekle'] },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { setTheme } = useTheme()

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Sayfa, işlem veya ayar ara..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        <CommandGroup heading="Hızlı Oluştur">
          {CREATE_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.keywords?.join(' ') ?? ''}`}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Sayfalar">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.keywords?.join(' ') ?? ''}`}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tema">
          <CommandItem
            value="açık tema light"
            onSelect={() => runCommand(() => setTheme('light'))}
          >
            <Sun className="text-muted-foreground" />
            Açık Tema
          </CommandItem>
          <CommandItem
            value="koyu tema dark"
            onSelect={() => runCommand(() => setTheme('dark'))}
          >
            <Moon className="text-muted-foreground" />
            Koyu Tema
          </CommandItem>
          <CommandItem
            value="sistem teması system"
            onSelect={() => runCommand(() => setTheme('system'))}
          >
            <Monitor className="text-muted-foreground" />
            Sistem Teması
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
