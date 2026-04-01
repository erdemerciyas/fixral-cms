'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';

interface ContentItem {
  _id: string;
  title: string;
  type: 'news' | 'page' | 'portfolio' | 'service' | 'product';
  status: 'published' | 'draft';
  updatedAt: string;
}

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'news' | 'page' | 'portfolio' | 'service' | 'product'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadContent();
  }, [status, router]);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    const confirmed = await confirm({ title: 'Are you sure?', description: 'Are you sure you want to delete this content?' });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContent(content.filter(item => item._id !== contentId));
        toast.success('Content deleted successfully');
      } else {
        toast.error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Error deleting content');
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return '📰';
      case 'page': return '📄';
      case 'portfolio': return '💼';
      case 'service': return '🔧';
      case 'product': return '🛒';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'from-primary/80 to-primary';
      case 'page': return 'from-emerald-500 to-teal-600';
      case 'portfolio': return 'from-amber-500 to-orange-600';
      case 'service': return 'from-rose-500 to-pink-600';
      case 'product': return 'from-cyan-500 to-blue-600';
      default: return 'from-slate-500 to-gray-600';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Content</h1>
          <p className="text-slate-500 mt-1">Manage all your site content</p>
        </div>
        <Link
          href="/admin/news/create"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Content
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${typeFilter === 'all'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All ({content.length})
            </button>
            <button
              onClick={() => setTypeFilter('news')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${typeFilter === 'news'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              News ({content.filter(c => c.type === 'news').length})
            </button>
            <button
              onClick={() => setTypeFilter('page')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${typeFilter === 'page'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Pages ({content.filter(c => c.type === 'page').length})
            </button>
            <button
              onClick={() => setTypeFilter('portfolio')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${typeFilter === 'portfolio'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Portfolio ({content.filter(c => c.type === 'portfolio').length})
            </button>
            <button
              onClick={() => setTypeFilter('service')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${typeFilter === 'service'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Services ({content.filter(c => c.type === 'service').length})
            </button>
            <button
              onClick={() => setTypeFilter('product')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${typeFilter === 'product'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Products ({content.filter(c => c.type === 'product').length})
            </button>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {filteredContent.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredContent.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center flex-shrink-0 text-xl`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${item.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        {item.status}
                      </span>
                      <span className="capitalize">{item.type}</span>
                      <span>• {formatDate(item.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/${item.type}/${item._id}/edit`}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No content found</h3>
            <p className="text-slate-500">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Create your first content to get started'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
