'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AdminThemeProvider } from '@/components/providers/AdminThemeProvider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/app-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Toaster } from '@/components/ui/sonner'
import { ConfirmProvider } from '@/hooks/use-confirm'
import { AdminShellSkeleton } from '@/components/admin/admin-skeletons'

const BARE_PATHS = ['/admin/login', '/admin/reset-password']

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { status } = useSession()
  const router = useRouter()

  const isBarePage = BARE_PATHS.some((p) => pathname?.startsWith(p))

  useEffect(() => {
    if (status === 'loading' || isBarePage) return
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, isBarePage, router])

  // Login / şifre sıfırlama: shell olmadan, ancak tema desteğiyle render edilir
  if (isBarePage) {
    return (
      <AdminThemeProvider>
        <div className="min-h-svh bg-background text-foreground">
          {children}
        </div>
        <Toaster />
      </AdminThemeProvider>
    )
  }

  return (
    <AdminThemeProvider>
      <ConfirmProvider>
        {status === 'loading' ? (
          // Oturum netleşene kadar shell şekilli iskelet — tema flash'ı olmadan
          <AdminShellSkeleton />
        ) : status === 'unauthenticated' ? (
          <div className="min-h-svh bg-background" />
        ) : (
          <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="min-w-0">
              <AdminHeader />
              <main
                id="main-content"
                className="flex-1 px-4 py-4 md:px-6 md:py-6"
              >
                <div className="mx-auto w-full max-w-[1400px]">
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        )}
        <Toaster />
      </ConfirmProvider>
    </AdminThemeProvider>
  )
}
