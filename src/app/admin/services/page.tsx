'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reorder, useDragControls } from 'framer-motion';
import {
  Box,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  LayoutGrid,
  List,
  CheckCircle,
  DollarSign,
  GripVertical,
  Save,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';

interface ServiceItem {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  status: 'published' | 'draft';
  order?: number;
  price?: number;
  category?: string;
  icon?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [hasReordered, setHasReordered] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadServices();
  }, [status, router]);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          title: item.title || item.name || 'İsimsiz Hizmet',
          status: item.status || (item.isActive === false ? 'draft' : 'published'),
          category: item.category || 'Genel',
          description: item.description || 'Açıklama yok',
          order: item.order ?? 0,
          price: item.price || undefined,
          image: item.image || ''
        }));

        setServices(mappedData);
      }
    } catch (error) {
      console.error('Hizmetler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newOrder: ServiceItem[]) => {
    setServices(newOrder);
    setHasReordered(true);
  };

  const saveOrder = async () => {
    if (!hasReordered) return;

    setSavingOrder(true);
    try {
      const updates = services.map((service, index) => ({
        id: service._id,
        order: index + 1,
      }));

      const response = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setHasReordered(false);
        loadServices();
        toast.success('Sıralama kaydedildi');
      } else {
        toast.error('Sıralama kaydedilemedi');
      }
    } catch (error) {
      console.error('Sıralama kaydedilirken hata:', error);
      toast.error('Sıralama kaydedilirken hata oluştu');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    const confirmed = await confirm({ title: 'Emin misiniz?', description: 'Bu hizmeti silmek istediğinizden emin misiniz?' });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setServices(services.filter(service => service._id !== serviceId));
        if (selectedItems.has(serviceId)) {
          const newSelected = new Set(selectedItems);
          newSelected.delete(serviceId);
          setSelectedItems(newSelected);
        }
        toast.success('Hizmet başarıyla silindi');
      } else {
        toast.error('Hizmet silinemedi');
      }
    } catch (error) {
      console.error('Hizmet silinirken hata:', error);
      toast.error('Hizmet silinirken hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirm({ title: 'Emin misiniz?', description: `${selectedItems.size} hizmeti silmek istediğinizden emin misiniz?` });
    if (!confirmed) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map(id =>
          fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
        )
      );
      setServices(services.filter(service => !selectedItems.has(service._id)));
      setSelectedItems(new Set());
      toast.success('Seçilen hizmetler silindi');
    } catch (error) {
      console.error('Hizmetler silinirken hata:', error);
      toast.error('Hizmetler silinirken hata oluştu');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredServices.map(service => service._id)));
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

  const filteredServices = services.filter(service => {
    const title = service.title || '';
    const description = service.description || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isReorderEnabled = searchQuery === '' && statusFilter === 'all' && viewMode === 'list';

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
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 bg-muted/80 backdrop-blur-sm py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Hizmet Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Hizmetlerinizi yönetin ve sıralayın</p>
        </div>
        <div className="flex gap-3">
          {hasReordered && (
            <button
              onClick={saveOrder}
              disabled={savingOrder}
              className="inline-flex items-center px-5 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-200 disabled:opacity-60"
            >
              {savingOrder ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Sıralamayı Kaydet
            </button>
          )}
          <Link
            href="/admin/services/new"
            className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Hizmet Ekle
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-2 sm:p-3 sticky top-24 z-10 transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search & Filter Group */}
          <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hizmetlerde ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-card transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center bg-muted border border-border/50 rounded-xl p-1 shadow-sm shrink-0 overflow-x-auto">
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
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-sm'
                  : 'text-muted-foreground hover:text-emerald-700'
                  }`}
              >
                Yayında
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === 'draft'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shadow-sm'
                  : 'text-muted-foreground hover:text-amber-700'
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

            <div className="flex bg-muted border border-border/50 rounded-xl p-1 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Liste Görünümü (Sıralama)"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Grid Görünümü"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {viewMode === 'list' && !isReorderEnabled && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
            Sıralama yapmak için filtreleri temizleyin (Arama yaparken sıralama devre dışıdır)
          </div>
        )}
      </div>

      {/* Content Area */}
      {filteredServices.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Box className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Hizmet bulunamadı</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Arama kriterlerinize uygun hizmet bulunamadı. Filtreleri temizlemeyi deneyin.'
              : 'Henüz hiç hizmet eklenmemiş. İlk hizmetinizi oluşturarak başlayın.'}
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
              href="/admin/services/new"
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Hizmet Ekle
            </Link>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              {isReorderEnabled ? (
                <Reorder.Group axis="y" values={filteredServices} onReorder={handleReorder} className="divide-y divide-border">
                  {filteredServices.map((service, index) => (
                    <DraggableServiceItem
                      key={service._id}
                      service={service}
                      index={index}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                <div className="divide-y divide-border">
                  {filteredServices.map((service, index) => (
                    <StaticServiceItem
                      key={service._id}
                      service={service}
                      index={index}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map(service => (
                <div
                  key={service._id}
                  className={`group relative bg-card rounded-xl border transition-all duration-300 hover:shadow-xl overflow-hidden
                         ${selectedItems.has(service._id) ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-border'}
                      `}
                >
                  {/* Image / Icon Cover */}
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden group-hover:bg-muted/50 transition-colors">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-3">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-card shadow-sm border border-border">
                          <Box className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                    )}

                    {/* Selection Overlay */}
                    <div
                      onClick={() => handleSelectItem(service._id)}
                      className={`absolute inset-0 bg-black/40 transition-opacity cursor-pointer flex items-center justify-center
                              ${selectedItems.has(service._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                           `}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                               ${selectedItems.has(service._id) ? 'bg-primary border-primary text-primary-foreground' : 'bg-transparent border-white text-transparent hover:bg-card/20'}
                            `}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm border border-white/20
                               ${service.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-400/90 text-white'}
                            `}>
                        {service.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>

                    {/* Order Badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="w-7 h-7 rounded-lg bg-black/60 text-white text-xs font-bold flex items-center justify-center backdrop-blur-md">
                        {service.order ?? '-'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(service.createdAt)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {service.description?.replace(/<[^>]*>/g, '') || ''}
                    </p>

                    <div className="flex items-center justify-end pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/services/edit/${service._id}`}
                          className="flex items-center px-3 py-1.5 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Düzenle
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DraggableServiceItem({
  service,
  index,
  onDelete,
  formatDate,
}: {
  service: ServiceItem;
  index: number;
  onDelete: (id: string) => void;
  formatDate: (d: string) => string;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={service}
      dragListener={false}
      dragControls={dragControls}
      className="bg-card"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab p-1.5 text-muted-foreground hover:text-foreground active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>

          <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-border flex items-center justify-center">
            {service.image ? (
              <img src={service.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Box className="w-5 h-5 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {service.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                ${service.status === 'published'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}
              `}>
                {service.status === 'published' ? 'Yayında' : 'Taslak'}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{formatDate(service.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Link
            href={`/admin/services/edit/${service._id}`}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Düzenle"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(service._id)}
            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

function StaticServiceItem({
  service,
  index,
  onDelete,
  formatDate,
}: {
  service: ServiceItem;
  index: number;
  onDelete: (id: string) => void;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-border flex items-center justify-center">
          {service.image ? (
            <img src={service.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <Box className="w-5 h-5 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {service.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
              ${service.status === 'published'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}
            `}>
              {service.status === 'published' ? 'Yayında' : 'Taslak'}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">{formatDate(service.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link
          href={`/admin/services/edit/${service._id}`}
          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Düzenle"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete(service._id)}
          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sil"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
