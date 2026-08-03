'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageLayout } from '@/components/admin/admin-page-layout';

interface SliderItem {
  _id: string;
  title: string;
  imageUrl: string;
  image?: string;
  link?: string;
  buttonLink?: string;
  description: string;
  order: number;
  isActive: boolean;
  badge?: string;
  duration?: number;
  createdAt: string;
}

export default function AdminSliderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadSliders();
  }, [status, router]);

  const loadSliders = async () => {
    try {
      const response = await fetch('/api/admin/slider');
      if (response.ok) {
        const data = await response.json();
        setSliders(data);
      }
    } catch (error) {
      console.error('Error loading sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sliderId: string) => {
    const confirmed = await confirm({ title: 'Emin misiniz?', description: 'Bu slider\'ı silmek istediğinizden emin misiniz?' });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/slider/${sliderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSliders(sliders.filter(slider => slider._id !== sliderId));
        toast.success('Slider başarıyla silindi');
      } else {
        toast.error('Slider silinemedi');
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
      toast.error('Slider silinirken hata oluştu');
    }
  };

  const handleToggleStatus = async (sliderId: string) => {
    try {
      const slider = sliders.find(s => s._id === sliderId);
      if (!slider) return;

      const response = await fetch(`/api/admin/slider/${sliderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slider.isActive }),
      });

      if (response.ok) {
        setSliders(sliders.map(s =>
          s._id === sliderId ? { ...s, isActive: !s.isActive } : s
        ));
      }
    } catch (error) {
      console.error('Error toggling slider status:', error);
    }
  };

  const handleReorder = async (sliderId: string, direction: 'up' | 'down') => {
    const index = sliders.findIndex(s => s._id === sliderId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliders.length) return;

    const newSliders = [...sliders];
    const moved = newSliders.splice(index, 1)[0];
    newSliders.splice(newIndex, 0, moved);

    try {
      await fetch('/api/admin/slider/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sliders: newSliders.map(s => s._id) }),
      });
      setSliders(newSliders);
    } catch (error) {
      console.error('Error reordering sliders:', error);
    }
  };

  const filteredSliders = sliders.filter(slider => {
    const matchesSearch = slider.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && slider.isActive)
      || (statusFilter === 'inactive' && !slider.isActive);
    return matchesSearch && matchesStatus;
  });

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
    <AdminPageLayout
      title="Slider"
      description="Ana sayfa slider'ınızı yönetin"
      actions={
        <button
          onClick={() => router.push('/admin/slider/new')}
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Slider Ekle
        </button>
      }
    >
      {/* Search and Filter Bar */}
      <div className="bg-card rounded-xl shadow-xs border border-border/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Slider ara..."
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                ? 'bg-card text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Tümü ({sliders.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'active'
                ? 'bg-card text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Aktif ({sliders.filter(s => s.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'inactive'
                ? 'bg-card text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Pasif ({sliders.filter(s => !s.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSliders.map((slider, index) => (
          <div
            key={slider._id}
            className="bg-card rounded-xl shadow-xs border border-border/60 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative aspect-video bg-linear-to-br from-primary/10 to-primary/10">
              {(slider.imageUrl || slider.image) ? (
                <img
                  src={slider.imageUrl || slider.image}
                  alt={slider.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-primary" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${slider.isActive
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
                  }`}>
                  {slider.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {slider.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {slider.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Sıra: {slider.order + 1}
                </span>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReorder(slider._id, 'up')}
                    disabled={index === 0}
                    className="p-2 hover:bg-primary/15 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Yukarı Taşı"
                  >
                    <ArrowUp className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleReorder(slider._id, 'down')}
                    disabled={index === filteredSliders.length - 1}
                    className="p-2 hover:bg-primary/15 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Aşağı Taşı"
                  >
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(slider._id)}
                    className={`p-2 rounded-lg transition-colors ${slider.isActive
                      ? 'bg-warning/15 hover:bg-warning/20'
                      : 'bg-success/15 hover:bg-success/20'
                      }`}
                    title={slider.isActive ? 'Pasife Al' : 'Aktif Et'}
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/slider/${slider._id}/edit`)}
                    className="p-2 hover:bg-primary/15 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(slider._id)}
                    className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSliders.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Slider bulunamadı</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'Arama veya filtrelemenizi değiştirmeyi deneyin'
              : 'Ana sayfada göstermek için ilk slider\'ınızı ekleyin'
            }
          </p>
        </div>
      )}
    </AdminPageLayout>
  );
}
