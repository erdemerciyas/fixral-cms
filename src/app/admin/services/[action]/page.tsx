'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Legacy catch-all route — redirects to the proper new/edit pages.
 * /admin/services/new   → handled by /admin/services/new/page.tsx
 * /admin/services/edit  → redirects to /admin/services (needs an id)
 * anything else         → redirects to /admin/services
 */
export default function ServiceActionRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const action = params?.action as string | undefined;
    if (action === 'new') {
      router.replace('/admin/services/new');
    } else {
      router.replace('/admin/services');
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-border rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}
