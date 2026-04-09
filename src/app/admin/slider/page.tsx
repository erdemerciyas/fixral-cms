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

interface SliderItem {
  _id: string;
  title: string;
  image: string;
  link?: string;
  description: string;
  order: number;
  status: 'active' | 'inactive';
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
    const confirmed = await confirm({ title: 'Are you sure?', description: 'Are you sure you want to delete this slider?' });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/slider/${sliderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSliders(sliders.filter(slider => slider._id !== sliderId));
        toast.success('Slider deleted successfully');
      } else {
        toast.error('Failed to delete slider');
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
      toast.error('Error deleting slider');
    }
  };

  const handleToggleStatus = async (sliderId: string) => {
    try {
      const slider = sliders.find(s => s._id === sliderId);
      if (!slider) return;

      const response = await fetch(`/api/admin/slider/${sliderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: slider.status === 'active' ? 'inactive' : 'active' }),
      });

      if (response.ok) {
        setSliders(sliders.map(s =>
          s._id === sliderId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
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
    const matchesStatus = statusFilter === 'all' || slider.status === statusFilter;
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Slider</h1>
          <p className="text-muted-foreground mt-1">Manage your homepage slider</p>
        </div>
        <button
          onClick={() => router.push('/admin/slider/new')}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Slider
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sliders..."
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              All ({sliders.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'active'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Active ({sliders.filter(s => s.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'inactive'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Inactive ({sliders.filter(s => s.status === 'inactive').length})
            </button>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSliders.map((slider, index) => (
          <div
            key={slider._id}
            className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-violet-100">
              {slider.image ? (
                <img
                  src={slider.image}
                  alt={slider.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-indigo-300" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${slider.status === 'active'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground'
                  }`}>
                  {slider.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 transition-colors">
                {slider.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {slider.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Order: {slider.order + 1}
                </span>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReorder(slider._id, 'up')}
                    disabled={index === 0}
                    className="p-2 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleReorder(slider._id, 'down')}
                    disabled={index === filteredSliders.length - 1}
                    className="p-2 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(slider._id)}
                    className={`p-2 rounded-lg transition-colors ${slider.status === 'active'
                      ? 'bg-amber-100 hover:bg-amber-200'
                      : 'bg-emerald-100 hover:bg-emerald-200'
                      }`}
                    title={slider.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/slider/${slider._id}/edit`)}
                    className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(slider._id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
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
          <h3 className="text-xl font-semibold text-foreground mb-2">No sliders found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add your first slider to showcase on homepage'
            }
          </p>
        </div>
      )}
    </div>
  );
}
