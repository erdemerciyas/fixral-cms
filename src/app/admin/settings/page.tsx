'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/site-settings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground">Yönlendiriliyor...</p>
    </div>
  );
}
