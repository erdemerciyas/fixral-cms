'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AdminThemeProvider } from '@/components/providers/AdminThemeProvider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/app-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Toaster } from '@/components/ui/sonner'
import { ConfirmProvider } from '@/hooks/use-confirm'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (
      status === 'unauthenticated' &&
      pathname !== '/admin/login' &&
      pathname !== '/admin/reset-password'
    ) {
      router.push('/admin/login')
    }
  }, [status, pathname, router])

  if (pathname === '/admin/login' || pathname === '/admin/reset-password') {
    return <>{children}</>
  }

  if (!mounted || status === 'loading') {
    return null
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <AdminThemeProvider>
      <ConfirmProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AdminHeader />
            <main id="main-content" className="flex-1 p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </ConfirmProvider>
    </AdminThemeProvider>
  )
}
