'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/useToast';
import PortfolioForm, { PortfolioFormData } from '@/components/admin/PortfolioForm';

export default function NewPortfolioItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { show: showToast } = useToast();
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
      const response = await fetch('/api/public/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Bir hata oluştu');
      }

      showToast({ variant: 'success', title: 'Başarılı', description: 'Portfolyo öğesi oluşturuldu' });
      router.push('/admin/portfolio');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PortfolioForm
      mode="create"
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
}
