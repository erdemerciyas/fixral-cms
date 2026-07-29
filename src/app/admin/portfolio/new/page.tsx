'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PortfolioForm, { PortfolioFormData } from '@/components/admin/PortfolioForm';
import { FormPageSkeleton } from '@/components/admin/admin-skeletons';

export default function NewPortfolioItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  const handleSubmit = async (data: PortfolioFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Bir hata oluştu');
      }

      toast.success('Başarılı', { description: 'Portfolyo öğesi oluşturuldu' });
      router.push('/admin/portfolio');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <FormPageSkeleton />;
  }

  return (
    <PortfolioForm
      mode="create"
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
}
