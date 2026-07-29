'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/admin/admin-skeletons';

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

  return <FormPageSkeleton />;
}
