'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/useToast';
import PortfolioForm, { PortfolioFormData } from '@/components/admin/PortfolioForm';

export default function EditPortfolioItem({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<PortfolioFormData | undefined>();

  const fetchPortfolioItem = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/portfolio/${params.id}`);
      if (!response.ok) throw new Error('Portfolyo öğesi getirilemedi');
      const result = await response.json();
      const data = result.data || result;

      let formattedDate = '';
      if (data.completionDate) {
        const date = new Date(data.completionDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }

      let categoryIds: string[] = [];
      if (data.categoryIds && data.categoryIds.length > 0) {
        categoryIds = data.categoryIds as unknown as string[];
      } else if (data.categoryId) {
        categoryIds = [data.categoryId as unknown as string];
      } else if (data.category) {
        const catId = typeof data.category === 'object' ? data.category._id : data.category;
        if (catId) categoryIds = [catId];
      }

      setInitialData({
        _id: data._id,
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        categoryIds,
        client: data.client || '',
        completionDate: formattedDate,
        technologies: data.technologies && data.technologies.length > 0 ? [...data.technologies] : [],
        coverImage: data.coverImage || '',
        images: data.images || [],
        models3D: data.models3D || [],
        featured: data.featured || false,
        order: data.order || 0,
        projectUrl: data.projectUrl || '',
        githubUrl: data.githubUrl || '',
        translations: data.translations,
      });
    } catch (err) {
      console.error(err);
      showToast({ variant: 'danger', title: 'Hata', description: 'Portfolyo öğesi yüklenemedi' });
    } finally {
      setLoading(false);
    }
  }, [params.id, showToast]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPortfolioItem();
    } else if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router, fetchPortfolioItem]);

  const handleSubmit = async (data: PortfolioFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/portfolio/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Bir hata oluştu');
      }

      showToast({ variant: 'success', title: 'Başarılı', description: 'Portfolyo öğesi güncellendi' });
      router.push('/admin/portfolio');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Portfolyo Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PortfolioForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
}
