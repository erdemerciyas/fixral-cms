'use client';

/**
 * NewsFormClient — NewsForm'u ssr: false ile yükleyen client wrapper.
 * Next.js 15+ Server Component'lerde `ssr: false` yasak olduğu için
 * dynamic import bu client bileşenine taşındı (news create/edit sayfaları kullanır).
 */
import dynamic from 'next/dynamic';
import { FormPageSkeleton } from '@/components/admin/admin-skeletons';

const NewsForm = dynamic(() => import('@/components/admin/NewsForm'), {
  ssr: false,
  loading: () => <FormPageSkeleton />,
});

export default NewsForm;
