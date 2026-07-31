import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewsForm from '@/components/admin/NewsFormClient';

export const metadata: Metadata = {
  title: 'Yeni Haber Oluştur | Admin',
  description: 'Yeni bir haber makalesi oluşturun',
};

export default async function CreateNewsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  return (
          <div className="space-y-6">
        <NewsForm />
      </div>
      );
}
