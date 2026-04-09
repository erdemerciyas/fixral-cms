'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Pencil,
  FileText,
  Image as ImageIcon,
  Box,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'news' | 'page' | 'portfolio' | 'service'>('news');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    setLoading(false);
  }, [status, router]);

  const contentTypes = [
    { type: 'news', name: 'News Article', icon: FileText, color: 'from-indigo-500 to-violet-600', href: '/admin/news/create' },
    { type: 'page', name: 'Page', icon: FileText, color: 'from-emerald-500 to-teal-600', href: '/admin/pages' },
    { type: 'portfolio', name: 'Portfolio Item', icon: ImageIcon, color: 'from-amber-500 to-orange-600', href: '/admin/portfolio/new' },
    { type: 'service', name: 'Service', icon: Box, color: 'from-rose-500 to-pink-600', href: '/admin/services/new' },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Editor</h1>
        <p className="text-muted-foreground mt-1">Choose the type of content you want to create</p>
      </div>

      {/* Content Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((contentType) => (
          <button
            key={contentType.type}
            onClick={() => router.push(contentType.href)}
            className={`group bg-card rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
              selectedType === contentType.type
                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                : 'border-border hover:border-indigo-300'
            }`}
          >
            <div className="p-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${contentType.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <contentType.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 transition-colors">
                {contentType.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a new {contentType.name.toLowerCase()}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Content */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/news/create"
            className="flex items-center p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <FileText className="w-5 h-5 text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-foreground">Create News</span>
          </Link>
          <Link
            href="/admin/portfolio/new"
            className="flex items-center p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-amber-600 mr-3" />
            <span className="text-sm font-medium text-foreground">Add Portfolio</span>
          </Link>
          <Link
            href="/admin/services/new"
            className="flex items-center p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <Box className="w-5 h-5 text-rose-600 mr-3" />
            <span className="text-sm font-medium text-foreground">Add Service</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
