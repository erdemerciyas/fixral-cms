import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import News from '@/models/News';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';
import NewsForm from '@/components/admin/NewsFormClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Haberi Düzenle | Admin',
  description: 'Haber makalesi içeriğini ve meta verilerini güncelleyin',
};

export default async function EditNewsPage(props: PageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  try {
    const news = (await News.findById(params.id).lean()) as unknown as NewsItem;

    if (!news) {
      notFound();
    }

    return (
      <div className="space-y-6">
          <NewsForm initialData={news} />
        </div>);
  } catch (error) {
    logger.error('Error loading news article for editing', 'EDIT_NEWS', { error });
    notFound();
  }
}
