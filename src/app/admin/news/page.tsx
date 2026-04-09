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
  Trash2,
  Calendar,
  Tag,
  Filter,
  LayoutGrid,
  List,
  CheckCircle,
  Eye,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: 'published' | 'draft';
  category?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  featuredImage?: string;
  translations?: any;
}

export default function AdminNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadNews();
  }, [status, router]);

  const loadNews = async () => {
    try {
      const response = await fetch('/api/admin/news');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          // Robust title extraction
          title: item.translations?.tr?.title || item.translations?.es?.title || item.translations?.en?.title || item.title || item.name || 'Başlıksız Haber',
          // Robust excerpt extraction
          excerpt: item.translations?.tr?.excerpt || item.translations?.es?.excerpt || item.excerpt || 'Özet bulunmuyor.',
          // Robust image extraction
          featuredImage: item.featuredImage?.url || (typeof item.featuredImage === 'string' ? item.featuredImage : '') || '',
          // Ensure status exists
          status: item.status || 'published'
        }));

        // Sort by date descending
        mappedData.sort((a: NewsItem, b: NewsItem) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setNewsItems(mappedData);
      }
    } catch (error) {
      console.error('Haberler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    const item = newsItems.find(n => n._id === itemId);
    const itemTitle = item?.title || 'Başlıksız Haber';

    const confirmed = await confirm({
      title: 'Haberi Sil',
      description: `"${itemTitle}" başlıklı haberi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/news/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNewsItems(newsItems.filter(n => n._id !== itemId));
        if (selectedItems.has(itemId)) {
          const newSelected = new Set(selectedItems);
          newSelected.delete(itemId);
          setSelectedItems(newSelected);
        }
        toast.success(`"${itemTitle}" başarıyla silindi`);
      } else {
        toast.error(`"${itemTitle}" silinirken hata oluştu`);
      }
    } catch (error) {
      console.error('Haber silinirken hata:', error);
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleBulkDelete = async () => {
    const selectedNewsList = newsItems.filter(item => selectedItems.has(item._id));
    const titlePreview = selectedNewsList
      .slice(0, 5)
      .map(item => `• ${item.title}`)
      .join('\n');
    const moreCount = selectedNewsList.length > 5 ? `\n...ve ${selectedNewsList.length - 5} haber daha` : '';

    const confirmed = await confirm({
      title: `${selectedItems.size} Haberi Sil`,
      description: `Aşağıdaki haberleri kalıcı olarak silmek istediğinize emin misiniz?\n\n${titlePreview}${moreCount}\n\nBu işlem geri alınamaz.`,
    });

    if (!confirmed) return;

    try {
      const results = await Promise.allSettled(
        Array.from(selectedItems).map(id =>
          fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as Response).ok).length;
      const failCount = results.length - successCount;

      setNewsItems(newsItems.filter(item => !selectedItems.has(item._id)));
      setSelectedItems(new Set());

      if (failCount === 0) {
        toast.success(`${successCount} haber başarıyla silindi`);
      } else {
        toast.warning(`${successCount} haber silindi, ${failCount} haber silinemedi`);
      }
    } catch (error) {
      console.error('Haberler silinirken hata:', error);
      toast.error('Toplu silme işlemi sırasında hata oluştu');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredItems.map(item => item._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const filteredItems = newsItems.filter(item => {
    const title = item.title || '';
    const excerpt = item.excerpt || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Haber Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Blog yazılarını ve haberleri düzenleyin</p>
        </div>
        <Button size="lg" onClick={() => router.push('/admin/news/create')}>
          <Plus className="w-5 h-5" />
          Yeni Haber Ekle
        </Button>
      </div>

      {/* Sticky Toolbar */}
      <Card className="sticky top-24 z-10 p-3">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search & Filter Group */}
          <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Haber başlığı veya özet ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-card transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center bg-surface-tertiary border border-border/50 rounded-xl p-1 shadow-sm shrink-0 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Tümü
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === 'published'
                  ? 'bg-success-light text-success-dark shadow-sm'
                  : 'text-muted-foreground hover:text-success-dark'
                  }`}
              >
                Yayında
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === 'draft'
                  ? 'bg-warning-light text-warning-dark shadow-sm'
                  : 'text-muted-foreground hover:text-warning-dark'
                  }`}
              >
                Taslak
              </button>
            </div>
          </div>

          {/* View Toggle & Bulk Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                  {selectedItems.size} seçildi
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </button>
              </div>
            )}

            <div className="flex bg-surface-tertiary border border-border/50 rounded-xl p-1 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Grid Görünümü"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Liste Görünümü"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Area */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Haber bulunamadı</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Arama kriterlerinize uygun haber bulunamadı. Filtreleri temizlemeyi deneyin.'
              : 'Henüz hiç haber eklenmemiş. İlk haberinizi oluşturarak başlayın.'}
          </p>
          {(searchQuery || statusFilter !== 'all') ? (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="text-primary hover:text-primary/80 font-medium hover:underline"
            >
              Filtreleri Temizle
            </button>
          ) : (
            <Link
              href="/admin/news/create"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Haber Ekle
            </Link>
          )}
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <li
                  key={item._id}
                  className={`group relative bg-card rounded-xl border transition-all duration-300 hover:shadow-xl overflow-hidden
                         ${selectedItems.has(item._id) ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-border'}
                      `}
                >
                  {/* Image / Cover */}
                  <div className="aspect-video bg-surface-tertiary relative overflow-hidden">
                    {item.featuredImage ? (
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                        <FileText className="w-12 h-12" />
                      </div>
                    )}

                    {/* Selection Overlay */}
                    <div
                      onClick={() => handleSelectItem(item._id)}
                      className={`absolute inset-0 bg-black/40 transition-opacity cursor-pointer flex items-center justify-center
                              ${selectedItems.has(item._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                           `}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                               ${selectedItems.has(item._id) ? 'bg-primary border-primary text-primary-foreground' : 'bg-transparent border-white text-transparent hover:bg-card/20'}
                            `}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm border border-white/20
                               ${item.status === 'published' ? 'bg-success/90 text-white' : 'bg-warning/90 text-white'}
                            `}>
                        {item.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.createdAt)}</span>
                      {item.category && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-muted-foreground font-medium">{item.category}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {item.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <div className="flex items-center text-xs text-muted-foreground">
                        {item.views !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {item.views}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/news/${item._id}/edit`}
                          className="flex items-center px-3 py-1.5 bg-surface-tertiary text-foreground text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Düzenle
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // LIST VIEW
            <Card className="overflow-hidden p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredItems.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/50"
                      />
                    </th>
                    <th className="px-6 py-4">Haber Detayı</th>
                    <th className="px-6 py-4 w-32">Durum</th>
                    <th className="px-6 py-4 w-40">Tarih</th>
                    <th className="px-6 py-4 w-32 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredItems.map(item => (
                    <tr
                      key={item._id}
                      className={`group transition-colors ${selectedItems.has(item._id) ? 'bg-primary/5' : 'hover:bg-surface-secondary'}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="rounded border-border text-primary focus:ring-primary/50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-surface-tertiary rounded-lg overflow-hidden flex-shrink-0 border border-border">
                            {item.featuredImage ? (
                              <img src={item.featuredImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                                <FileText className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {item.excerpt}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {item.category && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-tertiary text-muted-foreground">
                                  {item.category}
                                </span>
                              )}
                              {item.views !== undefined && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Eye className="w-3 h-3" /> {item.views}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                                     ${item.status === 'published' ? 'bg-success' : 'bg-warning'}
                                  `} />
                          {item.status === 'published' ? 'Yayında' : 'Taslak'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{formatDate(item.createdAt).split(' ').slice(0, 2).join(' ')}</span>
                          <span>{formatDate(item.createdAt).split(' ')[2]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/news/${item._id}/edit`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
