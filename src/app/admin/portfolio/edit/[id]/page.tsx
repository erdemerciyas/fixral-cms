'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PortfolioForm, { PortfolioFormData } from '@/components/admin/PortfolioForm';
import { FormPageSkeleton } from '@/components/admin/admin-skeletons';

export default function EditPortfolioItem({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
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
      toast.error('Hata', { description: 'Portfolyo öğesi yüklenemedi' });
    } finally {
      setLoading(false);
    }
  }, [params.id]);

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

      toast.success('Başarılı', { description: 'Portfolyo öğesi güncellendi' });
      router.push('/admin/portfolio');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return <FormPageSkeleton />;
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
