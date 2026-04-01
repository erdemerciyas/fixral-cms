'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Image as ImageIcon,
  Box,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  Pencil,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface RecentItem {
  id: string
  title: string
  type: 'news' | 'portfolio' | 'service' | 'product'
  status: 'published' | 'draft'
  date: string
  views: number
}

interface ActivityItem {
  id: string
  action: string
  item: string
  time: string
  type: 'success' | 'info' | 'warning' | 'error' | 'message'
  sortKey?: number
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('fetch failed')
    return r.json()
  })

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return date.toLocaleDateString('tr-TR')
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  news: FileText,
  portfolio: ImageIcon,
  service: Box,
  product: Box,
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const { data: rawData, isLoading } = useSWR(
    status === 'authenticated' ? '/api/admin/dashboard-stats' : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  const loading = status === 'loading' || (status === 'authenticated' && isLoading)

  const dashboardStats = {
    newsCount: rawData?.newsCount || 0,
    portfolioCount: rawData?.portfolioCount || 0,
    servicesCount: rawData?.servicesCount || 0,
    productsCount: rawData?.productsCount || 0,
    usersCount: rawData?.usersCount || 0,
    videosCount: rawData?.mediaCount || 0,
    messagesCount: rawData?.messagesCount || 0,
  }

  const recentItems: RecentItem[] = (rawData?.recentContent || []).map(
    (item: any) => ({
      id: item._id,
      title: item.title,
      type: item.type,
      status: item.status || 'published',
      date: formatDate(item.createdAt),
      views: item.views || 0,
    })
  )

  const allActivities: ActivityItem[] = []
  ;(rawData?.recentMessages || []).forEach((msg: any) => {
    allActivities.push({
      id: `msg-${msg._id}`,
      action: 'Yeni mesaj alındı',
      item: msg.subject || 'Konu yok',
      time: formatDate(msg.createdAt),
      type: 'message',
      sortKey: new Date(msg.createdAt).getTime(),
    })
  })
  ;(rawData?.recentContent || []).forEach((content: any) => {
    let actionText = 'İçerik güncellendi'
    let type: ActivityItem['type'] = 'success'
    switch (content.type) {
      case 'news': actionText = 'Yeni haber eklendi'; break
      case 'portfolio': actionText = 'Portfolyo güncellendi'; type = 'info'; break
      case 'service': actionText = 'Yeni hizmet eklendi'; break
      case 'product': actionText = 'Yeni ürün eklendi'; break
    }
    allActivities.push({
      id: `content-${content._id}`,
      action: actionText,
      item: content.title || content.name,
      time: formatDate(content.createdAt),
      type,
      sortKey: new Date(content.createdAt).getTime(),
    })
  })
  ;(rawData?.recentUsers || []).forEach((user: any) => {
    allActivities.push({
      id: `user-${user._id}`,
      action: 'Yeni kullanıcı',
      item: user.name || user.email,
      time: formatDate(user.createdAt),
      type: 'warning',
      sortKey: new Date(user.createdAt).getTime(),
    })
  })
  const activities = allActivities
    .sort((a, b) => (b.sortKey ?? 0) - (a.sortKey ?? 0))
    .slice(0, 8)

  const stats = [
    { title: 'Toplam Haber', value: dashboardStats.newsCount, icon: FileText, href: '/admin/news' },
    { title: 'Portfolyo', value: dashboardStats.portfolioCount, icon: ImageIcon, href: '/admin/portfolio' },
    { title: 'Hizmetler', value: dashboardStats.servicesCount, icon: Box, href: '/admin/services' },
    { title: 'Ürünler', value: dashboardStats.productsCount, icon: Box, href: '/admin/products' },
    { title: 'Kullanıcılar', value: dashboardStats.usersCount, icon: Users, href: '/admin/users' },
    { title: 'Medya', value: dashboardStats.videosCount, icon: ImageIcon, href: '/admin/media' },
  ]

  const quickActions = [
    { name: 'Haber Ekle', href: '/admin/news/create', icon: FileText },
    { name: 'Portfolyo Ekle', href: '/admin/portfolio/new', icon: ImageIcon },
    { name: 'Hizmet Ekle', href: '/admin/services/new', icon: Box },
    { name: 'Ürün Ekle', href: '/admin/products/new', icon: Box },
  ]

  const systemStatus = [
    { name: 'Sunucu Durumu', status: 'operational', uptime: '%99.9' },
    { name: 'Veritabanı', status: 'operational', uptime: '%99.8' },
    { name: 'Depolama', status: 'warning', uptime: '%75' },
    { name: 'API', status: 'operational', uptime: '%99.9' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="flex items-start justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hoş geldin, {session?.user?.name || 'Yönetici'}!
            </h1>
            <p className="mt-1 text-primary-foreground/70">
              Bugün sitenizde olan bitenler.
            </p>
          </div>
          <Button
            variant="secondary"
            className="hidden md:inline-flex"
            onClick={() => router.push('/admin/news/create')}
          >
            <Plus className="mr-1 h-4 w-4" />
            Yeni İçerik Oluştur
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <section aria-label="İstatistikler">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="group transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.name} href={action.href}>
                <div className="group flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground transition-colors">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{action.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Content & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Son İçerikler</CardTitle>
            <Link href="/admin/news">
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentItems.map((item) => {
                const Icon = TYPE_ICONS[item.type] || FileText
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={item.status === 'published' ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0">
                            {item.status === 'published' ? 'yayında' : 'taslak'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {item.views}
                      </span>
                      <Link
                        href={
                          item.type === 'news'
                            ? `/admin/news/${item.id}/edit`
                            : item.type === 'product'
                              ? `/admin/products/edit/${item.id}`
                              : item.type === 'portfolio'
                                ? `/admin/portfolio/edit/${item.id}`
                                : `/admin/services/edit/${item.id}`
                        }
                      >
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
              {recentItems.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Henüz içerik bulunmuyor.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        activity.type === 'success'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : activity.type === 'info'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : activity.type === 'message'
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {activity.type === 'success' && <CheckCircle className="h-4 w-4" />}
                      {activity.type === 'info' && <Clock className="h-4 w-4" />}
                      {activity.type === 'message' && <MessageSquare className="h-4 w-4" />}
                      {activity.type === 'warning' && <Users className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="truncate text-sm text-muted-foreground">{activity.item}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Henüz aktivite bulunmuyor.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sistem Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {systemStatus.map((system) => (
              <div
                key={system.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{system.name}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {system.uptime}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      system.status === 'operational'
                        ? 'bg-emerald-500'
                        : system.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {system.status === 'operational' ? 'Çalışıyor' : system.status === 'warning' ? 'Uyarı' : 'Hata'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages Preview */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Yeni Mesajlar</h3>
              <p className="text-primary-foreground/70">
                {dashboardStats.messagesCount > 0
                  ? `${dashboardStats.messagesCount} yeni mesajınız var`
                  : 'Yeni mesaj yok'}
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => router.push('/admin/messages')}>
            Mesajları Görüntüle
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
