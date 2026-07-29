'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

// Public site için tek toast sistemi (sonner).
// Admin tarafı kendi Toaster'ını admin layout'ta mount ettiğinden
// çifte bildirim olmaması için /admin altında render edilmez.
export default function PublicToaster() {
  const pathname = usePathname() || '';
  if (pathname.startsWith('/admin')) return null;
  return <Toaster position="top-right" richColors closeButton />;
}
